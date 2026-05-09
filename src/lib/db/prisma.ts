// Prisma 7 client. Driver adapter (@prisma/adapter-pg) zorunlu.
// Hot reload sırasında çoklu örnekleri önlemek için global tekil pattern.
//
// Build sırasında DATABASE_URL olmasa bile patlamasın diye lazy init —
// PrismaClient sadece ilk erişimde kurulur. Build-time sayfaları DB'ye
// dokunmuyor; runtime'da DATABASE_URL şart.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Runtime'da bu görülürse: .env.local'i doldur. Build-time'da görünmez
    // çünkü Proxy lazy.
    throw new Error("DATABASE_URL ayarlanmamış. .env.local'i doldur.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    const client = globalForPrisma.prisma as unknown as Record<string | symbol, unknown>;
    return client[prop];
  },
});
