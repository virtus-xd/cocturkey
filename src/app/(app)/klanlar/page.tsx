import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klanlar",
  description: "Türkiye'nin aktif Clash of Clans klan ilanları.",
};

export default function ClansPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Klanlar</h1>
        <p className="text-muted-foreground mt-2">
          Faz 1'de buraya klan listesi, filtreler ve kart görünümü gelecek.
        </p>
      </header>
      <div className="border-border/60 rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">Henüz klan ilanı yok. İlk ilanı sen ver!</p>
      </div>
    </div>
  );
}
