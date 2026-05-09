import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  Globe,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import { ApplyDialog } from "./apply-dialog";
import { RefreshButton } from "./refresh-button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getSessionUser } from "@/lib/auth/session";
import { warFrequencyLabel } from "@/lib/coc/mappers";
import { normalizeCocTag } from "@/lib/coc/tag";
import { prisma } from "@/lib/db/prisma";
import { bumpClanViewCount, getClanListingByTag } from "@/lib/db/queries/clans";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const normalized = normalizeCocTag(decodeURIComponent(tag));
  if (!normalized) return { title: "Klan" };
  const listing = await getClanListingByTag(normalized).catch(() => null);
  if (!listing) return { title: "Klan bulunamadı" };
  return {
    title: listing.name,
    description: listing.customDescription ?? listing.description ?? `${listing.name} klan ilanı.`,
  };
}

export default async function ClanDetailPage({ params }: Props) {
  const { tag } = await params;
  const normalized = normalizeCocTag(decodeURIComponent(tag));
  if (!normalized) notFound();

  const listing = await getClanListingByTag(normalized).catch(() => null);
  if (!listing) notFound();

  // View counter — fire-and-forget.
  void bumpClanViewCount(listing.id);

  const session = await getSessionUser().catch(() => null);
  const isOwner = session?.app.id === listing.ownerId;

  // Mevcut başvuru kontrolü.
  let alreadyApplied = false;
  if (session && !isOwner) {
    const existing = await prisma.application
      .findUnique({
        where: {
          applicantId_clanListingId: {
            applicantId: session.app.id,
            clanListingId: listing.id,
          },
        },
        select: { id: true },
      })
      .catch(() => null);
    alreadyApplied = Boolean(existing);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {listing.badgeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.badgeUrl}
            alt=""
            width={80}
            height={80}
            className="size-20 rounded-lg"
          />
        ) : (
          <div className="bg-muted size-20 rounded-lg" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl">{listing.name}</h1>
            {listing.owner.isVerified ? (
              <ShieldCheck className="text-primary size-5" aria-label="Sahibi doğrulanmış" />
            ) : null}
          </div>
          <p className="text-muted-foreground font-mono text-sm">{listing.clanTag}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary">Lvl {listing.level}</Badge>
            <Badge variant="secondary">{listing.memberCount}/50 üye</Badge>
            <Badge variant="secondary">{listing.trophies.toLocaleString("tr-TR")} kupa</Badge>
            {listing.requiredTH > 1 ? (
              <Badge variant="secondary">TH {listing.requiredTH}+ aranır</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <ApplyDialog
            clanListingId={listing.id}
            clanName={listing.name}
            alreadyApplied={alreadyApplied}
            isOwner={isOwner}
            signedIn={Boolean(session)}
          />
          {isOwner ? <RefreshButton clanListingId={listing.id} /> : null}
        </div>
      </header>

      <Separator />

      <section className="mt-6 grid gap-6 sm:grid-cols-3">
        <StatCard
          icon={Swords}
          label="Savaş sıklığı"
          value={warFrequencyLabel(listing.warFrequency)}
        />
        <StatCard icon={Trophy} label="Toplam war zaferi" value={listing.warWins.toString()} />
        <StatCard icon={Users} label="Win streak" value={listing.warWinStreak.toString()} />
      </section>

      {listing.customDescription ? (
        <Card className="mt-6">
          <CardContent className="prose prose-zinc dark:prose-invert max-w-none pt-6 text-sm whitespace-pre-wrap">
            {listing.customDescription}
          </CardContent>
        </Card>
      ) : null}

      {listing.description ? (
        <Card className="mt-6">
          <CardContent className="space-y-2 pt-6">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Oyun içi açıklama
            </p>
            <p className="text-sm">{listing.description}</p>
          </CardContent>
        </Card>
      ) : null}

      {listing.tags.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {listing.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Detail icon={Globe} label="Dil" value={listing.language} />
        <Detail icon={Globe} label="Saat dilimi" value={listing.timezone} />
        {listing.activeHours ? (
          <Detail icon={Globe} label="Aktif saat" value={listing.activeHours} />
        ) : null}
        {listing.discordInvite ? (
          <DetailLink
            icon={MessageSquare}
            label="Discord"
            href={listing.discordInvite}
            value="Discord daveti"
          />
        ) : null}
        {listing.whatsappLink ? (
          <DetailLink icon={Phone} label="WhatsApp" href={listing.whatsappLink} value="WhatsApp" />
        ) : null}
        {listing.telegramLink ? (
          <DetailLink icon={Send} label="Telegram" href={listing.telegramLink} value="Telegram" />
        ) : null}
      </section>

      <p className="text-muted-foreground mt-8 text-xs">
        Bu ilan {new Date(listing.bumpedAt).toLocaleDateString("tr-TR")} tarihinde güncellendi.
        Veriler son olarak {new Date(listing.lastSyncedAt).toLocaleString("tr-TR")}'da CoC'tan
        çekildi.
      </p>

      <div className="mt-6">
        <Link
          href="/klanlar"
          className="text-muted-foreground text-sm underline underline-offset-2"
        >
          ← Klan listesine dön
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Swords;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <Icon className="text-primary size-5" />
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
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

function DetailLink({
  icon: Icon,
  label,
  href,
  value,
}: {
  icon: typeof Globe;
  label: string;
  href: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border/60 hover:border-primary/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <Icon className="text-primary size-4" />
      <div className="flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <ExternalLink className="text-muted-foreground size-4" />
    </a>
  );
}
