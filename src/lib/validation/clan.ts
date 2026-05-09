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

export const createClanListingSchema = z.object({
  clanTag: clanTagSchema,
  customDescription: z
    .string()
    .max(2000, "Tanıtım yazısı en fazla 2000 karakter olabilir.")
    .optional(),
  language: z.string().default("tr"),
  timezone: z.string().default("Europe/Istanbul"),
  activeHours: z
    .string()
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Saat aralığı `HH:MM-HH:MM` biçiminde olmalı.")
    .optional(),
  discordInvite: z.string().url().optional().or(z.literal("")),
  whatsappLink: z.string().url().optional().or(z.literal("")),
  telegramLink: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
});

export type CreateClanListingInput = z.infer<typeof createClanListingSchema>;

export const clanListFiltersSchema = z.object({
  minTH: z.coerce.number().int().min(1).max(17).optional(),
  maxTH: z.coerce.number().int().min(1).max(17).optional(),
  warFrequency: warFrequencyEnum.optional(),
  language: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
});

export type ClanListFilters = z.infer<typeof clanListFiltersSchema>;
