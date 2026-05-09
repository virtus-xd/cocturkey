// CoC API'ye doğrudan değil, kendi proxy servisimiz üzerinden istek atılır.
// Proxy nedenleri: (1) CoC API anahtarı IP-kilitli; Vercel dinamik IP'ye sahip,
// (2) Yanıtları cache'liyoruz (Redis), (3) Anahtar asla frontend'e sızmaz.
// Proxy ayrı bir repo'da: `coc-proxy/`. Detay: CLAUDE.md §6.

import { encodeCocTagForUrl } from "@/lib/coc/tag";

type FetchOptions = {
  /** Proxy üzerinde cache yenilemesi zorlanır. Manuel "yenile" butonu için. */
  forceRefresh?: boolean;
  signal?: AbortSignal;
};

class CocApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cocReason?: string,
  ) {
    super(message);
    this.name = "CocApiError";
  }
}

function getProxyConfig() {
  const url = process.env.COC_PROXY_URL;
  const secret = process.env.COC_PROXY_SECRET;
  if (!url || !secret) {
    throw new CocApiError(
      "CoC proxy yapılandırılmamış: COC_PROXY_URL ve COC_PROXY_SECRET ayarlanmalı.",
      500,
    );
  }
  return { url: url.replace(/\/$/, ""), secret };
}

async function proxyFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { url, secret } = getProxyConfig();
  const headers: Record<string, string> = {
    "x-proxy-secret": secret,
    accept: "application/json",
  };
  if (opts.forceRefresh) headers["x-force-refresh"] = "1";

  const res = await fetch(`${url}${path}`, {
    headers,
    signal: opts.signal,
    // Proxy'nin kendi cache'i var; Next'in fetch cache'ine de güvenebiliriz.
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

export const cocClient = {
  async getClan(tag: string, opts?: FetchOptions): Promise<CocClanSummary> {
    return proxyFetch<CocClanSummary>(`/clans/${encodeCocTagForUrl(tag)}`, opts);
  },
  async getPlayer(tag: string, opts?: FetchOptions): Promise<CocPlayerSummary> {
    return proxyFetch<CocPlayerSummary>(`/players/${encodeCocTagForUrl(tag)}`, opts);
  },
};

export { CocApiError };
