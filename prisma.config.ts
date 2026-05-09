// Prisma 7 yapılandırması — schema yolu, migration ve seed komutları burada.
// Çalışma zamanı bağlantısı için: lib/db/prisma.ts içinde adapter veya
// accelerateUrl ile PrismaClient oluşturuluyor (Supabase devreye girince).

import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
