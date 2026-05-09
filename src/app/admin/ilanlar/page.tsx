import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

import { ListingStatusActions } from "./listing-status-actions";

export default async function AdminListingsPage() {
  const [clans, players] = await Promise.all([
    prisma.clanListing.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        clanTag: true,
        status: true,
        memberCount: true,
        createdAt: true,
        owner: { select: { username: true } },
        _count: { select: { reports: true } },
      },
    }),
    prisma.playerListing.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        ingameName: true,
        thLevel: true,
        status: true,
        createdAt: true,
        owner: { select: { username: true } },
        _count: { select: { reports: true } },
      },
    }),
  ]).catch(() => [[], []] as const);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Klan ilanları</h2>
        <ul className="space-y-2">
          {clans.map((c) => (
            <li key={c.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-3 text-sm">
                  <Link
                    href={`/klanlar/${encodeURIComponent(c.clanTag)}`}
                    target="_blank"
                    rel="noopener"
                    className="flex-1 hover:underline"
                  >
                    {c.name} <span className="text-muted-foreground font-mono">{c.clanTag}</span>
                  </Link>
                  <span className="text-muted-foreground text-xs">@{c.owner.username}</span>
                  {c._count.reports > 0 ? (
                    <Badge variant="destructive">{c._count.reports} rapor</Badge>
                  ) : null}
                  <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>
                    {c.status}
                  </Badge>
                  <ListingStatusActions type="clan" id={c.id} banned={c.status === "BANNED"} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Oyuncu ilanları</h2>
        <ul className="space-y-2">
          {players.map((p) => (
            <li key={p.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-3 text-sm">
                  <Link
                    href={`/oyuncular/${p.id}`}
                    target="_blank"
                    rel="noopener"
                    className="flex-1 hover:underline"
                  >
                    {p.ingameName} <span className="text-muted-foreground">TH {p.thLevel}</span>
                  </Link>
                  <span className="text-muted-foreground text-xs">@{p.owner.username}</span>
                  {p._count.reports > 0 ? (
                    <Badge variant="destructive">{p._count.reports} rapor</Badge>
                  ) : null}
                  <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                  <ListingStatusActions type="player" id={p.id} banned={p.status === "BANNED"} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
