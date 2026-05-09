// CoC API'ye doğrudan değil, kendi proxy servisimiz üzerinden istek atılır.
// Proxy nedenleri: (1) CoC API anahtarı IP-kilitli; Vercel dinamik IP'ye sahip,
// (2) Yanıtları cache'liyoruz (Redis), (3) Anahtar asla frontend'e sızmaz.
// Proxy ayrı bir repo'da: `coc-proxy/`. Detay: CLAUDE.md §6.

import { encodeCocTagForUrl } from "@/lib/coc/tag";
import { getMockClan, getMockPlayer } from "@/lib/coc/mock";

type FetchOptions = {
  /** Proxy üzerinde cache yenilemesi zorlanır. Manuel "yenile" butonu için. */
  forceRefresh?: boolean;
  signal?: AbortSignal;
};

export class CocApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cocReason?: string,
  ) {
    super(message);
    this.name = "CocApiError";
  }
}

// Tip tanımları MVP için minimal — ihtiyaç oldukça genişletilir.
export type CocClanSummary = {
  tag: string;
  name: string;
  clanLevel: number;
  description?: string;
  badgeUrls?: { small?: string; medium?: string; large?: string };
  warFrequency: string;
  warWinStreak: number;
  warWins: number;
  members: number;
  clanPoints: number;
  requiredTownhallLevel?: number;
  requiredTrophies?: number;
};

export type CocPlayerSummary = {
  tag: string;
  name: string;
  townHallLevel: number;
  trophies: number;
  bestTrophies: number;
  heroes?: Array<{ name: string; level: number; village: string }>;
};

function isProxyConfigured() {
  return Boolean(process.env.COC_PROXY_URL && process.env.COC_PROXY_SECRET);
}

function shouldUseMock() {
  // Proxy yoksa: dev'de mock, üretimde hata. Üretimde sessizce mock dönmek
  // tehlikeli — kullanıcı yanlış veriyle ilan verebilir.
  if (isProxyConfigured()) return false;
  if (process.env.NODE_ENV === "production") return false;
  return true;
}

async function proxyFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = process.env.COC_PROXY_URL!.replace(/\/$/, "");
  const secret = process.env.COC_PROXY_SECRET!;
  const headers: Record<string, string> = {
    "x-proxy-secret": secret,
    accept: "application/json",
  };
  if (opts.forceRefresh) headers["x-force-refresh"] = "1";

  const res = await fetch(`${url}${path}`, {
    headers,
    signal: opts.signal,
    next: { revalidate: opts.forceRefresh ? 0 : 60 },
  });

  if (!res.ok) {
    let reason: string | undefined;
    try {
      const body = (await res.json()) as { reason?: string; message?: string };
      reason = body.reason ?? body.message;
    } catch {
      /* yutulur */
    }
    throw new CocApiError(`CoC proxy hatası (${res.status})`, res.status, reason);
  }

  return (await res.json()) as T;
}

export const cocClient = {
  async getClan(tag: string, opts?: FetchOptions): Promise<CocClanSummary> {
    if (shouldUseMock()) {
      const mock = getMockClan(tag);
      if (!mock) {
        throw new CocApiError(`Mock klan bulunamadı: ${tag}`, 404, "mock_not_found");
      }
      return mock;
    }
    if (!isProxyConfigured()) {
      throw new CocApiError(
        "CoC proxy yapılandırılmamış: COC_PROXY_URL ve COC_PROXY_SECRET ayarlanmalı.",
        500,
      );
    }
    return proxyFetch<CocClanSummary>(`/clans/${encodeCocTagForUrl(tag)}`, opts);
  },
  async getPlayer(tag: string, opts?: FetchOptions): Promise<CocPlayerSummary> {
    if (shouldUseMock()) {
      const mock = getMockPlayer(tag);
      if (!mock) {
        throw new CocApiError(`Mock oyuncu bulunamadı: ${tag}`, 404, "mock_not_found");
      }
      return mock;
    }
    if (!isProxyConfigured()) {
      throw new CocApiError(
        "CoC proxy yapılandırılmamış: COC_PROXY_URL ve COC_PROXY_SECRET ayarlanmalı.",
        500,
      );
    }
    return proxyFetch<CocPlayerSummary>(`/players/${encodeCocTagForUrl(tag)}`, opts);
  },
};

/** CoC API hata kodunu kullanıcıya gösterilebilir Türkçe mesaja çevir. */
export function cocErrorToUserMessage(err: unknown): string {
  if (err instanceof CocApiError) {
    if (err.status === 404) return "Bu etikette bir klan bulunamadı. Etiketi kontrol et.";
    if (err.status === 403) return "Bu klan API'ye kapalı veya bizim erişimimiz yok.";
    if (err.status === 429) return "Çok hızlı denedin, biraz bekle.";
    if (err.status >= 500) return "Klan verisi şu anda alınamıyor, lütfen daha sonra tekrar dene.";
  }
  return "Beklenmeyen bir hata oldu, birkaç saniye sonra tekrar dene.";
}
