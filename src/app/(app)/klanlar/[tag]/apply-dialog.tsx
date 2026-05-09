"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { applyToClan } from "./actions";

type Props = {
  clanListingId: string;
  clanName: string;
  alreadyApplied?: boolean;
  isOwner?: boolean;
  signedIn: boolean;
};

export function ApplyDialog({ clanListingId, clanName, alreadyApplied, isOwner, signedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return (
      <Button disabled variant="secondary">
        Bu ilan senin
      </Button>
    );
  }

  if (alreadyApplied) {
    return (
      <Button disabled variant="secondary">
        Zaten başvurdun
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button asChild>
        <a
          href={`/giris?next=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`}
        >
          Başvurmak için giriş yap
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Başvur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{clanName}'a başvur</DialogTitle>
          <DialogDescription>
            Klan liderine kısa bir mesaj bırak. Discord ID'n veya in-game adın varsa belirt.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            fd.set("clanListingId", clanListingId);
            startTransition(async () => {
              const res = await applyToClan(fd);
              if (res.ok) {
                toast.success("Başvurun iletildi.");
                setOpen(false);
              } else {
                toast.error(res.error);
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="apply-message">Mesajın</Label>
            <Textarea
              id="apply-message"
              name="message"
              rows={5}
              maxLength={1000}
              required
              minLength={10}
              placeholder="Selam! TH13'üm, BK 65 AQ 70 GW 50, war yapmayı seviyorum…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
