// COC_PROXY_URL ayarlanmamışken kullanılan fixture verisi.
// Geliştiricinin dış servis kurulumu olmadan akışı denemesi için.
// Üretimde KESİNLİKLE çalışmaz — `client.ts` içinde NODE_ENV kontrol ediliyor.

import type { CocClanSummary, CocPlayerSummary } from "./client";

export const MOCK_CLANS: Record<string, CocClanSummary> = {
  "#TR2025": {
    tag: "#TR2025",
    name: "Anadolu Kartalları",
    clanLevel: 18,
    description:
      "Aktif, war odaklı, küfürsüz bir aile. CWL Master 1. TH13+ aranır. Discord zorunlu.",
    badgeUrls: { medium: "https://placehold.co/96?text=AK" },
    warFrequency: "MORE_THAN_ONCE_PER_WEEK",
    warWinStreak: 4,
    warWins: 312,
    members: 47,
    clanPoints: 38_400,
    requiredTownhallLevel: 13,
    requiredTrophies: 3500,
  },
  "#TRCAS": {
    tag: "#TRCAS",
    name: "İstanbul Casual",
    clanLevel: 9,
    description: "Rahat, savaşa zorlanmayan klan. TH 10+, Türkçe konuş, eğlen.",
    badgeUrls: { medium: "https://placehold.co/96?text=IC" },
    warFrequency: "ONCE_PER_WEEK",
    warWinStreak: 0,
    warWins: 87,
    members: 32,
    clanPoints: 21_300,
    requiredTownhallLevel: 10,
    requiredTrophies: 1800,
  },
  "#TRBLDR": {
    tag: "#TRBLDR",
    name: "Builder Base TR",
    clanLevel: 5,
    description: "Builder Base ağırlıklı. CWL'siz, donate yoğun.",
    badgeUrls: { medium: "https://placehold.co/96?text=BB" },
    warFrequency: "LESS_THAN_ONCE_PER_WEEK",
    warWinStreak: 0,
    warWins: 12,
    members: 18,
    clanPoints: 14_900,
    requiredTownhallLevel: 11,
    requiredTrophies: 2500,
  },
};

export const MOCK_PLAYERS: Record<string, CocPlayerSummary> = {
  "#TRPL1": {
    tag: "#TRPL1",
    name: "ErdemTR",
    townHallLevel: 14,
    trophies: 4920,
    bestTrophies: 5310,
    heroes: [
      { name: "Barbarian King", level: 75, village: "home" },
      { name: "Archer Queen", level: 80, village: "home" },
      { name: "Grand Warden", level: 55, village: "home" },
    ],
  },
};

export function getMockClan(tag: string): CocClanSummary | null {
  return MOCK_CLANS[tag] ?? null;
}

export function getMockPlayer(tag: string): CocPlayerSummary | null {
  return MOCK_PLAYERS[tag] ?? null;
}
