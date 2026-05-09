"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CLAN_REFRESH_COOLDOWN_MS } from "@/lib/constants";
import { cocClient, cocErrorToUserMessage } from "@/lib/coc/client";
import { mapWarFrequency } from "@/lib/coc/mappers";
import { createApplicationSchema } from "@/lib/validation/clan";

type ApplyResult = { ok: true } | { ok: false; error: string };

export async function applyToClan(formData: FormData): Promise<ApplyResult> {
  const session = await requireSession();

  const parsed = createApplicationSchema.safeParse({
    clanListingId: formData.get("clanListingId"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Form hatalı." };
  }

  const listing = await prisma.clanListing.findUnique({
    where: { id: parsed.data.clanListingId },
    select: { id: true, ownerId: true, status: true, clanTag: true },
  });
  if (!listing || listing.status !== "ACTIVE") {
    return { ok: false, error: "İlan bulunamadı veya pasif." };
  }
  if (listing.ownerId === session.app.id) {
    return { ok: false, error: "Kendi ilanına başvuramazsın." };
  }

  try {
    await prisma.application.create({
      data: {
        applicantId: session.app.id,
        clanListingId: listing.id,
        message: parsed.data.message,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" // unique constraint
    ) {
      return { ok: false, error: "Bu klana zaten başvurmuşsun." };
    }
    throw e;
  }

  revalidatePath(`/klanlar/${encodeURIComponent(listing.clanTag)}`);
  return { ok: true };
}

type RefreshResult = { ok: true } | { ok: false; error: string };

/** Klan sahibi "yenile" butonuna bastığında: CoC API'den taze veri çek. */
export async function refreshClanData(clanListingId: string): Promise<RefreshResult> {
  const session = await requireSession();

  const listing = await prisma.clanListing.findUnique({
    where: { id: clanListingId },
    select: { id: true, ownerId: true, clanTag: true, lastSyncedAt: true },
  });
  if (!listing) return { ok: false, error: "İlan bulunamadı." };
  if (listing.ownerId !== session.app.id) {
    return { ok: false, error: "Sadece klan sahibi yenileyebilir." };
  }

  const elapsed = Date.now() - listing.lastSyncedAt.getTime();
  if (elapsed < CLAN_REFRESH_COOLDOWN_MS) {
    const minutesLeft = Math.ceil((CLAN_REFRESH_COOLDOWN_MS - elapsed) / 60_000);
    return { ok: false, error: `Yenilemek için ${minutesLeft} dakika daha bekle.` };
  }

  try {
    const clan = await cocClient.getClan(listing.clanTag, { forceRefresh: true });
    await prisma.clanListing.update({
      where: { id: listing.id },
      data: {
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
      },
    });
    revalidatePath(`/klanlar/${encodeURIComponent(listing.clanTag)}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: cocErrorToUserMessage(e) };
  }
}
