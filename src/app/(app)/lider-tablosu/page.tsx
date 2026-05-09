import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Lider Tablosu",
  description: "Türkiye'nin en aktif Clash of Clans klanları.",
};

// DB sorgusu var, build-time prerender etme.
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const top = await prisma.clanListing
    .findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ warWinStreak: "desc" }, { warWins: "desc" }, { memberCount: "desc" }],
      take: 50,
      select: {
        id: true,
        clanTag: true,
        name: true,
        level: true,
        memberCount: true,
        warWins: true,
        warWinStreak: true,
        trophies: true,
        verifiedAt: true,
        boostedUntil: true,
        badgeUrl: true,
      },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Lider Tablosu</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Win streak ve toplam war zaferine göre sıralı top 50 Türk klanı.
        </p>
      </header>

      {top.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Henüz yeterli veri yok.
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-2">
          {top.map((c, i) => {
            // eslint-disable-next-line react-hooks/purity
            const isBoosted = c.boostedUntil && c.boostedUntil.getTime() > Date.now();
            const rank = i + 1;
            return (
              <li key={c.id}>
                <Link href={`/klanlar/${encodeURIComponent(c.clanTag)}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center gap-3 p-3">
                      <span
                        className={
                          "w-8 text-center font-mono text-sm " +
                          (rank <= 3 ? "text-primary font-bold" : "text-muted-foreground")
                        }
                      >
                        {rank}
                      </span>
                      {c.badgeUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.badgeUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 shrink-0 rounded"
                        />
                      ) : (
                        <div className="bg-muted size-8 shrink-0 rounded" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="truncate font-semibold">{c.name}</p>
                          {c.verifiedAt ? (
                            <ShieldCheck className="text-primary size-4 shrink-0" />
                          ) : null}
                          {isBoosted ? <Sparkles className="text-primary size-4 shrink-0" /> : null}
                        </div>
                        <p className="text-muted-foreground font-mono text-xs">{c.clanTag}</p>
                      </div>
                      <div className="text-muted-foreground hidden text-xs sm:flex sm:flex-col sm:items-end">
                        <span>{c.warWinStreak} win streak</span>
                        <span>{c.warWins.toLocaleString("tr-TR")} toplam war</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Lvl {c.level}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
