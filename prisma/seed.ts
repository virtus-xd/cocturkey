// Geliştirme seed verisi — `pnpm db:seed` ile çalışır.
// Gerçek DATABASE_URL gerektirir. Üretimde çalıştırılmamalı.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // TODO(2026-05-09): MVP başvuru akışı tamamlanınca demo klan/oyuncu kayıtları eklenecek.
  console.log("Seed: henüz veri yok. Şema migrate edildikten sonra doldurulacak.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
