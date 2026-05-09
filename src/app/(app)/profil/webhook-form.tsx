"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { saveDiscordWebhook } from "./actions";

export function WebhookForm({ defaultValue }: { defaultValue: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await saveDiscordWebhook(fd);
          if (res.ok) toast.success("Webhook kaydedildi.");
          else toast.error(res.error);
        })
      }
      className="space-y-2"
    >
      <Label htmlFor="discordWebhookUrl">Discord webhook URL'in</Label>
      <div className="flex gap-2">
        <Input
          id="discordWebhookUrl"
          name="discordWebhookUrl"
          type="url"
          defaultValue={defaultValue ?? ""}
          placeholder="https://discord.com/api/webhooks/..."
        />
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Klanına başvuru gelince bu webhook'a embed gönderilir. Boş bırakırsan kapatılır. Discord
        sunucu ayarları → Entegrasyonlar → Webhooks'tan oluşturabilirsin.
      </p>
    </form>
  );
}
