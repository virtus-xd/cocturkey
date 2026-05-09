// Demo seed verisi. `pnpm db:seed` ile çalışır.
// Idempotent: upsert ile çalışır, defalarca koşmak güvenlidir.
//
// Kullanım sırası: önce Supabase + Prisma migrate kurulumu, sonra bu seed.
// Üretimde (NODE_ENV=production) çalıştırma — gerçek kullanıcı verisini ezme riski.

import { ListingStatus, PrismaClient, UserRole, WarFrequency } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "erdemoz2003@gmail.com";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed üretimde çalıştırılamaz.");
  }

  console.log("🌱 Demo veri oluşturuluyor…");

  // ─── Kullanıcılar ─────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: UserRole.ADMIN, isVerified: true },
    create: {
      id: "demo-admin",
      email: ADMIN_EMAIL,
      username: "yonetici",
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  const owners = await Promise.all([
    upsertUser("demo-owner-1", "lider1@demo.local", "anadoluKartali"),
    upsertUser("demo-owner-2", "lider2@demo.local", "istanbulCasual"),
    upsertUser("demo-owner-3", "lider3@demo.local", "builderTR"),
    upsertUser("demo-owner-4", "lider4@demo.local", "egeFatihler"),
    upsertUser("demo-owner-5", "lider5@demo.local", "izmirGladyator"),
  ]);

  const players = await Promise.all([
    upsertUser("demo-player-1", "oyuncu1@demo.local", "erdemTR"),
    upsertUser("demo-player-2", "oyuncu2@demo.local", "AceTR"),
    upsertUser("demo-player-3", "oyuncu3@demo.local", "buyukbiraderim"),
  ]);

  // ─── Klan ilanları ────────────────────────────────────
  const clans: Array<Parameters<typeof upsertClanListing>[0]> = [
    {
      ownerId: owners[0].id,
      clanTag: "#TR2025",
      name: "Anadolu Kartalları",
      level: 18,
      description:
        "Aktif, war odaklı, küfürsüz bir aile. CWL Master 1. TH13+ aranır. Discord zorunlu.",
      trophies: 38_400,
      warFrequency: WarFrequency.MORE_THAN_ONCE_PER_WEEK,
      warWinStreak: 4,
      warWins: 312,
      memberCount: 47,
      requiredTH: 13,
      requiredTrophies: 3500,
      customDescription:
        "Yetişkin ortam. Her CWL Master'da. Donate hızı yüksek. Discord'da haftalık voice.",
      activeHours: "20:00-23:00",
      tags: ["aile-dostu", "rekabetçi", "war-odaklı", "cwl-master", "discord-zorunlu"],
      verified: true,
    },
    {
      ownerId: owners[1].id,
      clanTag: "#TRCAS",
      name: "İstanbul Casual",
      level: 9,
      description: "Rahat, savaşa zorlanmayan klan. TH 10+, Türkçe konuş, eğlen.",
      trophies: 21_300,
      warFrequency: WarFrequency.ONCE_PER_WEEK,
      warWinStreak: 0,
      warWins: 87,
      memberCount: 32,
      requiredTH: 10,
      requiredTrophies: 1800,
      customDescription:
        "İş güç sahipleri için rahat tempo. Haftada 1 war yeter. Sosyal sohbet ön planda.",
      activeHours: "21:00-00:00",
      tags: ["casual", "yetişkin", "sıfır-küfür"],
    },
    {
      ownerId: owners[2].id,
      clanTag: "#TRBLDR",
      name: "Builder Base TR",
      level: 5,
      description: "Builder Base ağırlıklı. CWL'siz, donate yoğun.",
      trophies: 14_900,
      warFrequency: WarFrequency.LESS_THAN_ONCE_PER_WEEK,
      warWinStreak: 0,
      warWins: 12,
      memberCount: 18,
      requiredTH: 11,
      requiredTrophies: 2500,
      customDescription:
        "Builder Base'i seven, donate yapmayı önemseyen oyuncular için. Tribe wars yok.",
      tags: ["donate-yoğun"],
    },
    {
      ownerId: owners[3].id,
      clanTag: "#EGE99",
      name: "Ege Fatihleri",
      level: 14,
      description: "İzmirli kanka klanı. Sürekli war.",
      trophies: 28_200,
      warFrequency: WarFrequency.ALWAYS,
      warWinStreak: 9,
      warWins: 198,
      memberCount: 42,
      requiredTH: 12,
      requiredTrophies: 2800,
      customDescription: "Sürekli war modu. CWL Crystal 1. Aktif kalmazsan çıkarılırsın, uyaralım.",
      activeHours: "19:00-22:00",
      tags: ["rekabetçi", "war-odaklı"],
      verified: true,
    },
    {
      ownerId: owners[4].id,
      clanTag: "#GLAD",
      name: "İzmir Gladyator",
      level: 21,
      description: "TH16+ hardcore. Tek hedef: legendary lig.",
      trophies: 52_100,
      warFrequency: WarFrequency.MORE_THAN_ONCE_PER_WEEK,
      warWinStreak: 12,
      warWins: 421,
      memberCount: 50,
      requiredTH: 16,
      requiredTrophies: 5000,
      customDescription:
        "Sadece TH16+. Legendary'ye iniyoruz, CWL Champion 1. Donate eksiksiz, attack zorunlu.",
      activeHours: "21:00-01:00",
      tags: ["rekabetçi", "yetişkin", "th15+", "discord-zorunlu"],
      verified: true,
    },
  ];

  for (const c of clans) await upsertClanListing(c);

  // ─── Oyuncu ilanları ──────────────────────────────────
  await upsertPlayerListing({
    ownerId: players[0].id,
    cocPlayerTag: "#TRPL1",
    ingameName: "ErdemTR",
    thLevel: 14,
    trophies: 4920,
    bio: "TH14, BK 75 / AQ 80 / GW 55. Aktif war atarım, küfürsüz ortam isterim. Akşam 20-23 arası en aktif.",
    preferredWarFreq: WarFrequency.MORE_THAN_ONCE_PER_WEEK,
    activeHours: "20:00-23:00",
    lookingFor: ["war-clan", "yetişkin", "küfürsüz"],
    heroLevels: { BK: 75, AQ: 80, GW: 55 },
  });

  await upsertPlayerListing({
    ownerId: players[1].id,
    cocPlayerTag: "#TRPL2",
    ingameName: "AceTR",
    thLevel: 13,
    trophies: 4400,
    bio: "Casual oynayan TH13 oyuncu. CWL'siz olabilir, donate önemli.",
    preferredWarFreq: WarFrequency.ONCE_PER_WEEK,
    lookingFor: ["casual", "donate-yoğun"],
    heroLevels: { BK: 65, AQ: 70 },
  });

  await upsertPlayerListing({
    ownerId: players[2].id,
    cocPlayerTag: "#TRPL3",
    ingameName: "buyukbiraderim",
    thLevel: 16,
    trophies: 5680,
    bio: "TH16, MAX accountum var. Champion+ klan arıyorum.",
    preferredWarFreq: WarFrequency.ALWAYS,
    activeHours: "22:00-02:00",
    lookingFor: ["rekabetçi", "cwl"],
    heroLevels: { BK: 95, AQ: 95, GW: 70, RC: 45 },
  });

  // ─── Örnek başvurular ─────────────────────────────────
  const firstClan = await prisma.clanListing.findUnique({
    where: { clanTag: "#TR2025" },
    select: { id: true },
  });
  if (firstClan) {
    await prisma.application.upsert({
      where: {
        applicantId_clanListingId: {
          applicantId: players[0].id,
          clanListingId: firstClan.id,
        },
      },
      update: {},
      create: {
        applicantId: players[0].id,
        clanListingId: firstClan.id,
        message:
          "Selam! TH14 oyuncuyum, BK 75 AQ 80 GW 55. Aktif war atarım, ailenize katılmak isterim.",
      },
    });
  }

  console.log(
    "✅ Tamam: 1 admin (%s), %d klan lideri, %d oyuncu, %d klan ilanı seed edildi.",
    adminUser.email,
    owners.length,
    players.length,
    clans.length,
  );
}

