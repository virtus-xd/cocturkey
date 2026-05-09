"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/lib/reports/actions";
import { REPORT_REASON_LABELS_TR, type ReportReason } from "@/lib/validation/report";

type Props =
  | { clanListingId: string; playerListingId?: never }
  | { clanListingId?: never; playerListingId: string };

export function ReportDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="size-4" /> Şikayet et
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İçeriği şikayet et</DialogTitle>
          <DialogDescription>
            Moderasyon ekibi inceleyip gerekirse aksiyon alır. Hesabını ortaya çıkarmıyoruz.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            if (props.clanListingId) fd.set("clanListingId", props.clanListingId);
            if (props.playerListingId) fd.set("playerListingId", props.playerListingId);
            fd.set("reason", reason);
            startTransition(async () => {
              const res = await createReport(fd);
              if (res.ok) {
                toast.success("Şikayetin alındı.");
                setOpen(false);
              } else {
                toast.error(res.error);
              }
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label>Sebep</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_REASON_LABELS_TR).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Açıklama (opsiyonel)</Label>
            <Textarea
              id="report-details"
              name="details"
              rows={4}
              maxLength={500}
              placeholder="Detay verirsen daha hızlı çözülür."
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
