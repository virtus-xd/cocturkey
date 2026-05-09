import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { REPORT_REASON_LABELS_TR } from "@/lib/validation/report";

import { ReportRowActions } from "./report-row-actions";

export default async function AdminReportsPage() {
  const reports = await prisma.report
    .findMany({
      where: { status: { in: ["OPEN", "IN_REVIEW"] } },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        reporter: { select: { username: true, email: true } },
        clanListing: { select: { id: true, name: true, clanTag: true } },
        playerListing: { select: { id: true, ingameName: true } },
      },
    })
    .catch(() => []);

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center">
          Sırada bekleyen rapor yok. Bravo.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id}>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{REPORT_REASON_LABELS_TR[r.reason]}</Badge>
                  <span className="text-muted-foreground text-xs">
                    {new Date(r.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {r.reporter.username} · {r.reporter.email}
                </span>
              </div>

              {r.clanListing ? (
                <Link
                  href={`/klanlar/${encodeURIComponent(r.clanListing.clanTag)}`}
                  className="text-sm font-medium hover:underline"
                  target="_blank"
                  rel="noopener"
                >
                  Klan: {r.clanListing.name}
                </Link>
              ) : null}
              {r.playerListing ? (
                <Link
                  href={`/oyuncular/${r.playerListing.id}`}
                  className="text-sm font-medium hover:underline"
                  target="_blank"
                  rel="noopener"
                >
                  Oyuncu: {r.playerListing.ingameName}
                </Link>
              ) : null}

              {r.details ? (
                <p className="bg-muted/40 rounded p-2 text-sm whitespace-pre-wrap">{r.details}</p>
              ) : null}

              <ReportRowActions
                reportId={r.id}
                clanListingId={r.clanListingId}
                playerListingId={r.playerListingId}
              />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
