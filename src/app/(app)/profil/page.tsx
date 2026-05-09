import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { BumpButton, PauseResumeButton } from "./listing-actions";
import { WebhookForm } from "./webhook-form";

export const metadata: Metadata = {
  title: "Profil",
  description: "Hesabını ve ilanlarını yönet.",
};

export default async function ProfilePage() {
  const session = await requireSession("/profil");

  const [clanListings, playerListings, applications] = await Promise.all([
    prisma.clanListing.findMany({
      where: { ownerId: session.app.id },
      orderBy: { bumpedAt: "desc" },
      select: {
        id: true,
        clanTag: true,
        name: true,
        status: true,
        viewCount: true,
        memberCount: true,
        bumpedAt: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.playerListing.findMany({
      where: { ownerId: session.app.id },
      orderBy: { bumpedAt: "desc" },
      select: {
        id: true,
        ingameName: true,
        thLevel: true,
        status: true,
        viewCount: true,
        bumpedAt: true,
      },
    }),
    prisma.application.findMany({
      where: { applicantId: session.app.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        clanListing: { select: { clanTag: true, name: true, badgeUrl: true } },
      },
    }),
  ]).catch(() => [[], [], []] as const);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground text-sm">
          {session.app.username} · {session.app.email}
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Klan ilanların</h2>
          <Button asChild size="sm">
            <Link href="/ilan-ver/klan">Yeni klan ilanı</Link>
          </Button>
        </div>

        {clanListings.length === 0 ? (
          <EmptyCard
            text="Henüz klan ilanı açmamışsın."
            href="/ilan-ver/klan"
            link="İlk ilanı şimdi ver."
          />
        ) : (
          <ul className="space-y-3">
            {clanListings.map((l) => (
              <li key={l.id}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Link
                      href={`/klanlar/${encodeURIComponent(l.clanTag)}`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <p className="truncate font-semibold">{l.name}</p>
                      <p className="text-muted-foreground font-mono text-xs">{l.clanTag}</p>
                    </Link>
                    <div className="text-muted-foreground text-right text-xs">
                      <p>{l._count.applications} başvuru</p>
                      <p>{l.viewCount} görüntülenme</p>
                    </div>
                    <Badge variant={l.status === "ACTIVE" ? "default" : "secondary"}>
                      {l.status === "ACTIVE" ? "Yayında" : l.status}
                    </Badge>
                    <div className="flex gap-1">
                      <BumpButton id={l.id} type="clan" />
                      <PauseResumeButton id={l.id} active={l.status === "ACTIVE"} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Oyuncu ilanın</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/ilan-ver/oyuncu">
              {playerListings.length > 0 ? "Güncelle" : "Yeni oyuncu ilanı"}
            </Link>
          </Button>
        </div>

        {playerListings.length === 0 ? (
          <EmptyCard
            text="Klan arıyorsan oyuncu ilanı yayınla."
            href="/ilan-ver/oyuncu"
            link="Hemen ver."
          />
        ) : (
          <ul className="space-y-3">
            {playerListings.map((p) => (
              <li key={p.id}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Link href={`/oyuncular/${p.id}`} className="min-w-0 flex-1 hover:underline">
                      <p className="truncate font-semibold">{p.ingameName}</p>
                      <p className="text-muted-foreground text-xs">TH {p.thLevel}</p>
                    </Link>
                    <p className="text-muted-foreground text-xs">{p.viewCount} görüntülenme</p>
                    <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>
                      {p.status === "ACTIVE" ? "Yayında" : p.status}
                    </Badge>
                    <BumpButton id={p.id} type="player" />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Başvurularım</h2>
        {applications.length === 0 ? (
          <EmptyCard
            text="Henüz hiçbir klana başvurmamışsın."
            href="/klanlar"
            link="Klanları gez."
          />
        ) : (
          <ul className="space-y-2">
            {applications.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <Link
                        href={`/klanlar/${encodeURIComponent(a.clanListing.clanTag)}`}
                        className="font-medium hover:underline"
                      >
                        {a.clanListing.name}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {new Date(a.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === "ACCEPTED"
                          ? "default"
                          : a.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {a.status === "PENDING" ? "Bekleyen" : a.status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Bildirim ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <WebhookForm defaultValue={session.app.discordWebhookUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hesabın</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>Discord bağlı: {session.app.discordId ? "Evet" : "Hayır"}</p>
          <p>Doğrulanmış: {session.app.isVerified ? "Evet" : "Henüz değil"}</p>
          <p>
            Public profil:{" "}
            <Link
              href={`/u/${session.app.username}`}
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener"
            >
              /u/{session.app.username}
            </Link>
          </p>
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              Çıkış yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyCard({ text, href, link }: { text: string; href: string; link: string }) {
  return (
    <Card>
      <CardContent className="text-muted-foreground py-8 text-center text-sm">
        {text}{" "}
        <Link href={href} className="underline underline-offset-2">
          {link}
        </Link>
      </CardContent>
    </Card>
  );
}
