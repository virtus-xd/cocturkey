import type { Metadata } from "next";
import Link from "next/link";

import { PlayerCard } from "@/components/player/player-card";
import { PlayerFilters } from "@/components/filters/player-filters";
import { Button } from "@/components/ui/button";
import { listPlayerListings } from "@/lib/db/queries/players";
import { playerListFiltersSchema } from "@/lib/validation/player";

export const metadata: Metadata = {
  title: "Oyuncular",
  description: "Klan arayan Türk Clash of Clans oyuncuları.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlayersPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = playerListFiltersSchema.safeParse({
    minTH: raw.minTH,
    maxTH: raw.maxTH,
    minTrophies: raw.minTrophies,
    preferredWarFreq: raw.preferredWarFreq === "any" ? undefined : raw.preferredWarFreq,
    language: raw.language,
    search: raw.search,
    cursor: raw.cursor,
  });

  const filters = parsed.success ? parsed.data : {};

  let result;
  try {
    result = await listPlayerListings(filters);
  } catch (e) {
    console.error("listPlayerListings failed", e);
    result = { items: [], nextCursor: null as string | null };
  }

  const buildNextHref = () => {
    if (!result.nextCursor) return null;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") params.set(k, v);
    }
    params.set("cursor", result.nextCursor);
    return `/oyuncular?${params.toString()}`;
  };
  const nextHref = buildNextHref();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Oyuncular</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Klan arayan oyuncular. Klanın için uygun olanı bul, Discord'tan ulaş.
        </p>
      </header>

      <div className="mb-6">
        <PlayerFilters />
      </div>

      {result.items.length === 0 ? (
        <div className="border-border/60 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Bu filtrelere uyan oyuncu yok.{" "}
            <Link href="/ilan-ver/oyuncu" className="underline underline-offset-2">
              Aranan oyuncu sen ol.
            </Link>
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((p) => (
            <li key={p.id}>
              <PlayerCard player={p} />
            </li>
          ))}
        </ul>
      )}

      {nextHref ? (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link href={nextHref}>Daha fazla göster</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
