"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { refreshClanData } from "./actions";

export function RefreshButton({ clanListingId }: { clanListingId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        startTransition(async () => {
          const res = await refreshClanData(clanListingId);
          if (res.ok) toast.success("Veri yenilendi.");
          else toast.error(res.error);
        })
      }
      disabled={pending}
    >
      <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
      Yenile
    </Button>
  );
}
