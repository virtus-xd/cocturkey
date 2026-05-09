"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { cocClient, cocErrorToUserMessage } from "@/lib/coc/client";
import type { CocClanSummary } from "@/lib/coc/client";
import { mapWarFrequency } from "@/lib/coc/mappers";
import { normalizeCocTag } from "@/lib/coc/tag";
import { prisma } from "@/lib/db/prisma";
import { createClanListingSchema, clanTagSchema } from "@/lib/validation/clan";

export type LookupResult =
  | { ok: true; clan: CocClanSummary }
  | { ok: false; error: string };

/** Sadece clan tag → CoC verisi çeker. Henüz DB'ye yazmaz. */
export async function lookupClan(rawTag: string): Promise<LookupResult> {
  await requireSession("/ilan-ver");

  const normalized = normalizeCocTag(rawTag);
  if (!normalized) return { ok: false, error: "Geçersiz klan etiketi." };

  const tagCheck = clanTagSchema.safeParse(normalized);
  if (!tagCheck.success) return { ok: false, error: "Geçersiz klan etiketi." };

  try {
    const clan = await cocClient.getClan(tagCheck.data);
    return { ok: true, clan };
  } catch (e) {
    return { ok: false, error: cocErrorToUserMessage(e) };
  }
}

export type CreateResult = { ok: true; tag: string } | { ok: false; error: string };

/**
 * İlanı yayınlar. Server-side'da CoC API'ye yeniden sorgu atılır
 * (client'ın gönderdiği klan verisine güvenmiyoruz).
 */
export async function createClanListing(formData: FormData): Promise<CreateResult> {
  const session = await requireSession("/ilan-ver");

  const raw = {
    clanTag: formData.get("clanTag"),
    customDescription: formData.get("customDescription") ?? "",
    language: formData.get("language") ?? "tr",
    timezone: formData.get("timezone") ?? "Europe/Istanbul",
    activeHours: formData.get("activeHours") ?? "",
    discordInvite: formData.get("discordInvite") ?? "",
    whatsappLink: formData.get("whatsappLink") ?? "",
    telegramLink: formData.get("telegramLink") ?? "",
    tags: formData
      .getAll("tags")
      .map((v) => String(v).trim())
      .filter(Boolean),
  };

  const parsed = createClanListingSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Form hatalı." };
  }

  const input = parsed.data;

  // Daha önce başka bir kullanıcı bu klan için ilan açmışsa engelle.
  const existing = await prisma.clanListing.findUnique({
    where: { clanTag: input.clanTag },
    select: { id: true, ownerId: true },
  });
  if (existing && existing.ownerId !== session.app.id) {
    return {
      ok: false,
      error:
        "Bu klan için başka bir kullanıcı ilan açmış. Klanın senin olduğunu düşünüyorsan iletişime geç.",
    };
  }

  // Server tarafında doğrulama: CoC API'den taze veri al.
  let clan;
  try {
    clan = await cocClient.getClan(input.clanTag, { forceRefresh: true });
  } catch (e) {
    return { ok: false, error: cocErrorToUserMessage(e) };
  }

  // Boş string'leri null'a çevir (Prisma `?` alanları için).
  const nullify = (v: string | undefined) => (v && v.length > 0 ? v : null);

  const data = {
    ownerId: session.app.id,
    clanTag: input.clanTag,
    name: clan.name,
    level: clan.clanLevel,
    description: clan.description ?? null,
    trophies: clan.clanPoints,
    warFrequency: mapWarFrequency(clan.warFrequency),
    warWinStreak: clan.warWinStreak,
    warWins: clan.warWins,
    memberCount: clan.members,
    requiredTH: clan.requiredTownhallLevel ?? 1,
    requiredTrophies: clan.requiredTrophies ?? 0,
    badgeUrl: clan.badgeUrls?.medium ?? clan.badgeUrls?.small ?? null,
    lastSyncedAt: new Date(),
    customDescription: nullify(input.customDescription),
    language: input.language,
    timezone: input.timezone,
    activeHours: nullify(input.activeHours),
    discordInvite: nullify(input.discordInvite),
    whatsappLink: nullify(input.whatsappLink),
    telegramLink: nullify(input.telegramLink),
    tags: input.tags,
    bumpedAt: new Date(),
  };

  if (existing) {
    await prisma.clanListing.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.clanListing.create({ data });
  }

  revalidatePath("/klanlar");
  revalidatePath(`/klanlar/${encodeURIComponent(input.clanTag)}`);
  redirect(`/klanlar/${encodeURIComponent(input.clanTag)}?olustu=1`);
}
