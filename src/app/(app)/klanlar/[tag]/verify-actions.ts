"use server";

import { checkVerificationCode, requestVerificationCode } from "@/lib/verify/clan-tag";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export async function requestCodeAction(clanListingId: string) {
  return requestVerificationCode(clanListingId);
}

export async function checkCodeAction(clanListingId: string) {
  const result = await checkVerificationCode(clanListingId);
  if (result.ok) {
    const listing = await prisma.clanListing.findUnique({
      where: { id: clanListingId },
      select: { clanTag: true },
    });
    if (listing) revalidatePath(`/klanlar/${encodeURIComponent(listing.clanTag)}`);
  }
  return result;
}
