"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createPlayerListing, lookupPlayer } from "./actions";

const LOOKING_FOR_TAGS = [
  "war-clan",
  "casual",
  "cwl",
  "yetişkin",
  "küfürsüz",
  "donate-yoğun",
  "rush'a-uygun",
] as const;

const WAR_FREQUENCIES = [
  { value: "ANY", label: "Fark etmez" },
  { value: "ALWAYS", label: "Sürekli" },
  { value: "MORE_THAN_ONCE_PER_WEEK", label: "Haftada birden fazla" },
  { value: "ONCE_PER_WEEK", label: "Haftada bir" },
  { value: "LESS_THAN_ONCE_PER_WEEK", label: "Haftada birden az" },
  { value: "NEVER", label: "İstemiyorum" },
] as const;

export function PlayerListingForm() {
  const [tag, setTag] = useState("");
  const [autoFilled, setAutoFilled] = useState<{
    ingameName?: string;
    thLevel?: number;
    trophies?: number;
    heroes?: { BK?: number; AQ?: number; GW?: number; RC?: number };
  } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [warFreq, setWarFreq] = useState<string>("ANY");
  const [lookingUp, startLookup] = useTransition();
  const [submitting, startSubmit] = useTransition();

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const onLookup = () => {
    if (!tag) return;
    startLookup(async () => {
      const res = await lookupPlayer(tag);
      if (res.ok) {
        const heroMap = (res.player.heroes ?? []).reduce<Record<string, number>>((acc, h) => {
          if (h.village !== "home") return acc;
          if (h.name === "Barbarian King") acc.BK = h.level;
          if (h.name === "Archer Queen") acc.AQ = h.level;
          if (h.name === "Grand Warden") acc.GW = h.level;
          if (h.name === "Royal Champion") acc.RC = h.level;
          return acc;
        }, {});
        setAutoFilled({
          ingameName: res.player.name,
          thLevel: res.player.townHallLevel,
          trophies: res.player.trophies,
          heroes: heroMap,
        });
        toast.success(`Oyuncu bulundu: ${res.player.name}`);
      } else {
        toast.error(res.error);
      }
    });
  };

  const onSubmit = (formData: FormData) => {
    formData.set("preferredWarFreq", warFreq);
    for (const t of tags) formData.append("lookingFor", t);
    startSubmit(async () => {
      const res = await createPlayerListing(formData);
      if (res && !res.ok) toast.error(res.error);
    });
  };

  return (
    <form action={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Oyuncu etiketi (opsiyonel)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cocPlayerTag">CoC oyuncu etiketin</Label>
            <div className="flex gap-2">
              <Input
                id="cocPlayerTag"
                name="cocPlayerTag"
                placeholder="#ABC123"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <Button type="button" onClick={onLookup} disabled={!tag || lookingUp}>
                {lookingUp ? <Loader2 className="size-4 animate-spin" /> : "Otomatik doldur"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Etiketini verirsen TH, kupa ve hero level'larını biz çekeriz. Vermek istemezsen elle
              doldurabilirsin.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hakkında</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="ingameName">Oyun içi adın</Label>
              <Input
                id="ingameName"
                name="ingameName"
                required
                defaultValue={autoFilled?.ingameName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thLevel">TH seviyesi</Label>
              <Input
                id="thLevel"
                name="thLevel"
                type="number"
                min={1}
                max={17}
                required
                defaultValue={autoFilled?.thLevel ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trophies">Kupa</Label>
              <Input
                id="trophies"
                name="trophies"
                type="number"
                min={0}
                max={8000}
                required
                defaultValue={autoFilled?.trophies ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Kendinden bahset</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={1000}
              placeholder="TH13 Türk oyuncuyum. Aktif war atarım. Yetişkin ortam tercih ederim…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            {(["BK", "AQ", "GW", "RC"] as const).map((h) => (
              <div key={h} className="space-y-2">
                <Label htmlFor={`hero.${h}`}>{h}</Label>
                <Input
                  id={`hero.${h}`}
                  name={`hero.${h}`}
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={autoFilled?.heroes?.[h] ?? ""}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tercihlerin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Aradığın savaş sıklığı</Label>
              <Select value={warFreq} onValueChange={setWarFreq}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAR_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeHours">Aktif saat</Label>
              <Input
                id="activeHours"
                name="activeHours"
                placeholder="20:00-23:00"
                pattern="\d{2}:\d{2}-\d{2}:\d{2}"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aradığın klan tipi</Label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_TAGS.map((t) => {
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDiscord">Discord davetin (opsiyonel)</Label>
            <Input
              id="contactDiscord"
              name="contactDiscord"
              type="url"
              placeholder="https://discord.com/users/…"
            />
            <p className="text-muted-foreground text-xs">
              Klan liderleri seninle bunun üzerinden iletişime geçebilir.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Yayınlanıyor…" : "İlanı yayınla"}
        </Button>
      </div>
    </form>
  );
}
