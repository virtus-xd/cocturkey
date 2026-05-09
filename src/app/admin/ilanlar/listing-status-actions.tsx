"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setClanListingStatus, setPlayerListingStatus, toggleBoost } from "../actions";
import { Button } from "@/components/ui/button";

export function ListingStatusActions({
  type,
  id,
  banned,
  boosted,
}: {
  type: "clan" | "player";
  id: string;
  banned: boolean;
  boosted?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      {type === "clan" ? (
        <Button
          size="sm"
          variant={boosted ? "secondary" : "outline"}
          onClick={() =>
            startTransition(async () => {
              const res = await toggleBoost(id, boosted ? null : 7);
              if (res.ok) toast.success(boosted ? "Boost kaldırıldı." : "7 gün boost edildi.");
              else toast.error("İşlem başarısız.");
            })
          }
          disabled={pending}
        >
          {boosted ? "Boost'u kaldır" : "Boost (7g)"}
        </Button>
      ) : null}
      <Button
        size="sm"
        variant={banned ? "outline" : "destructive"}
        onClick={() =>
          startTransition(async () => {
            const fn = type === "clan" ? setClanListingStatus : setPlayerListingStatus;
            const res = await fn(id, banned ? "ACTIVE" : "BANNED");
            if (res.ok) toast.success(banned ? "Yeniden aktif." : "Banlandı.");
            else toast.error("İşlem başarısız.");
          })
        }
        disabled={pending}
      >
        {banned ? "Banı kaldır" : "Banla"}
      </Button>
    </div>
  );
}