async function upsertUser(id: string, email: string, username: string) {
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email, username },
  });
}

async function upsertClanListing(args: {
  ownerId: string;
  clanTag: string;
  name: string;
  level: number;
  description?: string;
  trophies: number;
  warFrequency: WarFrequency;
  warWinStreak: number;
  warWins: number;
  memberCount: number;
  requiredTH: number;
  requiredTrophies: number;
  customDescription?: string;
  activeHours?: string;
  tags: string[];
  verified?: boolean;
}) {
  const data = {
    ownerId: args.ownerId,
    name: args.name,
    level: args.level,
    description: args.description ?? null,
    trophies: args.trophies,
    warFrequency: args.warFrequency,
    warWinStreak: args.warWinStreak,
    warWins: args.warWins,
    memberCount: args.memberCount,
    requiredTH: args.requiredTH,
    requiredTrophies: args.requiredTrophies,
    badgeUrl: `https://placehold.co/96?text=${encodeURIComponent(args.name.slice(0, 2))}`,
    lastSyncedAt: new Date(),
    customDescription: args.customDescription ?? null,
    activeHours: args.activeHours ?? null,
    tags: args.tags,
    bumpedAt: new Date(),
    status: ListingStatus.ACTIVE,
    verifiedAt: args.verified ? new Date() : null,
  };
  return prisma.clanListing.upsert({
    where: { clanTag: args.clanTag },
    update: data,
    create: { ...data, clanTag: args.clanTag },
  });
}

async function upsertPlayerListing(args: {
  ownerId: string;
  cocPlayerTag: string;
  ingameName: string;
  thLevel: number;
  trophies: number;
  bio: string;
  preferredWarFreq: WarFrequency;
  activeHours?: string;
  lookingFor: string[];
  heroLevels: Record<string, number>;
}) {
  const data = {
    ownerId: args.ownerId,
    ingameName: args.ingameName,
    thLevel: args.thLevel,
    trophies: args.trophies,
    bio: args.bio,
    preferredWarFreq: args.preferredWarFreq,
    activeHours: args.activeHours ?? null,
    lookingFor: args.lookingFor,
    heroLevels: args.heroLevels,
    bumpedAt: new Date(),
    status: ListingStatus.ACTIVE,
  };
  return prisma.playerListing.upsert({
    where: { cocPlayerTag: args.cocPlayerTag },
    update: data,
    create: { ...data, cocPlayerTag: args.cocPlayerTag },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
