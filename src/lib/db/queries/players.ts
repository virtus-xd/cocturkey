// Oyuncu ilanı sorguları.

import { ListingStatus, Prisma } from "@prisma/client";

import { LISTINGS_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import type { PlayerListFilters } from "@/lib/validation/player";

export type PlayerListItem = Awaited<ReturnType<typeof listPlayerListings>>["items"][number];

export async function listPlayerListings(filters: PlayerListFilters) {
  const where: Prisma.PlayerListingWhereInput = {
    status: ListingStatus.ACTIVE,
  };

  if (filters.minTH !== undefined) {
    where.thLevel = { ...(where.thLevel as object), gte: filters.minTH };
  }
  if (filters.maxTH !== undefined) {
    where.thLevel = { ...(where.thLevel as object), lte: filters.maxTH };
  }
  if (filters.minTrophies !== undefined) {
    where.trophies = { gte: filters.minTrophies };
  }
  if (filters.preferredWarFreq) {
    where.preferredWarFreq = filters.preferredWarFreq;
  }
  if (filters.language) {
    where.preferredLanguage = filters.language;
  }
  if (filters.search) {
    where.OR = [
      { ingameName: { contains: filters.search, mode: "insensitive" } },
      { lookingFor: { has: filters.search.toLowerCase() } },
    ];
  }

  const items = await prisma.playerListing.findMany({
    where,
    orderBy: [{ bumpedAt: "desc" }, { id: "desc" }],
    take: LISTINGS_PAGE_SIZE + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      cocPlayerTag: true,
      ingameName: true,
      thLevel: true,
      trophies: true,
      bio: true,
      preferredWarFreq: true,
      preferredLanguage: true,
      activeHours: true,
      lookingFor: true,
      heroLevels: true,
      bumpedAt: true,
    },
  });

  let nextCursor: string | null = null;
  if (items.length > LISTINGS_PAGE_SIZE) {
    const next = items.pop()!;
    nextCursor = next.id;
  }

  return { items, nextCursor };
}

export async function getPlayerListing(id: string) {
  return prisma.playerListing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true, isVerified: true, discordId: true } },
    },
  });
}
