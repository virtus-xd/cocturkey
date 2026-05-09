# coc-proxy

CoC API'ye sabit IP üzerinden istek atan + Redis ile cache'leyen küçük Node servis.

> **Bu klasör eninde sonunda ayrı bir Git repo olacak** (CLAUDE.md §6). Ana proje (coc-klan) bu servise HTTP üzerinden erişir, kendisi CoC API'ye direkt istek atmaz.

## Niçin var

- CoC API anahtarları **IP-kilitli** — Vercel'in dinamik IP'leri whitelist edilemiyor.
- Bu servis, **DigitalOcean droplet'inde** (veya benzeri sabit IP'li VPS'te) çalışıyor; tek IP'ye whitelist edilmiş anahtar burada yaşıyor.
- Aynı zamanda **cache** katmanı sağlıyor (Upstash Redis): klan verisi 10 dk, oyuncu verisi 5 dk TTL.

## Kurulum (yerel geliştirme)

```bash
cp .env.example .env
# .env'yi doldur: PROXY_SECRET (rastgele uzun string), COC_API_TOKEN
pnpm install   # veya npm install
pnpm dev
# http://localhost:3001/health → { ok: true }
```

## Endpoint'ler

| Method | Path | Açıklama |
|---|---|---|
| `GET` | `/health` | Auth gerektirmez. Sağlık kontrolü. |
| `GET` | `/clans/:tag` | URL-encoded tag (örn. `%23ABC123`). Cache TTL: 10 dk. |
| `GET` | `/players/:tag` | URL-encoded tag. Cache TTL: 5 dk. |

İstek başlıkları:
- `x-proxy-secret`: `PROXY_SECRET` ile eşleşmeli (zorunlu)
- `x-force-refresh: 1`: cache'i bypass eder, fresh CoC çağrısı atar

## Konuşlandırma — DigitalOcean droplet (en küçük: $6/ay)

1. **Droplet oluştur** — `Ubuntu 24.04`, en ufak plan.
2. **Sabit IP'yi al** (droplet'in public IP'si zaten sabit).
3. `developer.clashofclans.com` → "My Account" → API anahtarı oluştur, IP whitelist'e droplet IP'sini ekle.
4. **Droplet üzerinde:**
   ```bash
   sudo apt update && sudo apt install -y docker.io
   git clone <bu-repo> coc-proxy && cd coc-proxy
   cp .env.example .env  # .env'yi doldur
   docker build -t coc-proxy .
   docker run -d --name coc-proxy --restart=always -p 80:3001 --env-file .env coc-proxy
   ```
5. **HTTPS için:** Caddy veya nginx + Let's Encrypt ile ön taraf koy. Ya da droplet'i Cloudflare arkasına alıp "Full" SSL kullan.
6. Ana app'in `.env.local`'inde:
   ```
   COC_PROXY_URL=https://coc-proxy.alanın.com
   COC_PROXY_SECRET=<aynı PROXY_SECRET>
   ```

## Güvenlik

- `PROXY_SECRET` **uzun ve rastgele** olmalı (`openssl rand -hex 32`).
- CoC anahtarı **bu sunucudan dışarı çıkmaz**.
- Rate limit (in-memory): 8 req/sn/IP. Daha sıkı limit gerekirse Redis-based limit'e geç.
- Public endpoint olduğu için `ALLOW_ORIGIN`'i ana app'in URL'ine kilitle.

## Cache stratejisi

- Cache key: `clan:%23ABC123`, `player:%23DEF456` (URL-encoded tag).
- 200 dışında yanıt cache'lenmez (404, 503 vs. her seferinde fresh).
- `x-force-refresh: 1` ile manuel yenileme — kullanıcının "yenile" butonu bunu tetikler.

## Test

```bash
curl http://localhost:3001/health
curl -H "x-proxy-secret: SECRET" http://localhost:3001/clans/%232PP
```
