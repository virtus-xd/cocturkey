// Oyuncu ilanı zod şeması.

import { z } from "zod";

import { CLAN_TAG_REGEX, TH_LEVEL } from "@/lib/constants";

import { warFrequencyEnum } from "./clan";

export const playerTagSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(CLAN_TAG_REGEX, "Geçerli bir oyuncu etiketi girin (örn. #ABC123).");

const optionalUrl = z.string().trim().url("Geçerli bir bağlantı gir.").optional().or(z.literal(""));

export const createPlayerListingSchema = z.object({
  cocPlayerTag: playerTagSchema.optional().or(z.literal("")),
  ingameName: z.string().trim().min(2, "İsim en az 2 karakter.").max(40),
  thLevel: z.coerce.number().int().min(TH_LEVEL.min).max(TH_LEVEL.max),
  trophies: z.coerce.number().int().min(0).max(8000),
  bio: z.string().trim().max(1000, "Maks 1000 karakter.").optional().or(z.literal("")),
  preferredWarFreq: warFrequencyEnum.default("ANY"),
  preferredLanguage: z.string().min(2).max(5).default("tr"),
  timezone: z.string().min(1).default("Europe/Istanbul"),
  activeHours: z
    .string()
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Saat aralığı `HH:MM-HH:MM` biçiminde olmalı.")
    .optional()
    .or(z.literal("")),
  lookingFor: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  // Hero level'ları opsiyonel ve serbest yapı
  heroLevels: z
    .object({
      BK: z.coerce.number().int().min(0).max(100).optional(),
      AQ: z.coerce.number().int().min(0).max(100).optional(),
      GW: z.coerce.number().int().min(0).max(100).optional(),
      RC: z.coerce.number().int().min(0).max(100).optional(),
    })
    .optional(),
  contactDiscord: optionalUrl, // mesajlaşma alt sistemi yerine basit bağlantı
});

export type CreatePlayerListingInput = z.infer<typeof createPlayerListingSchema>;

export const playerListFiltersSchema = z.object({
  minTH: z.coerce.number().int().min(1).max(17).optional(),
  maxTH: z.coerce.number().int().min(1).max(17).optional(),
  minTrophies: z.coerce.number().int().min(0).max(8000).optional(),
  preferredWarFreq: warFrequencyEnum.optional(),
  language: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
});

export type PlayerListFilters = z.infer<typeof playerListFiltersSchema>;
