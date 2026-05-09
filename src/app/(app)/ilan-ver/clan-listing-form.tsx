"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { CocClanSummary } from "@/lib/coc/client";
import { warFrequencyLabel, mapWarFrequency } from "@/lib/coc/mappers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createClanListing, lookupClan } from "./actions";

const SUGGESTED_TAGS = [
  "aile-dostu",
  "rekabetçi",
  "war-odaklı",
  "cwl-master",
  "casual",
  "sıfır-küfür",
  "discord-zorunlu",
  "donate-yoğun",
  "yetişkin",
  "th15+",
] as const;

export function ClanListingForm() {
  const [tag, setTag] = useState("");
  const [clan, setClan] = useState<CocClanSummary | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [lookingUp, startLookup] = useTransition();
  const [submitting, startSubmit] = useTransition();

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const onLookup = () => {
    startLookup(async () => {
      const res = await lookupClan(tag);
      if (res.ok) {
        setClan(res.clan);
        toast.success(`Klan bulundu: ${res.clan.name}`);
      } else {
        setClan(null);
        toast.error(res.error);
      }
    });
  };

  const onSubmit = (formData: FormData) => {
    if (!clan) return;
    formData.set("clanTag", clan.tag);
    for (const t of tags) formData.append("tags", t);
    startSubmit(async () => {
      const res = await createClanListing(formData);
      if (res && !res.ok) toast.error(res.error);
      // ok ise redirect olur, burada bir şey yapmıyoruz
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" /> 1. Klan etiketi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="clan-tag">CoC klan etiketi</Label>
            <div className="flex gap-2">
              <Input
                id="clan-tag"
                placeholder="#2PP veya 2pp"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                disabled={lookingUp}
              />
              <Button type="button" onClick={onLookup} disabled={!tag || lookingUp}>
                {lookingUp ? <Loader2 className="size-4 animate-spin" /> : "Klanı bul"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Klan etiketin oyun içinde "Klanım" → "Klan profili" → ad altında yazıyor.
            </p>
          </div>

          {clan ? (
            <div className="border-border/60 mt-4 flex items-center gap-4 rounded-lg border p-3">
              {clan.badgeUrls?.medium ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clan.badgeUrls.medium}
                  alt=""
                  className="size-14 rounded"
                  width={56}
                  height={56}
                />
              ) : null}
              <div className="flex-1">
                <p className="font-semibold">{clan.name}</p>
                <p className="text-muted-foreground text-xs">{clan.tag}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary">Lvl {clan.clanLevel}</Badge>
                  <Badge variant="secondary">{clan.members}/50</Badge>
                  <Badge variant="secondary">
                    {warFrequencyLabel(mapWarFrequency(clan.warFrequency))}
                  </Badge>
                  {clan.requiredTownhallLevel ? (
                    <Badge variant="secondary">TH {clan.requiredTownhallLevel}+</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {clan ? (
        <form action={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>2. Klanını anlat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="customDescription">Türkçe tanıtım</Label>
                <Textarea
                  id="customDescription"
                  name="customDescription"
                  rows={5}
                  placeholder="Aktif, sürekli war atan bir klanız. CWL Master 1, küfürsüz, yetişkin ortam…"
                  maxLength={2000}
                />
                <p className="text-muted-foreground text-xs">
                  Oyun içi açıklama yetmediğinde aday oyuncuya senden ne göreceğini anlat. Maks 2000
                  karakter.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activeHours">Aktif saat aralığı</Label>
                  <Input
                    id="activeHours"
                    name="activeHours"
                    placeholder="20:00-23:00"
                    pattern="\d{2}:\d{2}-\d{2}:\d{2}"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Klan dili</Label>
                  <Input id="language" name="language" defaultValue="tr" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discordInvite">Discord daveti</Label>
                  <Input
                    id="discordInvite"
                    name="discordInvite"
                    type="url"
                    placeholder="https://discord.gg/…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappLink">WhatsApp daveti</Label>
                  <Input
                    id="whatsappLink"
                    name="whatsappLink"
                    type="url"
                    placeholder="https://chat.whatsapp.com/…"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etiketler</Label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={
                          "rounded-full border px-3 py-1 text-xs transition-colors " +
                          (active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted")
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                {tags.length > 0 ? (
                  <p className="text-muted-foreground text-xs">Seçilenler: {tags.join(", ")}</p>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Yayınlanıyor…" : "İlanı yayınla"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}
    </div>
  );
}
