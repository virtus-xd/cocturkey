// Bir kullanıcıyı ADMIN rolüne yükseltir.
// Kullanım: pnpm tsx scripts/promote-admin.ts <email>
// Örnek:    pnpm tsx scripts/promote-admin.ts erdemoz2003@gmail.com
//
// Önkoşul: kullanıcı en az bir kere /giris üzerinden giriş yapmış olmalı
// (Supabase auth.users + bizim public.users tablosunda kayıt olmalı).

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("❌ Kullanım: pnpm tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, role: true },
  });

  if (!user) {
    console.error(
      `❌ ${email} adresiyle kayıtlı kullanıcı bulunamadı. Önce /giris üzerinden giriş yapması gerek.`,
    );
    process.exit(1);
  }

  if (user.role === UserRole.ADMIN) {
    console.log(`ℹ️ ${email} zaten ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.ADMIN, isVerified: true },
  });

  console.log(`✅ ${email} (@${user.username}) artık ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
