import { z } from "zod";

export const reportReasonEnum = z.enum([
  "SPAM",
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "FAKE_INFO",
  "SCAM",
  "OTHER",
]);

export type ReportReason = z.infer<typeof reportReasonEnum>;

export const REPORT_REASON_LABELS_TR: Record<ReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Taciz / hakaret",
  INAPPROPRIATE_CONTENT: "Uygunsuz içerik",
  FAKE_INFO: "Yanıltıcı / sahte bilgi",
  SCAM: "Dolandırıcılık",
  OTHER: "Diğer",
};

export const createReportSchema = z
  .object({
    clanListingId: z.string().min(1).optional(),
    playerListingId: z.string().min(1).optional(),
    reason: reportReasonEnum,
    details: z.string().trim().max(500, "Açıklama en fazla 500 karakter.").optional().or(z.literal("")),
  })
  .refine((d) => Boolean(d.clanListingId) !== Boolean(d.playerListingId), {
    message: "Tek bir hedef belirtilmeli (klan veya oyuncu).",
  });

export type CreateReportInput = z.infer<typeof createReportSchema>;
