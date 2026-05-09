# Türkiye CoC Klan Bulma Platformu (geçici ad: coc-klan)

Türkiye'deki Clash of Clans oyuncuları ve klan liderleri için Türkçe, mobil-öncelikli bir klan/oyuncu eşleştirme platformu.

> **Not:** "Clash of Clans" ifadesi nihai ürün/domain adında **kullanılmayacak** (Supercell Fan Content Policy gereği). Bu repo `coc-klan` adıyla geçici olarak duruyor.

## Hızlı başlangıç

```bash
# Bağımlılıklar
pnpm install

# Ortam değişkenleri
cp .env.example .env.local
# .env.local'i düzenle (en azından DATABASE_URL ve DIRECT_URL gerekir)

# Prisma şeması
pnpm db:generate

# Geliştirme sunucusu
pnpm dev
```

Tarayıcıda <http://localhost:3000> adresini aç.

## Komutlar

| Komut             | Ne yapar                     |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Geliştirme sunucusu          |
| `pnpm build`      | Üretim için derler           |
| `pnpm start`      | Üretim sunucusunu çalıştırır |
| `pnpm lint`       | ESLint                       |
| `pnpm typecheck`  | TypeScript tip kontrolü      |
| `pnpm format`     | Prettier ile biçimlendirir   |
| `pnpm test`       | Vitest unit testleri         |
| `pnpm db:migrate` | Prisma migrate (dev)         |
| `pnpm db:studio`  | Prisma Studio                |

## Yığın

- **Framework:** Next.js 16 (App Router) — dynamic routes, RSC.
- **Dil:** TypeScript (strict).
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix + Lucide + Geist).
- **DB:** PostgreSQL (Supabase) + Prisma 7.
- **Auth:** Supabase Auth (e-posta + Discord OAuth).
- **State (server):** TanStack Query. **State (UI):** Zustand.
- **CoC API:** kendi proxy servisimiz üzerinden (ayrı repo: `coc-proxy/`).

Detaylı mimari, kararlar ve yol haritası için **[`CLAUDE.md`](./CLAUDE.md)** dosyasına bak — projedeki tek doğru kaynak.

## Klasör yapısı

```
src/
├── app/             # App Router rotaları
│   ├── (marketing)/ # Public sayfalar (hakkında, gizlilik, ...)
│   ├── (app)/       # Uygulama (klanlar, oyuncular, ilan ver, profil)
│   └── api/         # API route'ları
├── components/
│   ├── ui/          # shadcn/ui bileşenleri
│   ├── shared/      # Header, Footer, ThemeProvider
│   ├── clan/        # Klan kartı vs.
│   ├── player/      # Oyuncu kartı vs.
│   └── filters/     # Filtre bileşenleri
├── lib/
│   ├── coc/         # CoC API client (proxy üzerinden)
│   ├── db/          # Prisma client
│   ├── auth/        # Auth helpers
│   ├── validation/  # Zod şemaları
│   └── utils.ts
├── hooks/
├── i18n/            # tr.json (varsayılan), en.json
└── types/
prisma/
├── schema.prisma
└── seed.ts
tests/
├── unit/
└── e2e/
```

## Yasal

Bu site Supercell tarafından onaylanmamıştır. Tüm Clash of Clans marka ve görselleri Supercell'e aittir. Detay: <https://supercell.com/en/fan-content-policy/>

## Lisans

Henüz belirlenmedi (private repo).
