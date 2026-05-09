"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setClanListingStatus, setPlayerListingStatus } from "../actions";
import { Button } from "@/components/ui/button";

export function ListingStatusActions({
  type,
  id,
  banned,
}: {
  type: "clan" | "player";
  id: string;
  banned: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
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
  );
}
