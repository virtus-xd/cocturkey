import type { Metadata } from "next";
import Link from "next/link";

import { ClanCard } from "@/components/clan/clan-card";
import { ClanFilters } from "@/components/filters/clan-filters";
import { Button } from "@/components/ui/button";
import { listClanListings } from "@/lib/db/queries/clans";
import { clanListFiltersSchema } from "@/lib/validation/clan";

export const metadata: Metadata = {
  title: "Klanlar",
  description: "Türkiye'nin aktif Clash of Clans klan ilanları.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClansPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = clanListFiltersSchema.safeParse({
    minTH: raw.minTH,
    maxTH: raw.maxTH,
    minTrophies: raw.minTrophies,
    warFrequency: raw.warFrequency === "any" ? undefined : raw.warFrequency,
    language: raw.language,
    tag: raw.tag,
    search: raw.search,
    cursor: raw.cursor,
  });

  // Geçersiz filtre → boş filtreyle devam et (UX için 400 atmıyoruz).
  const filters = parsed.success ? parsed.data : {};

  let result;
  try {
    result = await listClanListings(filters);
  } catch (e) {
    console.error("listClanListings failed", e);
    result = { items: [], nextCursor: null as string | null };
  }

  const buildNextHref = () => {
    if (!result.nextCursor) return null;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") params.set(k, v);
    }
    params.set("cursor", result.nextCursor);
    return `/klanlar?${params.toString()}`;
  };

  const nextHref = buildNextHref();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Klanlar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sana uygun Türk klanını bul. Filtreler URL'de saklanır.
        </p>
      </header>

      <div className="mb-6">
        <ClanFilters />
      </div>

      {result.items.length === 0 ? (
        <div className="border-border/60 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Bu filtrelere uyan klan yok. Filtreleri gevşet ya da{" "}
            <Link href="/ilan-ver" className="underline underline-offset-2">
              ilk ilanı sen ver
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((clan) => (
            <li key={clan.id}>
              <ClanCard clan={clan} />
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
