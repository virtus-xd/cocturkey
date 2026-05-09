// CoC API proxy. Tek görevi: ana app'ten gelen istekleri kendi IP'sinden
// CoC API'ye iletmek + Redis cache koymak.
//
// Konuşlandırma: DigitalOcean droplet (sabit IP). IP'yi
// developer.clashofclans.com'da CoC anahtarına whitelist et.

import express, { type Request, type Response, type NextFunction } from "express";
import { Redis } from "@upstash/redis";

// ─── Config ───────────────────────────────────────────────
const env = (key: string, required = true): string => {
  const v = process.env[key];
  if (!v && required) {
    console.error(`FATAL: ${key} env yok`);
    process.exit(1);
  }
  return v ?? "";
};

const PORT = Number(process.env.PORT ?? 3001);
const PROXY_SECRET = env("PROXY_SECRET");
const COC_API_TOKEN = env("COC_API_TOKEN");
const COC_API_BASE = process.env.COC_API_BASE ?? "https://api.clashofclans.com/v1";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "*";

// Cache TTL'leri (saniye). client.ts ile uyumlu olmalı.
const TTL = {
  clan: Number(process.env.CACHE_TTL_CLAN ?? 600), // 10 dk
  player: Number(process.env.CACHE_TTL_PLAYER ?? 300), // 5 dk
};

// Redis (Upstash REST). Ortam yoksa cache devre dışı; yine de çalışır.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  console.warn("UYARI: Upstash Redis ayarlı değil — cache devre dışı.");
}

// ─── In-memory rate limiter ───────────────────────────────
// Pratikte ~10 req/sn/anahtar güvenli. Daha sıkı tutuyoruz.
const RATE = { windowMs: 1000, max: 8 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE.max;
}

// ─── Helpers ──────────────────────────────────────────────
async function fetchFromCoc(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${COC_API_BASE}${path}`, {
    headers: {
      authorization: `Bearer ${COC_API_TOKEN}`,
      accept: "application/json",
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function withCache(
  key: string,
  ttlSeconds: number,
  forceRefresh: boolean,
  fetcher: () => Promise<{ status: number; body: unknown }>,
): Promise<{ status: number; body: unknown; cached: boolean }> {
  if (redis && !forceRefresh) {
    const cached = await redis.get<{ status: number; body: unknown }>(key);
    if (cached) return { ...cached, cached: true };
  }
  const fresh = await fetcher();
  if (redis && fresh.status >= 200 && fresh.status < 300) {
    await redis.set(key, fresh, { ex: ttlSeconds });
  }
  return { ...fresh, cached: false };
}

// ─── Middlewares ──────────────────────────────────────────
function authGuard(req: Request, res: Response, next: NextFunction) {
  const secret = req.header("x-proxy-secret");
  if (secret !== PROXY_SECRET) {
    return res.status(401).json({ reason: "unauthorized" });
  }
  next();
}

function rateGuard(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ reason: "rate_limited" });
  }
  next();
}

function corsAndJson(req: Request, res: Response, next: NextFunction) {
  res.setHeader("access-control-allow-origin", ALLOW_ORIGIN);
  res.setHeader("access-control-allow-headers", "x-proxy-secret, content-type, x-force-refresh");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
}

// ─── App ──────────────────────────────────────────────────
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(corsAndJson);

// Health (auth gerektirmez)
app.get("/health", (_req, res) => res.json({ ok: true, redis: Boolean(redis) }));

app.use(authGuard, rateGuard);

app.get("/clans/:tag", async (req, res) => {
  const tag = req.params.tag; // URL-encoded gelmeli (#%23ABC)
  const force = req.header("x-force-refresh") === "1";
  const key = `clan:${tag}`;
  try {
    const { status, body, cached } = await withCache(key, TTL.clan, force, async () =>
      fetchFromCoc(`/clans/${tag}`),
    );
    res.setHeader("x-cache", cached ? "HIT" : "MISS");
    res.status(status).json(body);
  } catch (e) {
    console.error(e);
    res.status(502).json({ reason: "upstream_error" });
  }
});

app.get("/players/:tag", async (req, res) => {
  const tag = req.params.tag;
  const force = req.header("x-force-refresh") === "1";
  const key = `player:${tag}`;
  try {
    const { status, body, cached } = await withCache(key, TTL.player, force, async () =>
      fetchFromCoc(`/players/${tag}`),
    );
    res.setHeader("x-cache", cached ? "HIT" : "MISS");
    res.status(status).json(body);
  } catch (e) {
    console.error(e);
    res.status(502).json({ reason: "upstream_error" });
  }
});

app.use((_req, res) => res.status(404).json({ reason: "not_found" }));

app.listen(PORT, () => {
  console.log(`coc-proxy listening on :${PORT}`);
});
