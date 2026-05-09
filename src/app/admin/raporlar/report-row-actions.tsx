"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { resolveReport, setClanListingStatus, setPlayerListingStatus } from "../actions";
import { Button } from "@/components/ui/button";

export function ReportRowActions({
  reportId,
  clanListingId,
  playerListingId,
}: {
  reportId: string;
  clanListingId?: string | null;
  playerListingId?: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean }>, success: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) toast.success(success);
      else toast.error("İşlem başarısız.");
    });

  return (
    <div className="flex flex-wrap gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => run(() => resolveReport(reportId, "RESOLVE"), "Çözüldü olarak işaretlendi")}
        disabled={pending}
      >
        Çöz
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => run(() => resolveReport(reportId, "DISMISS"), "Reddedildi")}
        disabled={pending}
      >
        Reddet
      </Button>
      {clanListingId ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            run(() => setClanListingStatus(clanListingId, "BANNED"), "İlan banlandı")
          }
          disabled={pending}
        >
          İlanı banla
        </Button>
      ) : null}
      {playerListingId ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            run(() => setPlayerListingStatus(playerListingId, "BANNED"), "İlan banlandı")
          }
          disabled={pending}
        >
          İlanı banla
        </Button>
      ) : null}
    </div>
  );
}
