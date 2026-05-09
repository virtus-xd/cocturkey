import Link from "next/link";
import { ShieldCheck, Swords, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { warFrequencyLabel } from "@/lib/coc/mappers";
import type { ClanListItem } from "@/lib/db/queries/clans";

export function ClanCard({ clan }: { clan: ClanListItem }) {
  return (
    <Link
      href={`/klanlar/${encodeURIComponent(clan.clanTag)}`}
      className="block transition-transform hover:-translate-y-0.5"
    >
      <Card className="hover:border-primary/50 h-full overflow-hidden transition-colors">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            {clan.badgeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clan.badgeUrl}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded"
              />
            ) : (
              <div className="bg-muted size-12 shrink-0 rounded" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="truncate font-semibold">{clan.name}</h3>
                {clan.verifiedAt ? (
                  <ShieldCheck
                    className="text-primary size-4 shrink-0"
                    aria-label="Doğrulanmış"
                  />
                ) : null}
              </div>
              <p className="text-muted-foreground font-mono text-xs">{clan.clanTag}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              Lvl {clan.level}
            </Badge>
          </div>

          {clan.customDescription ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {clan.customDescription}
            </p>
          ) : null}

          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {clan.memberCount}/50
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="size-3.5" />
              {clan.trophies.toLocaleString("tr-TR")}
            </span>
            <span className="flex items-center gap-1">
              <Swords className="size-3.5" />
              {warFrequencyLabel(clan.warFrequency)}
            </span>
            {clan.requiredTH > 1 ? <span>TH {clan.requiredTH}+ aranır</span> : null}
          </div>

          {clan.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {clan.tags.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline" className="font-normal">
                  {t}
                </Badge>
              ))}
              {clan.tags.length > 4 ? (
                <Badge variant="outline" className="font-normal">
                  +{clan.tags.length - 4}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
