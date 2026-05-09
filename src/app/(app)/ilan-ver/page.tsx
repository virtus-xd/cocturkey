import type { Metadata } from "next";

import { requireSession } from "@/lib/auth/session";

import { ClanListingForm } from "./clan-listing-form";

export const metadata: Metadata = {
  title: "İlan Ver",
  description: "Klanın için ilan oluştur — CoC etiketini gir, biz veriyi çekip yayına alalım.",
};

export default async function CreateListingPage() {
  await requireSession("/ilan-ver");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">İlan Ver</h1>
        <p className="text-muted-foreground mt-2">
          CoC klan etiketini gir; biz oyun verilerini otomatik çekeriz. Sen sadece klanını
          tanıtırsın.
        </p>
      </header>

      <ClanListingForm />
    </div>
  );
}
