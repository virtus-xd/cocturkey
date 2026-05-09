"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TH_LEVEL } from "@/lib/constants";

const WAR_FREQUENCIES = [
  { value: "any", label: "Hepsi" },
  { value: "ALWAYS", label: "Sürekli" },
  { value: "MORE_THAN_ONCE_PER_WEEK", label: "Haftada birden fazla" },
  { value: "ONCE_PER_WEEK", label: "Haftada bir" },
  { value: "LESS_THAN_ONCE_PER_WEEK", label: "Haftada birden az" },
  { value: "NEVER", label: "Asla" },
] as const;

export function ClanFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "any") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("cursor"); // filtre değişince sayfayı sıfırla
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setParam("search", String(fd.get("search") ?? ""));
      }}
      className="bg-card border-border/60 sticky top-14 z-30 rounded-lg border p-3 backdrop-blur"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="search" className="text-xs">
            Klan adı / etiket
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="search"
              name="search"
              defaultValue={searchParams.get("search") ?? ""}
              className="pl-8"
              placeholder="ara…"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minTH" className="text-xs">
            Min TH
          </Label>
          <Input
            id="minTH"
            type="number"
            min={TH_LEVEL.min}
            max={TH_LEVEL.max}
            defaultValue={searchParams.get("minTH") ?? ""}
            onBlur={(e) => setParam("minTH", e.target.value)}
            placeholder={String(TH_LEVEL.defaultMin)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="warFrequency" className="text-xs">
            Savaş sıklığı
          </Label>
          <Select
            value={searchParams.get("warFrequency") ?? "any"}
            onValueChange={(v) => setParam("warFrequency", v)}
          >
            <SelectTrigger id="warFrequency">
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
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {pending ? "Filtreleniyor…" : "Filtreler URL'de saklanır, paylaşabilirsin."}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.replace(pathname, { scroll: false })}
        >
          Sıfırla
        </Button>
      </div>
    </form>
  );
}
