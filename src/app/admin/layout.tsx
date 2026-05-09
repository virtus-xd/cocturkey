import Link from "next/link";

import { requireRole } from "@/lib/auth/session";

// Admin sayfaları her zaman dinamik — auth + DB sorguları her request'te tazedir.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["MODERATOR", "ADMIN"], "/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-4 border-b pb-4">
        <h1 className="text-xl font-bold">Yönetim</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/admin" className="hover:underline">
            Genel
          </Link>
          <Link href="/admin/raporlar" className="hover:underline">
            Raporlar
          </Link>
          <Link href="/admin/ilanlar" className="hover:underline">
            İlanlar
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
