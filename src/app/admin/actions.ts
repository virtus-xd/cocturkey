"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Result = { ok: true } | { ok: false; error: string };

export async function resolveReport(id: string, action: "RESOLVE" | "DISMISS"): Promise<Result> {
  await requireRole(["MODERATOR", "ADMIN"]);
  await prisma.report.update({
    where: { id },
    data: {
      status: action === "RESOLVE" ? "RESOLVED" : "DISMISSED",
      resolvedAt: new Date(),
    },
  });
  revalidatePath("/admin/raporlar");
  return { ok: true };
}

export async function setClanListingStatus(
  id: string,
  status: "ACTIVE" | "BANNED",
): Promise<Result> {
  await requireRole(["MODERATOR", "ADMIN"]);
  await prisma.clanListing.update({ where: { id }, data: { status } });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/klanlar");
  return { ok: true };
}

export async function setPlayerListingStatus(
  id: string,
  status: "ACTIVE" | "BANNED",
): Promise<Result> {
  await requireRole(["MODERATOR", "ADMIN"]);
  await prisma.playerListing.update({ where: { id }, data: { status } });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/oyuncular");
  return { ok: true };
}
