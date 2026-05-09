// Klan listesi / detay sorguları. UI'dan ayrı tut ki test edilebilsin.

import { ListingStatus, Prisma } from "@prisma/client";

import { LISTINGS_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import type { ClanListFilters } from "@/lib/validation/clan";

export type ClanListItem = Awaited<ReturnType<typeof listClanListings>>["items"][number];

export async function listClanListings(filters: ClanListFilters) {
  const where: Prisma.ClanListingWhereInput = {
    status: ListingStatus.ACTIVE,
  };

  if (filters.minTH !== undefined) {
    where.requiredTH = { ...(where.requiredTH as object), gte: filters.minTH };
  }
  if (filters.maxTH !== undefined) {
    where.requiredTH = { ...(where.requiredTH as object), lte: filters.maxTH };
  }
  if (filters.warFrequency) {
    where.warFrequency = filters.warFrequency;
  }
  if (filters.language) {
    where.language = filters.language;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search.toLowerCase() } },
    ];
  }

  const items = await prisma.clanListing.findMany({
    where,
    orderBy: [{ bumpedAt: "desc" }, { id: "desc" }],
    take: LISTINGS_PAGE_SIZE + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      clanTag: true,
      name: true,
      level: true,
      trophies: true,
      memberCount: true,
      requiredTH: true,
      requiredTrophies: true,
      warFrequency: true,
      warWinStreak: true,
      warWins: true,
      badgeUrl: true,
      customDescription: true,
      language: true,
      activeHours: true,
      tags: true,
      bumpedAt: true,
    },
  });

  let nextCursor: string | null = null;
  if (items.length > LISTINGS_PAGE_SIZE) {
    const next = items.pop()!;
    nextCursor = next.id;
  }

  return { items, nextCursor };
}

export async function getClanListingByTag(clanTag: string) {
  return prisma.clanListing.findUnique({
    where: { clanTag },
    include: {
      owner: {
        select: { id: true, username: true, isVerified: true },
      },
      _count: { select: { applications: true } },
    },
  });
}

/** Her görüntülemede view counter'ı +1 yapar (fire-and-forget). */
export async function bumpClanViewCount(clanListingId: string) {
  await prisma.clanListing
    .update({
      where: { id: clanListingId },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      /* yutulur — analytics fail olursa kullanıcı etkilenmesin */
    });
}
