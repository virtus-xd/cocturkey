"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { LISTING_BUMP_COOLDOWN_MS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { isValidDiscordWebhook } from "@/lib/notifications/discord";

type Result = { ok: true } | { ok: false; error: string };

export async function saveDiscordWebhook(formData: FormData): Promise<Result> {
  const session = await requireSession();
  const raw = (formData.get("discordWebhookUrl") as string | null)?.trim() ?? "";
  if (raw.length === 0) {
    await prisma.user.update({
      where: { id: session.app.id },
      data: { discordWebhookUrl: null },
    });
    revalidatePath("/profil");
    return { ok: true };
  }
  if (!isValidDiscordWebhook(raw)) {
    return {
      ok: false,
      error:
        "Geçerli bir Discord webhook URL'i değil. discord.com/api/webhooks/... biçiminde olmalı.",
    };
  }
  await prisma.user.update({
    where: { id: session.app.id },
    data: { discordWebhookUrl: raw },
  });
  revalidatePath("/profil");
  return { ok: true };
}

export async function bumpClanListing(id: string): Promise<Result> {
  const session = await requireSession();
  const listing = await prisma.clanListing.findUnique({
    where: { id },
    select: { id: true, ownerId: true, bumpedAt: true, clanTag: true },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  const elapsed = Date.now() - listing.bumpedAt.getTime();
  if (elapsed < LISTING_BUMP_COOLDOWN_MS) {
    const hoursLeft = Math.ceil((LISTING_BUMP_COOLDOWN_MS - elapsed) / 3_600_000);
    return { ok: false, error: `Yenilemek için ${hoursLeft} saat daha bekle.` };
  }
  await prisma.clanListing.update({
    where: { id },
    data: { bumpedAt: new Date() },
  });
  revalidatePath("/klanlar");
  revalidatePath("/profil");
  return { ok: true };
}

export async function bumpPlayerListing(id: string): Promise<Result> {
  const session = await requireSession();
  const listing = await prisma.playerListing.findUnique({
    where: { id },
    select: { id: true, ownerId: true, bumpedAt: true },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  const elapsed = Date.now() - listing.bumpedAt.getTime();
  if (elapsed < LISTING_BUMP_COOLDOWN_MS) {
    const hoursLeft = Math.ceil((LISTING_BUMP_COOLDOWN_MS - elapsed) / 3_600_000);
    return { ok: false, error: `Yenilemek için ${hoursLeft} saat daha bekle.` };
  }
  await prisma.playerListing.update({
    where: { id },
    data: { bumpedAt: new Date() },
  });
  revalidatePath("/oyuncular");
  revalidatePath("/profil");
  return { ok: true };
}

export async function pauseClanListing(id: string): Promise<Result> {
  const session = await requireSession();
  const listing = await prisma.clanListing.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  await prisma.clanListing.update({ where: { id }, data: { status: "PAUSED" } });
  revalidatePath("/klanlar");
  revalidatePath("/profil");
  return { ok: true };
}

export async function resumeClanListing(id: string): Promise<Result> {
  const session = await requireSession();
  const listing = await prisma.clanListing.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  await prisma.clanListing.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/klanlar");
  revalidatePath("/profil");
  return { ok: true };
}
