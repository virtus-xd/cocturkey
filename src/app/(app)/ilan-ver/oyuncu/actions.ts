"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { cocClient, cocErrorToUserMessage } from "@/lib/coc/client";
import type { CocPlayerSummary } from "@/lib/coc/client";
import { normalizeCocTag } from "@/lib/coc/tag";
import { prisma } from "@/lib/db/prisma";
import { createPlayerListingSchema, playerTagSchema } from "@/lib/validation/player";

export type LookupPlayerResult =
  | { ok: true; player: CocPlayerSummary }
  | { ok: false; error: string };

/** Opsiyonel: oyuncu CoC etiketi varsa otomatik veri çek. */
export async function lookupPlayer(rawTag: string): Promise<LookupPlayerResult> {
  await requireSession("/ilan-ver/oyuncu");

  const normalized = normalizeCocTag(rawTag);
  if (!normalized) return { ok: false, error: "Geçersiz oyuncu etiketi." };

  const tagCheck = playerTagSchema.safeParse(normalized);
  if (!tagCheck.success) return { ok: false, error: "Geçersiz oyuncu etiketi." };

  try {
    const player = await cocClient.getPlayer(tagCheck.data);
    return { ok: true, player };
  } catch (e) {
    return { ok: false, error: cocErrorToUserMessage(e) };
  }
}

type CreateResult = { ok: true } | { ok: false; error: string };

export async function createPlayerListing(formData: FormData): Promise<CreateResult> {
  const session = await requireSession("/ilan-ver/oyuncu");

  const heroLevels = {
    BK: formData.get("hero.BK") || undefined,
    AQ: formData.get("hero.AQ") || undefined,
    GW: formData.get("hero.GW") || undefined,
    RC: formData.get("hero.RC") || undefined,
  };
  const hasAnyHero = Object.values(heroLevels).some((v) => v !== undefined);

  const raw = {
    cocPlayerTag: formData.get("cocPlayerTag") ?? "",
    ingameName: formData.get("ingameName"),
    thLevel: formData.get("thLevel"),
    trophies: formData.get("trophies"),
    bio: formData.get("bio") ?? "",
    preferredWarFreq: formData.get("preferredWarFreq") ?? "ANY",
    preferredLanguage: formData.get("preferredLanguage") ?? "tr",
    timezone: formData.get("timezone") ?? "Europe/Istanbul",
    activeHours: formData.get("activeHours") ?? "",
    contactDiscord: formData.get("contactDiscord") ?? "",
    lookingFor: formData
      .getAll("lookingFor")
      .map((v) => String(v).trim())
      .filter(Boolean),
    heroLevels: hasAnyHero ? heroLevels : undefined,
  };

  const parsed = createPlayerListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Form hatalı." };
  }
  const input = parsed.data;
  const playerTag = input.cocPlayerTag && input.cocPlayerTag.length > 0
    ? normalizeCocTag(input.cocPlayerTag)
    : null;

  // Aynı kullanıcı için aktif PlayerListing varsa onu güncelle (tek aktif ilan)
  const existing = await prisma.playerListing.findFirst({
    where: { ownerId: session.app.id, status: "ACTIVE" },
    select: { id: true },
  });

  const data = {
    ownerId: session.app.id,
    cocPlayerTag: playerTag,
    ingameName: input.ingameName,
    thLevel: input.thLevel,
    trophies: input.trophies,
    heroLevels: input.heroLevels ?? undefined,
    bio: input.bio && input.bio.length > 0 ? input.bio : null,
    preferredWarFreq: input.preferredWarFreq,
    preferredLanguage: input.preferredLanguage,
    timezone: input.timezone,
    activeHours: input.activeHours && input.activeHours.length > 0 ? input.activeHours : null,
    lookingFor: input.lookingFor,
    bumpedAt: new Date(),
  };

  let listingId: string;
  if (existing) {
    const updated = await prisma.playerListing.update({
      where: { id: existing.id },
      data,
      select: { id: true },
    });
    listingId = updated.id;
  } else {
    try {
      const created = await prisma.playerListing.create({ data, select: { id: true } });
      listingId = created.id;
    } catch (e) {
      // cocPlayerTag unique kontrolü
      console.error(e);
      return { ok: false, error: "İlan oluşturulamadı. Etiket başka biri tarafından kullanılıyor olabilir." };
    }
  }

  revalidatePath("/oyuncular");
  revalidatePath(`/oyuncular/${listingId}`);
  redirect(`/oyuncular/${listingId}?olustu=1`);
}
