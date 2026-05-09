"use client";

import { useTransition } from "react";
import { ArrowUp, Pause, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  bumpClanListing,
  bumpPlayerListing,
  pauseClanListing,
  resumeClanListing,
} from "./actions";

export function BumpButton({
  id,
  type,
}: {
  id: string;
  type: "clan" | "player";
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const fn = type === "clan" ? bumpClanListing : bumpPlayerListing;
          const res = await fn(id);
          if (res.ok) toast.success("İlan üste taşındı.");
          else toast.error(res.error);
        });
      }}
      disabled={pending}
    >
      <ArrowUp className="size-4" /> Yenile
    </Button>
  );
}

export function PauseResumeButton({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const fn = active ? pauseClanListing : resumeClanListing;
          const res = await fn(id);
          if (res.ok) toast.success(active ? "İlan duraklatıldı." : "İlan tekrar aktif.");
          else toast.error(res.error);
        });
      }}
      disabled={pending}
    >
      {active ? <Pause className="size-4" /> : <Play className="size-4" />}
      {active ? "Duraklat" : "Aktifleştir"}
    </Button>
  );
}
