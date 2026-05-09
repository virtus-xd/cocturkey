import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Profil",
  description: "Hesabını ve ilanlarını yönet.",
};

export default async function ProfilePage() {
  const session = await requireSession("/profil");

  const [listings, applications] = await Promise.all([
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
    prisma.application.findMany({
      where: { applicantId: session.app.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        clanListing: {
          select: { clanTag: true, name: true, badgeUrl: true },
        },
      },
    }),
  ]).catch(() => [[], []] as const);

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
          <h2 className="text-lg font-semibold">İlanların</h2>
          <Button asChild size="sm">
            <Link href="/ilan-ver">Yeni ilan</Link>
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              Henüz ilan açmamışsın.{" "}
              <Link href="/ilan-ver" className="underline underline-offset-2">
                İlk ilanı şimdi ver.
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {listings.map((l) => (
              <li key={l.id}>
                <Link href={`/klanlar/${encodeURIComponent(l.clanTag)}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1">
                        <p className="font-semibold">{l.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">{l.clanTag}</p>
                      </div>
                      <div className="text-muted-foreground text-right text-xs">
                        <p>{l._count.applications} başvuru</p>
                        <p>{l.viewCount} görüntülenme</p>
                      </div>
                      <Badge variant={l.status === "ACTIVE" ? "default" : "secondary"}>
                        {l.status === "ACTIVE" ? "Yayında" : l.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Başvurularım</h2>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              Henüz hiçbir klana başvurmamışsın.{" "}
              <Link href="/klanlar" className="underline underline-offset-2">
                Klanları gez.
              </Link>
            </CardContent>
          </Card>
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
          <CardTitle>Hesabın</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>Discord bağlı: {session.app.discordId ? "Evet" : "Hayır"}</p>
          <p>Doğrulanmış: {session.app.isVerified ? "Evet" : "Henüz değil"}</p>
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
