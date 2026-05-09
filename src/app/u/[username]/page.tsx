import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user
    .findUnique({ where: { username }, select: { username: true } })
    .catch(() => null);
  if (!user) return { title: "Kullanıcı bulunamadı" };
  return { title: `@${user.username}` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user
    .findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        isVerified: true,
        role: true,
        createdAt: true,
        clanListings: {
          where: { status: "ACTIVE" },
          orderBy: { bumpedAt: "desc" },
          select: {
            id: true,
            clanTag: true,
            name: true,
            level: true,
            verifiedAt: true,
          },
        },
        playerListings: {
          where: { status: "ACTIVE" },
          orderBy: { bumpedAt: "desc" },
          select: {
            id: true,
            ingameName: true,
            thLevel: true,
            trophies: true,
          },
        },
      },
    })
    .catch(() => null);

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="flex items-center gap-4">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <Crown className="text-muted-foreground size-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">@{user.username}</h1>
            {user.isVerified ? (
              <ShieldCheck className="text-primary size-5" aria-label="Doğrulanmış" />
            ) : null}
            {user.role !== "USER" ? (
              <Badge variant="secondary" className="text-xs">
                {user.role === "ADMIN" ? "Yönetici" : "Moderatör"}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">
            Üye {new Date(user.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </header>

      {user.clanListings.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Açtığı klan ilanları</h2>
          <ul className="space-y-2">
            {user.clanListings.map((c) => (
              <li key={c.id}>
                <Link href={`/klanlar/${encodeURIComponent(c.clanTag)}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center gap-3 p-3 text-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 font-semibold">
                          {c.name}
                          {c.verifiedAt ? <ShieldCheck className="text-primary size-4" /> : null}
                        </div>
                        <p className="text-muted-foreground font-mono text-xs">{c.clanTag}</p>
                      </div>
                      <Badge variant="secondary">Lvl {c.level}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {user.playerListings.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Oyuncu ilanı</h2>
          <ul className="space-y-2">
            {user.playerListings.map((p) => (
              <li key={p.id}>
                <Link href={`/oyuncular/${p.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center gap-3 p-3 text-sm">
                      <div className="flex-1 font-semibold">{p.ingameName}</div>
                      <Badge variant="secondary">TH {p.thLevel}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {p.trophies.toLocaleString("tr-TR")} kupa
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {user.clanListings.length === 0 && user.playerListings.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Bu kullanıcının henüz aktif ilanı yok.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
