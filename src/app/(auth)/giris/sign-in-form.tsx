"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { signInWithDiscord, signInWithMagicLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ next }: { next: string }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <form
        action={(fd) => {
          fd.set("next", next);
          startTransition(async () => {
            const result = await signInWithMagicLink(fd);
            if (result.ok) {
              setSent(true);
              toast.success(result.message);
            } else {
              toast.error(result.error);
            }
          });
        }}
        className="space-y-3"
      >
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ornek@eposta.com"
            autoComplete="email"
            disabled={pending || sent}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending || sent}>
          {sent ? "Bağlantı gönderildi" : pending ? "Gönderiliyor…" : "Magic link gönder"}
        </Button>
      </form>

      <div className="relative">
        <div className="border-border absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background text-muted-foreground px-2">veya</span>
        </div>
      </div>

      <form action={signInWithDiscord}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" className="w-full" disabled={pending}>
          Discord ile giriş yap
        </Button>
      </form>
    </div>
  );
}
