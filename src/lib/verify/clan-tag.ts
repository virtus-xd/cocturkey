// Klan tag doğrulama akışı.
// 1. Kullanıcı `requestVerificationCode` çağırır → 6 karakterlik kod üretilir,
//    DB'ye 30dk geçerlilikle yazılır, kullanıcıya gösterilir.
// 2. Kullanıcı kodu oyun içi klan açıklamasına yapıştırır.
// 3. `checkVerificationCode` çağırır → CoC API'den klan açıklaması çekilir,
//    kod var mı bakılır. Varsa verifiedAt set edilir.

import { randomBytes } from "node:crypto";

import { requireSession } from "@/lib/auth/session";
import { cocClient, cocErrorToUserMessage } from "@/lib/coc/client";
import { prisma } from "@/lib/db/prisma";

const CODE_TTL_MS = 30 * 60 * 1000; // 30 dakika

function generateCode(): string {
  // İnsan dostu karakterler (harf-rakam karışıklığı yok)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
  return `KLN-${out}`;
}

type Result = { ok: true; code: string; expiresAt: Date } | { ok: false; error: string };

export async function requestVerificationCode(clanListingId: string): Promise<Result> {
  const session = await requireSession();
  const listing = await prisma.clanListing.findUnique({
    where: { id: clanListingId },
    select: { ownerId: true, verificationCode: true, verificationExpiresAt: true },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  // Hâlâ geçerli kod varsa onu döndür
  if (
    listing.verificationCode &&
    listing.verificationExpiresAt &&
    listing.verificationExpiresAt.getTime() > Date.now()
  ) {
    return {
      ok: true,
      code: listing.verificationCode,
      expiresAt: listing.verificationExpiresAt,
    };
  }
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await prisma.clanListing.update({
    where: { id: clanListingId },
    data: { verificationCode: code, verificationExpiresAt: expiresAt },
  });
  return { ok: true, code, expiresAt };
}

type VerifyResult = { ok: true } | { ok: false; error: string };

export async function checkVerificationCode(clanListingId: string): Promise<VerifyResult> {
  const session = await requireSession();
  const listing = await prisma.clanListing.findUnique({
    where: { id: clanListingId },
    select: {
      ownerId: true,
      clanTag: true,
      verificationCode: true,
      verificationExpiresAt: true,
    },
  });
  if (!listing || listing.ownerId !== session.app.id) {
    return { ok: false, error: "İlan bulunamadı." };
  }
  if (
    !listing.verificationCode ||
    !listing.verificationExpiresAt ||
    listing.verificationExpiresAt.getTime() < Date.now()
  ) {
    return { ok: false, error: "Doğrulama kodu yok veya süresi dolmuş. Yeni kod oluştur." };
  }

  let clan;
  try {
    clan = await cocClient.getClan(listing.clanTag, { forceRefresh: true });
  } catch (e) {
    return { ok: false, error: cocErrorToUserMessage(e) };
  }

  const description = clan.description ?? "";
  if (!description.includes(listing.verificationCode)) {
    return {
      ok: false,
      error: "Kodu klan açıklamasında bulamadık. Yapıştırdığından emin ol, sonra tekrar dene.",
    };
  }

  await prisma.clanListing.update({
    where: { id: clanListingId },
    data: {
      verifiedAt: new Date(),
      verificationCode: null,
      verificationExpiresAt: null,
    },
  });
  // Kullanıcı seviyesinde de doğrulanmış işareti
  await prisma.user.update({
    where: { id: session.app.id },
    data: { isVerified: true },
  });
  return { ok: true };
}
