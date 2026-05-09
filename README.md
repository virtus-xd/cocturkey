# Türkiye CoC Klan Bulma Platformu (geçici ad: coc-klan)

Türkiye'deki Clash of Clans oyuncuları ve klan liderleri için Türkçe, mobil-öncelikli bir klan/oyuncu eşleştirme platformu.

> **Not:** "Clash of Clans" ifadesi nihai ürün/domain adında **kullanılmayacak** (Supercell Fan Content Policy gereği). Bu repo `coc-klan` adıyla geçici olarak duruyor.

## Hızlı önizleme (env'siz)

Sadece görsel önizleme için Supabase/DB kurmadan:

```bash
pnpm install
pnpm dev
```

`<http://localhost:3000>` — landing, marketing sayfaları, giriş formu görünür.
Korumalı sayfalar (`/ilan-ver`, `/profil`, `/admin`) "oturum yok" davranışıyla `/giris`'e atar; klan/oyuncu listeleri boş döner.

## Tam akışı çalıştırma — sırayla

### 1. Bağımlılıklar

```bash
pnpm install
```

### 2. Supabase projesi aç

1. <https://supabase.com> → "New project". Bölge `eu-central-1` (İstanbul'a yakın).
2. **Settings → Database → Connection string**: hem `Transaction` (port 6543, pooled) hem `Direct` (port 5432) modunu kopyala.
3. **Settings → API**: `URL`, `anon public key`, `service_role` key'i kopyala.
4. **Authentication → Providers → Discord**: Discord developer portal'dan app aç ([talimat](https://supabase.com/docs/guides/auth/social-login/auth-discord)). Redirect URL Supabase'in verdiği `https://<proje>.supabase.co/auth/v1/callback`.
5. **Authentication → Email templates → Magic link**: Türkçeye çevir (opsiyonel ama nazik).

### 3. `.env.local` oluştur

```bash
cp .env.example .env.local
```

Doldurman gerekenler:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<proje>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL="postgresql://postgres.<proje>:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<proje>:...@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Diğer servisler opsiyonel: olmadığında ilgili özellik no-op olur:

| Eksik env                            | Etki                                           |
| ------------------------------------ | ---------------------------------------------- |
| `RESEND_API_KEY`                     | Başvuru e-postaları console.log'a düşer        |
| `COC_PROXY_URL` + `COC_PROXY_SECRET` | Dev'de mock fixture (`#TR2025` vs.) kullanılır |
| `SENTRY_DSN`                         | Hata izleme yok                                |
| `UPSTASH_REDIS_REST_URL/TOKEN`       | Cache yok (proxy tarafında)                    |
| `TURNSTILE_*`                        | Captcha yok                                    |

### 4. Veritabanı migration + seed

```bash
pnpm db:generate           # Prisma client üret
pnpm exec prisma migrate dev --name init   # ilk migration
pnpm db:seed               # demo veri (5 klan, 3 oyuncu, 1 admin)
```

### 5. (İlk girişten sonra) Kendini admin yap

`/giris` üzerinden bir kere magic link ile giriş yap, sonra:

```bash
pnpm promote:admin erdemoz2003@gmail.com
```

Bu kullanıcı artık `/admin` panele girebilir. (Seed çalıştırdıysan `erdemoz2003@gmail.com` zaten ADMIN — gerçek girişle eşlendiğinde rol korunur.)

### 6. CoC API proxy (üretim için)

`coc-proxy/README.md`'ye bak. Özet:

- DigitalOcean droplet ($6/ay) → sabit IP
- `developer.clashofclans.com` → API key + droplet IP whitelist
- Droplet'te `docker build && docker run`
- `.env.local`'e `COC_PROXY_URL` + `COC_PROXY_SECRET` ekle

Lokal geliştirme için proxy zorunlu değil — mock fixture devreye girer.

### 7. Üretime al (Vercel)

1. <https://vercel.com> → "Import Git Repository" → bu repo.
2. Build command: `pnpm build` (Vercel otomatik algılar)
3. Environment Variables: `.env.local`'deki tüm değerleri ekle (sırlar dahil).
4. Custom domain bağla (ürün adı kararından sonra).
5. Cloudflare DNS + Proxy aç.

## Komutlar

| Komut                | Ne yapar                     |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Geliştirme sunucusu          |
| `pnpm build`         | Üretim için derler           |
| `pnpm start`         | Üretim sunucusunu çalıştırır |
| `pnpm lint`          | ESLint                       |
| `pnpm typecheck`     | TypeScript tip kontrolü      |
| `pnpm format`        | Prettier ile biçimlendirir   |
| `pnpm test`          | Vitest unit testleri         |
| `pnpm db:migrate`    | Prisma migrate (dev)         |
| `pnpm db:deploy`     | Prisma migrate (production)  |
| `pnpm db:studio`     | Prisma Studio (DB tarayıcı)  |
| `pnpm db:seed`       | Demo veriyi yükler           |
| `pnpm promote:admin` | Bir kullanıcıyı ADMIN yapar  |

## Yığın

- **Framework:** Next.js 16 (App Router) — RSC, server actions, dynamic routes.
- **Dil:** TypeScript (strict).
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix + Lucide + Geist).
- **DB:** PostgreSQL (Supabase) + Prisma 7 (driver adapter `@prisma/adapter-pg`).
- **Auth:** Supabase Auth — magic link + Discord OAuth.
- **State (server):** TanStack Query. **State (UI):** Zustand.
- **E-posta:** Resend (transactional).
- **CoC API:** kendi proxy servisimiz (`coc-proxy/`).

Detaylı mimari, kararlar ve yol haritası için **[`CLAUDE.md`](./CLAUDE.md)** dosyasına bak.

## Klasör yapısı

```
src/
├── app/
│   ├── (marketing)/      # Hakkında, Gizlilik, KVKK, Şartlar
│   ├── (app)/            # Klanlar, Oyuncular, İlan ver, Profil
│   ├── (auth)/           # Giriş
│   ├── admin/            # Yönetim paneli (rol guard'lı)
│   ├── auth/             # OAuth callback + sign-out
│   └── api/              # API route'ları
├── components/
│   ├── ui/               # shadcn/ui
│   ├── shared/           # Header, Footer, ThemeProvider, ReportDialog
│   ├── clan/, player/    # Domain kartları
│   └── filters/          # Liste filtreleri
├── lib/
│   ├── auth/             # Supabase server/browser/middleware client'ları
│   ├── coc/              # Proxy client + tag normalize + mock fixture
│   ├── db/               # Prisma client + sorgu helper'ları
│   ├── email/            # Resend client + templates
│   ├── reports/          # Şikayet server actions
│   ├── validation/       # Zod şemaları (clan, player, report)
│   └── verify/           # Klan tag doğrulama
├── i18n/                 # tr.json (varsayılan), en.json
└── types/
prisma/
├── schema.prisma
└── seed.ts
scripts/
└── promote-admin.ts      # CLI: kullanıcıyı admin yap
coc-proxy/                # Ayrı servis (kendi repo'suna taşınacak)
tests/
├── unit/                 # Vitest
└── e2e/                  # Playwright (yapılacak)
```

## Yasal

Bu site Supercell tarafından onaylanmamıştır. Tüm Clash of Clans marka ve görselleri Supercell'e aittir. Detay: <https://supercell.com/en/fan-content-policy/>

## Lisans

Henüz belirlenmedi (private repo).
