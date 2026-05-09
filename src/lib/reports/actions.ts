"use server";

import { requireSession } from "@/lib/auth/session";
import { REPORT_PER_HOUR } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createReportSchema } from "@/lib/validation/report";

type Result = { ok: true } | { ok: false; error: string };

export async function createReport(formData: FormData): Promise<Result> {
  const session = await requireSession();

  const parsed = createReportSchema.safeParse({
    clanListingId: (formData.get("clanListingId") as string | null) || undefined,
    playerListingId: (formData.get("playerListingId") as string | null) || undefined,
    reason: formData.get("reason"),
    details: formData.get("details") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Form hatalı." };
  }

  // Spam koruması: saat başına en fazla N şikayet
  const oneHourAgo = new Date(Date.now() - 3_600_000);
  const recentCount = await prisma.report.count({
    where: { reporterId: session.app.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= REPORT_PER_HOUR) {
    return { ok: false, error: "Çok fazla şikayet. Bir saat sonra tekrar dene." };
  }

  // Aynı hedefe duplicate açık şikayet engeli
  const existingOpen = await prisma.report.findFirst({
    where: {
      reporterId: session.app.id,
      status: "OPEN",
      OR: [
        parsed.data.clanListingId ? { clanListingId: parsed.data.clanListingId } : {},
        parsed.data.playerListingId ? { playerListingId: parsed.data.playerListingId } : {},
      ].filter((c) => Object.keys(c).length > 0),
    },
  });
  if (existingOpen) {
    return { ok: false, error: "Bu içerik için zaten açık bir şikayetin var." };
  }

  await prisma.report.create({
    data: {
      reporterId: session.app.id,
      clanListingId: parsed.data.clanListingId ?? null,
      playerListingId: parsed.data.playerListingId ?? null,
      reason: parsed.data.reason,
      details: parsed.data.details && parsed.data.details.length > 0 ? parsed.data.details : null,
    },
  });

  return { ok: true };
}
