import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 3600; // saatte bir sitemap'i yenile

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, priority: 1, changeFrequency: "daily" },
    { url: `${SITE.url}/klanlar`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${SITE.url}/oyuncular`, priority: 0.7, changeFrequency: "hourly" },
    { url: `${SITE.url}/hakkinda`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${SITE.url}/gizlilik`, priority: 0.3, changeFrequency: "monthly" },
    { url: `${SITE.url}/kvkk`, priority: 0.3, changeFrequency: "monthly" },
    { url: `${SITE.url}/sartlar`, priority: 0.3, changeFrequency: "monthly" },
  ];

  // Dinamik klan ilanları — DB yoksa sessizce statik liste döner.
  // Build-time'da DATABASE_URL henüz olmayabilir; Proxy throw eder, biz tutarız.
  let clans: Array<{ clanTag: string; updatedAt: Date }> = [];
  let players: Array<{ id: string; updatedAt: Date }> = [];
  try {
    [clans, players] = await Promise.all([
      prisma.clanListing.findMany({
        where: { status: "ACTIVE" },
        select: { clanTag: true, updatedAt: true },
        orderBy: { bumpedAt: "desc" },
        take: 5000,
      }),
      prisma.playerListing.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, updatedAt: true },
        orderBy: { bumpedAt: "desc" },
        take: 5000,
      }),
    ]);
  } catch {
    /* DB henüz hazır değil ya da bağlantı patladı — sadece statik harita */
  }

  const clanEntries: MetadataRoute.Sitemap = clans.map((c) => ({
    url: `${SITE.url}/klanlar/${encodeURIComponent(c.clanTag)}`,
    lastModified: c.updatedAt,
    priority: 0.6,
    changeFrequency: "weekly",
  }));

  const playerEntries: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${SITE.url}/oyuncular/${p.id}`,
    lastModified: p.updatedAt,
    priority: 0.5,
    changeFrequency: "weekly",
  }));

  return [...staticEntries, ...clanEntries, ...playerEntries];
}
