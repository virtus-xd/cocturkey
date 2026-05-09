// Klan ilanı zod şeması — frontend ve API arasında paylaşılan tek doğrulama.
// CLAUDE.md §3: "zod (frontend ile paylaşılan şemalar)".

import { z } from "zod";

import { CLAN_TAG_REGEX } from "@/lib/constants";

export const warFrequencyEnum = z.enum([
  "ALWAYS",
  "MORE_THAN_ONCE_PER_WEEK",
  "ONCE_PER_WEEK",
  "LESS_THAN_ONCE_PER_WEEK",
  "NEVER",
  "ANY",
  "UNKNOWN",
]);

export const clanTagSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(CLAN_TAG_REGEX, "Geçerli bir klan etiketi girin (örn. #2PP).");

const optionalUrl = z
  .string()
  .trim()
  .url("Geçerli bir bağlantı gir (https:// ile başlamalı).")
  .optional()
  .or(z.literal(""));

export const createClanListingSchema = z.object({
  clanTag: clanTagSchema,
  customDescription: z
    .string()
    .trim()
    .max(2000, "Tanıtım yazısı en fazla 2000 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  language: z.string().min(2).max(5).default("tr"),
  timezone: z.string().min(1).default("Europe/Istanbul"),
  activeHours: z
    .string()
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Saat aralığı `HH:MM-HH:MM` biçiminde olmalı.")
    .optional()
    .or(z.literal("")),
  discordInvite: optionalUrl,
  whatsappLink: optionalUrl,
  telegramLink: optionalUrl,
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
});

export type CreateClanListingInput = z.infer<typeof createClanListingSchema>;

export const clanListFiltersSchema = z.object({
  minTH: z.coerce.number().int().min(1).max(17).optional(),
  maxTH: z.coerce.number().int().min(1).max(17).optional(),
  minTrophies: z.coerce.number().int().min(0).max(80_000).optional(),
  warFrequency: warFrequencyEnum.optional(),
  language: z.string().optional(),
  tag: z.string().trim().max(30).optional(), // tek etiket filtresi
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
});

export type ClanListFilters = z.infer<typeof clanListFiltersSchema>;

/** Başvuru oluşturma şeması. */
export const createApplicationSchema = z.object({
  clanListingId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(10, "Mesaj en az 10 karakter olmalı.")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir."),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
