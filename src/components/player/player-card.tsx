import Link from "next/link";
import { Crown, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { warFrequencyLabel } from "@/lib/coc/mappers";
import type { PlayerListItem } from "@/lib/db/queries/players";

export function PlayerCard({ player }: { player: PlayerListItem }) {
  const heroes = player.heroLevels as
    | { BK?: number; AQ?: number; GW?: number; RC?: number }
    | null;

  return (
    <Link
      href={`/oyuncular/${player.id}`}
      className="block transition-transform hover:-translate-y-0.5"
    >
      <Card className="hover:border-primary/50 h-full transition-colors">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded">
              <Crown className="text-muted-foreground size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{player.ingameName}</h3>
              {player.cocPlayerTag ? (
                <p className="text-muted-foreground font-mono text-xs">{player.cocPlayerTag}</p>
              ) : null}
            </div>
            <Badge variant="secondary" className="shrink-0">
              TH {player.thLevel}
            </Badge>
          </div>

          {player.bio ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {player.bio}
            </p>
          ) : null}

          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Trophy className="size-3.5" />
              {player.trophies.toLocaleString("tr-TR")}
            </span>
            <span>{warFrequencyLabel(player.preferredWarFreq)}</span>
            {heroes ? (
              <span>
                {[heroes.BK && `BK ${heroes.BK}`, heroes.AQ && `AQ ${heroes.AQ}`,
                  heroes.GW && `GW ${heroes.GW}`, heroes.RC && `RC ${heroes.RC}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ) : null}
          </div>

          {player.lookingFor.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {player.lookingFor.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
