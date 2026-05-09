import type { Metadata } from "next";

import { requireSession } from "@/lib/auth/session";

import { PlayerListingForm } from "./player-listing-form";

export const metadata: Metadata = {
  title: "Oyuncu İlanı Ver",
  description: "Klan ararken klan liderlerinin gözüne çarp.",
};

export default async function PlayerListingPage() {
  await requireSession("/ilan-ver/oyuncu");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Oyuncu İlanı</h1>
        <p className="text-muted-foreground mt-2">
          CoC etiketin varsa otomatik dolduralım; yoksa elle gir. Aktif tek bir oyuncu ilanın
          olabilir, yenisi yayınlarsan eskisi güncellenir.
        </p>
      </header>

      <PlayerListingForm />
    </div>
  );
}
