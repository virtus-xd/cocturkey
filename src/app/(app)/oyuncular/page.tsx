import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oyuncular",
  description: "Klan arayan Türk Clash of Clans oyuncuları.",
};

export default function PlayersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Oyuncular</h1>
        <p className="text-muted-foreground mt-2">Faz 2'de oyuncu ilanları burada listelenecek.</p>
      </header>
      <div className="border-border/60 rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Henüz oyuncu ilanı yok. Aranan oyuncu sen ol!
        </p>
      </div>
    </div>
  );
}
