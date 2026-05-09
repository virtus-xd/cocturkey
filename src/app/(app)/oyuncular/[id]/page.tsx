import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, Globe, Trophy } from "lucide-react";

import { ReportDialog } from "@/components/shared/report-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSessionUser } from "@/lib/auth/session";
import { warFrequencyLabel } from "@/lib/coc/mappers";
import { getPlayerListing } from "@/lib/db/queries/players";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerListing(id).catch(() => null);
  if (!player) return { title: "Oyuncu bulunamadı" };
  return {
    title: `${player.ingameName} (TH${player.thLevel})`,
    description: player.bio ?? "Klan arayan oyuncu.",
  };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerListing(id).catch(() => null);
  if (!player) notFound();

  const session = await getSessionUser().catch(() => null);
  const isOwner = session?.app.id === player.ownerId;

  const heroes = player.heroLevels as
    | { BK?: number; AQ?: number; GW?: number; RC?: number }
    | null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6 flex items-center gap-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg">
          <Crown className="text-muted-foreground size-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{player.ingameName}</h1>
          {player.cocPlayerTag ? (
            <p className="text-muted-foreground font-mono text-sm">{player.cocPlayerTag}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary">TH {player.thLevel}</Badge>
            <Badge variant="secondary">{player.trophies.toLocaleString("tr-TR")} kupa</Badge>
            <Badge variant="secondary">{warFrequencyLabel(player.preferredWarFreq)}</Badge>
          </div>
        </div>
      </header>

      <Separator />

      {player.bio ? (
        <Card className="mt-6">
          <CardContent className="pt-6 text-sm whitespace-pre-wrap">{player.bio}</CardContent>
        </Card>
      ) : null}

      {heroes ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Hero seviyeleri
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(["BK", "AQ", "GW", "RC"] as const).map((h) => (
              <Card key={h}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-xs">{h}</p>
                  <p className="text-xl font-bold">{heroes[h] ?? "—"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {player.lookingFor.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {player.lookingFor.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Detail icon={Globe} label="Tercih dili" value={player.preferredLanguage} />
        <Detail icon={Globe} label="Saat dilimi" value={player.timezone} />
        {player.activeHours ? (
          <Detail icon={Globe} label="Aktif saat" value={player.activeHours} />
        ) : null}
        {player.owner.discordId ? (
          <Detail icon={Trophy} label="Discord ID" value={player.owner.discordId} />
        ) : null}
      </section>

      <p className="text-muted-foreground mt-8 text-xs">
        Bu ilan {new Date(player.bumpedAt).toLocaleDateString("tr-TR")} tarihinde güncellendi.
      </p>

      {session && !isOwner ? (
        <div className="mt-2">
          <ReportDialog playerListingId={player.id} />
        </div>
      ) : null}

      <div className="mt-6">
        <Link
          href="/oyuncular"
          className="text-muted-foreground text-sm underline underline-offset-2"
        >
          ← Oyuncu listesine dön
        </Link>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/60 flex items-center gap-3 rounded-lg border p-3">
      <Icon className="text-muted-foreground size-4" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
