"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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

import { checkCodeAction, requestCodeAction } from "./verify-actions";

export function VerifyButton({
  clanListingId,
  alreadyVerified,
}: {
  clanListingId: string;
  alreadyVerified: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyVerified) {
    return (
      <span className="text-primary inline-flex items-center gap-1 text-xs font-medium">
        <CheckCircle2 className="size-4" /> Doğrulandı
      </span>
    );
  }

  const onRequest = () =>
    startTransition(async () => {
      const res = await requestCodeAction(clanListingId);
      if (res.ok) {
        setCode(res.code);
      } else {
        toast.error(res.error);
      }
    });

  const onCheck = () =>
    startTransition(async () => {
      const res = await checkCodeAction(clanListingId);
      if (res.ok) {
        toast.success("Klanın doğrulandı.");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="size-4" /> Doğrula
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Klan etiketini doğrula</DialogTitle>
          <DialogDescription>
            Sahibi olduğunu kanıtlamak için: aşağıdaki kodu oyun içinde klan açıklamasına ekle,
            sonra "Şimdi kontrol et"e bas.
          </DialogDescription>
        </DialogHeader>

        {code ? (
          <div className="space-y-3">
            <div className="bg-muted rounded-md p-4 text-center font-mono text-xl">{code}</div>
            <p className="text-muted-foreground text-xs">
              Kodu kopyala → CoC'ta klan ayarları → Açıklama → ekle/kaydet → buraya dön. Kod 30
              dakika geçerli.
            </p>
            <DialogFooter>
              <Button onClick={onCheck} disabled={pending}>
                {pending ? "Kontrol ediliyor…" : "Şimdi kontrol et"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <DialogFooter>
            <Button onClick={onRequest} disabled={pending}>
              {pending ? "Kod alınıyor…" : "Kod oluştur"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
