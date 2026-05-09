# CLAUDE.md — Türkiye CoC Klan Bulma Platformu

> Bu dosya **Claude Code**'un projeye dair tüm bağlamı, kuralları ve kararları tek bir yerden okuyabilmesi için hazırlanmıştır. Yeni bir özellik geliştirilirken, hata düzeltilirken veya refactor yapılırken **önce bu dosya okunmalıdır**.

---

## 1. Proje Özeti

**Ürün adı (geçici):** TBD — `clanbul.gg`, `klantr.com`, `coctr.app` gibi seçenekler değerlendirilecek. **"Clash of Clans"** ifadesi domain ya da ürün adında **kullanılamaz** (Supercell Fan Content Policy).

**Tek satırlık tanım:** Türkiye'deki Clash of Clans oyuncuları ve klan liderleri için, Türkçe ve mobil-öncelikli bir klan/oyuncu eşleştirme platformu.

**Hedef kitle:** TH 10+ aktif Türk CoC oyuncuları, klan liderleri ve rekabetçi oyuncular.

**Çözülen problem:** Mevcut global platformlar (ClashSpot, ClashChamps, Clash Hub) İngilizce ve Türk oyuncu kültürüne uzak; Türkler şu an klan bulmayı dağınık Discord/WhatsApp gruplarında yapıyor — merkezi, filtrelenebilir, güvenilir bir Türkçe çözüm yok.

**Başarı tanımı (ilk 6 ay):**

- 500+ kayıtlı klan ilanı
- 2.000+ kayıtlı oyuncu profili
- Aylık 5.000+ aktif kullanıcı
- 50+ doğrulanmış başvuru-kabul döngüsü

---

## 2. Geliştirici Profili ve Çalışma Şekli

- **Ekip:** Tek kişi (sahip + geliştirici aynı kişi).
- **Geliştirme aracı:** Claude Code.
- **Yaklaşım:** Agile / iteratif. MVP → kullanıcı geri bildirimi → V1 → V2.
- **Felsefe:**
  - Önce çalışan, sonra güzel.
  - Tek kişi sürdürebileceğinden fazla karmaşıklığa girme.
  - "Cool teknoloji" değil, "boring & proven teknoloji" tercih edilir.
  - Her özellik için "Bunu silmek ne kadar acı verir?" sorusu sorulur. Cevap "az" ise eklenir, "çok" ise iki kere düşünülür.

---

## 3. Teknoloji Yığını (Stack)

### Frontend

- **Framework:** Next.js 16 (App Router) — 2026-05-09 itibariyle `create-next-app@latest` Next 16 çekiyor; bu yüzden 15 yerine 16 kullanıyoruz.
- **React:** 19.2 (server actions, async transitions stabil).
- **Dil:** TypeScript (strict mode).
- **Styling:** Tailwind CSS **v4** (CSS-first yapılandırma: `globals.css` içinde `@theme inline`, `tailwind.config.js` yok).
- **UI bileşenleri:** shadcn/ui (Radix preset, Nova varyantı — Lucide + Geist font).
- **İkonlar:** lucide-react.
- **Form yönetimi:** react-hook-form + zod.
- **Veri çekme (client):** TanStack Query (React Query).
- **State (global, gerekirse):** Zustand — Redux KULLANMA.

### Backend

- **Runtime:** Next.js API Routes (App Router — `app/api/`)
- **Validasyon:** zod (frontend ile paylaşılan şemalar)
- **Auth:** Supabase Auth (email + Discord OAuth)

### Veritabanı

- **Sağlayıcı:** Supabase (managed PostgreSQL).
- **ORM:** Prisma **7** — bağlantı URL'leri schema yerine `prisma.config.ts`'te (`url = env(...)` kalktı).
- **Migration:** Prisma Migrate (`pnpm db:migrate` / `pnpm db:deploy`).
- **Cache:** Upstash Redis (CoC API yanıtları için).

### Altyapı

- **Hosting:** Vercel (frontend + API routes)
- **CoC API IP whitelist çözümü:** Vercel'in dinamik IP'leri olduğundan, CoC API çağrıları **ayrı bir küçük proxy servis** üzerinden yapılır. Seçenek: DigitalOcean droplet ($6/ay, sabit IP) üzerinde minimal bir Node servis. Ya da [Fixie](https://www.fixie.com/) / [QuotaGuard Static](https://www.quotaguard.com/) gibi static IP proxy servisleri.
- **Domain:** Cloudflare (DNS + DDoS koruması)
- **E-posta:** Resend (transactional)
- **Hata izleme:** Sentry (free tier yeter)
- **Analitik:** Plausible (privacy-friendly, KVKK uyumlu) veya Vercel Analytics

### Geliştirme araçları

- **Linter:** ESLint (next/core-web-vitals + typescript)
- **Formatter:** Prettier
- **Pre-commit:** Husky + lint-staged
- **Test:** Vitest (unit) + Playwright (e2e, sadece kritik akışlar)

---

## 4. Klasör Yapısı

```
.
├── CLAUDE.md                  # Bu dosya
├── README.md                  # Public proje özeti
├── .env.example               # Environment variable şablonu
├── .env.local                 # Yerel sırlar (git'e gitmez)
├── prisma/
│   ├── schema.prisma          # DB şeması
│   ├── migrations/            # Migration dosyaları
│   └── seed.ts                # Geliştirme seed verisi
├── public/                    # Statik dosyalar, favicon
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (marketing)/       # Landing, /about, /privacy, /terms
│   │   ├── (app)/             # Giriş gerektiren / ana uygulama
│   │   │   ├── klanlar/       # Klan listesi & detay
│   │   │   ├── oyuncular/     # Oyuncu ilanları
│   │   │   ├── ilan-ver/      # İlan oluşturma
│   │   │   └── profil/        # Kullanıcı profili
│   │   ├── api/
│   │   │   ├── clans/         # Klan CRUD endpoint'leri
│   │   │   ├── players/       # Oyuncu ilan endpoint'leri
│   │   │   ├── coc/           # CoC API proxy endpoint'leri
│   │   │   └── webhooks/      # Discord, ödeme vb.
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui bileşenleri
│   │   ├── clan/              # Klan kartı, klan detay vs.
│   │   ├── player/            # Oyuncu kartı, profil
│   │   ├── filters/           # Filtre bileşenleri
│   │   └── shared/            # Header, Footer, Layout
│   ├── lib/
│   │   ├── coc/               # CoC API client (proxy üzerinden)
│   │   ├── db/                # Prisma client
│   │   ├── auth/              # Auth helpers
│   │   ├── validation/        # Zod şemaları
│   │   └── utils.ts
│   ├── hooks/                 # Custom React hooks
│   ├── i18n/                  # Lokalizasyon (Türkçe öncelikli)
│   │   ├── tr.json
│   │   └── en.json
│   └── types/                 # Paylaşılan TypeScript tipleri
└── tests/
    ├── unit/
    └── e2e/
```

**Kural:** İmport yolları için her zaman `@/` alias'ı kullan (`@/lib/db`, `@/components/ui/button` gibi). Relative import (`../../lib`) **yasaktır**.

---

## 5. Veritabanı Şeması (İlk Taslak)

> Bu MVP için **minimum** şemadır. Yeni alanlar ihtiyaç duyuldukça migration ile eklenir. Şu an eklemediğimiz şeyler: gelişmiş analytics, özel mesajlaşma tabloları, ödeme. Bunlar V1+'a saklı.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Kullanıcı (site kullanıcısı) ──────────────────────
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  username        String   @unique
  discordId       String?  @unique
  cocPlayerTag    String?  @unique  // #ABC123 — opsiyonel doğrulama
  isVerified      Boolean  @default(false)
  role            UserRole @default(USER)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clanListings    ClanListing[]
  playerListings  PlayerListing[]
  applications    Application[]
  reports         Report[]        @relation("Reporter")
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

// ─── Klan İlanı ─────────────────────────────────────────
model ClanListing {
  id              String   @id @default(cuid())
  ownerId         String
  owner           User     @relation(fields: [ownerId], references: [id])

  // CoC API'den gelen veriler (cache'lenir, periyodik refresh)
  clanTag         String   @unique  // #2PP
  name            String
  level           Int
  description     String?
  trophies        Int
  warFrequency    WarFrequency
  warWinStreak    Int
  warWins         Int
  memberCount     Int
  requiredTH      Int
  requiredTrophies Int
  badgeUrl        String?
  lastSyncedAt    DateTime

  // Site sahibinin eklediği özel veriler
  customDescription String?  @db.Text  // Türkçe tanıtım yazısı
  language        String   @default("tr")
  timezone        String   @default("Europe/Istanbul")
  activeHours     String?  // "20:00-23:00" gibi
  discordInvite   String?
  whatsappLink    String?
  telegramLink    String?
  tags            String[] // ["aile-dostu", "rekabetçi", "war-odaklı"]

  // Yönetimsel
  status          ListingStatus @default(ACTIVE)
  bumpedAt        DateTime @default(now())  // sıralama için
  viewCount       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  applications    Application[]
  reports         Report[]

  @@index([status, bumpedAt])
  @@index([requiredTH])
}

enum WarFrequency {
  ALWAYS
  MORE_THAN_ONCE_PER_WEEK
  ONCE_PER_WEEK
  LESS_THAN_ONCE_PER_WEEK
  NEVER
  ANY
  UNKNOWN
}

enum ListingStatus {
  ACTIVE
  PAUSED
  ARCHIVED
  BANNED
}

// ─── Oyuncu İlanı ────────────────────────────────────────
model PlayerListing {
  id              String   @id @default(cuid())
  ownerId         String
  owner           User     @relation(fields: [ownerId], references: [id])

  cocPlayerTag    String?  @unique
  ingameName      String
  thLevel         Int
  trophies        Int
  heroLevels      Json?    // { "BK": 65, "AQ": 70, ... }

  bio             String?  @db.Text
  preferredWarFreq WarFrequency
  preferredLanguage String  @default("tr")
  timezone        String   @default("Europe/Istanbul")
  activeHours     String?
  lookingFor      String[] // ["war-clan", "casual", "cwl"]

  status          ListingStatus @default(ACTIVE)
  bumpedAt        DateTime @default(now())
  viewCount       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  reports         Report[]

  @@index([status, bumpedAt])
  @@index([thLevel])
}

// ─── Başvuru ─────────────────────────────────────────────
model Application {
  id              String   @id @default(cuid())
  applicantId     String
  applicant       User     @relation(fields: [applicantId], references: [id])
  clanListingId   String
  clanListing     ClanListing @relation(fields: [clanListingId], references: [id])
  message         String   @db.Text
  status          ApplicationStatus @default(PENDING)
  createdAt       DateTime @default(now())

  @@unique([applicantId, clanListingId])
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
}

// ─── Şikayet / Moderasyon ───────────────────────────────
model Report {
  id              String   @id @default(cuid())
  reporterId      String
  reporter        User     @relation("Reporter", fields: [reporterId], references: [id])
  clanListingId   String?
  clanListing     ClanListing? @relation(fields: [clanListingId], references: [id])
  playerListingId String?
  playerListing   PlayerListing? @relation(fields: [playerListingId], references: [id])
  reason          ReportReason
  details         String?  @db.Text
  status          ReportStatus @default(OPEN)
  createdAt       DateTime @default(now())
  resolvedAt      DateTime?
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  FAKE_INFO
  SCAM
  OTHER
}

enum ReportStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  DISMISSED
}
```

**Migration kuralları:**

- Her şema değişikliği `prisma migrate dev --name <açıklayıcı_isim>` ile yapılır.
- Production'da `prisma migrate deploy` kullanılır, asla `db push` değil.
- Veri kaybına neden olabilecek migration'lar PR'da işaretlenir.

---

## 6. CoC API Entegrasyonu — Kritik Notlar

### Yetkilendirme

- API anahtarı [developer.clashofclans.com](https://developer.clashofclans.com) üzerinden alınır.
- Anahtar **belirli IP'lere** kilitlidir. Bu Vercel ile sorunlu çünkü Vercel dinamik IP kullanır.

### Çözüm: Static IP Proxy

- DigitalOcean droplet (en küçük: $6/ay) üzerinde minimal Node.js proxy çalıştır.
- Proxy iki şey yapar:
  1. Gelen istekleri CoC API'ye yönlendirir (CoC anahtarı sadece bu sunucuda saklanır).
  2. Yanıtları Redis'e cache'ler (TTL: klan verisi 10 dk, oyuncu verisi 5 dk).
- Next.js `lib/coc/client.ts` bu proxy'ye istek atar, asla direkt CoC API'ye değil.
- Proxy'yi `coc-proxy/` adlı ayrı repo olarak tut. Bu CLAUDE.md ana proje içindir.

### Rate limit ve güvenlik

- CoC API resmi limit açıklamaz, pratikte ~10 req/sn/anahtar güvenli.
- **Cache her zaman önce kontrol edilir.** Direkt API çağrısı son çare.
- Hata durumlarında kullanıcıya "Klan verisi şu anda alınamıyor, lütfen daha sonra tekrar deneyin" gibi nazik mesaj göster.
- Klan tag normalizasyonu: `#` ile başlamayan veya küçük harfli giriş varsa otomatik düzelt (`abc123` → `#ABC123`).

### Klan/oyuncu verisi senkronizasyonu

- Yeni klan ilanı eklendiğinde: API'den anlık çek, DB'ye yaz.
- Periyodik refresh: Vercel Cron (her 6 saatte bir tüm aktif ilanları güncelle).
- Manuel refresh butonu: kullanıcı kendi ilanını "yenile" diyebilir (rate limit: 1/saat).

---

## 7. Yasal ve Marka Kuralları (Supercell Fan Content Policy)

Bu **görmezden gelinemez** kurallardır. Her özellik tasarlanırken kontrol edilir.

### Mutlak yasaklar

- Ürün/domain adında "Clash of Clans" geçemez.
- Doğrudan abonelik veya üyelik ücreti alınamaz.
- Klanın kendisi ücretle satılamaz/aranamaz.
- Supercell'in resmi onaylı olduğu izlenimi verilemez.

### Zorunluluklar

- Her sayfa altında "Bu site Supercell tarafından onaylanmamıştır" yazısı (footer).
- "About" / "Hakkında" sayfasında Supercell Fan Content Policy linki.
- Logolar/görseller sadece Fan Content kapsamında kullanılır.

### İzin verilen gelir modelleri

- ✅ Reklam (Google AdSense, doğrudan reklam)
- ✅ Bağış (Buy Me a Coffee, Patreon, Kreosus)
- ✅ İlan öne çıkarma ("boost") — sadece görünürlük, klan üyeliği değil
- ✅ Eğitim/koçluk hizmeti (üçüncü taraf)

### KVKK uyumu (Türkiye)

- Privacy Policy ve Terms of Service Türkçe sağlanır.
- Kullanıcı onayı alınmadan e-posta dışında veri toplanmaz.
- Kullanıcı verisini silme/indirme talebi en geç 30 gün içinde karşılanır.
- Cookie banner: privacy-friendly analytics (Plausible) seçilirse minimum gereklilik.

---

## 8. Geliştirme Yol Haritası

### Faz 0 — Hazırlık (1 hafta)

- [ ] Domain seç ve al
- [ ] Supercell developer hesabı, API anahtarı
- [ ] Supabase projesi
- [ ] Vercel projesi
- [ ] DigitalOcean droplet (proxy için)
- [ ] GitHub repo, branch koruma kuralları
- [x] CLAUDE.md ve README.md ilk versiyon
- [x] Next.js 16 + Tailwind v4 + shadcn/ui iskelet
- [x] Prisma 7 şeması (CLAUDE.md §5'ten)
- [x] Tooling: ESLint, Prettier, Husky, lint-staged, Vitest
- [x] Türkçe i18n iskeleti (tr/en)
- [x] Header/Footer (Supercell disclaimer dahil)
- [x] Marketing sayfaları (Hakkında, Gizlilik, KVKK, Şartlar) taslak

### Faz 1 — MVP Core (3-4 hafta)

**Hedef:** Bir klan lideri ilan verebilir, bir oyuncu klan arayıp filtreleyebilir, başvuru yapabilir.

- [x] Auth (Supabase: email magic link + Discord OAuth) — server actions, middleware, callback
- [x] Veritabanı şeması, Prisma kurulumu — Prisma 7 + driver adapter (`@prisma/adapter-pg`)
- [x] CoC API proxy servisi (`coc-proxy/` klasörü, ileride ayrı repo) — Express + Upstash Redis cache + Dockerfile + DigitalOcean talimatları
- [x] Klan ilanı oluşturma akışı (`/ilan-ver`) — `lookupClan` + `createClanListing` server actions, server-side re-fetch
- [x] Klan listesi sayfası (`/klanlar`) — mobile-first, cursor pagination, ClanCard
- [x] Klan filtre paneli — URL state ile, TH min/max, savaş sıklığı, arama
- [x] Klan detay sayfası (`/klanlar/[tag]`) — sahip için RefreshButton (1 saat cooldown)
- [x] Basit başvuru formu — ApplyDialog modal + duplicate guard
- [x] Türkçe i18n altyapısı — Faz 0
- [x] Footer + Hakkında + Gizlilik + KVKK + Fan Content uyarısı — Faz 0
- [x] Profil sayfası (`/profil`) — sahip ilanlar + gönderilen başvurular
- [x] SEO temelleri — `robots.ts`, `sitemap.ts` (DB ilanlarıyla), `manifest.ts`, OG image
- [-] Sentry kurulumu — `instrumentation.ts` skeleton, DSN eklendiğinde aktif
- [ ] Vercel deploy + custom domain — kullanıcı yapacak (Supabase + DigitalOcean kurulumu sonrası)

**Bittiğinde:** İlk 10-20 klanı manuel ekle (Discord topluluğundan davet et). Hemen lansmana çıkma.

### Faz 2 — Kullanılabilirlik (2-3 hafta) — `~%90 tamam`

- [x] Oyuncu ilanları — `/oyuncular` liste + filtre, `/oyuncular/[id]` detay, `/ilan-ver/oyuncu` form (CoC etiketi opsiyonel)
- [x] Gelişmiş filtreler — kupa min, etiket filtresi (klan); kupa min, aradığı savaş (oyuncu)
- [x] İlan "yenile/bump" özelliği — profil sayfasında, 24 saat cooldown
- [x] E-posta bildirimleri — Resend SDK + dev console.log fallback; başvuru gelince klan sahibine
- [x] Şikayet/moderasyon temel altyapısı — `ReportDialog` (klan + oyuncu), saatte 5 limit, duplicate guard
- [x] Admin paneli — `/admin` (rol guard), `/admin/raporlar` (kuyruk + çöz/reddet), `/admin/ilanlar` (ban/aktif)
- [x] Klan tag doğrulama — geçici 6-karakter kod (30dk) → CoC açıklamasına yapıştır → `verifiedAt` set
- [x] Arama — klan adı + etiket; oyuncu adı + lookingFor
- [x] SEO temel — Faz 1'de yapıldı; Faz 2'de sitemap'e oyuncu ilanları eklendi

### Faz 3 — Topluluk Genişlemesi (3-4 hafta)

- [ ] Discord botu (yeni ilanları otomatik kanala atar)
- [ ] Klan profil sayfası zenginleştirme (savaş geçmişi grafiği)
- [ ] "Boost" özelliği (ilan öne çıkarma — bağış karşılığı)
- [ ] Lider tablosu (en aktif klanlar)
- [ ] Kullanıcı profil sayfaları
- [ ] Detaylı analytics dashboard (sadece klan sahibi görür)

### Faz 4 — Yenilikçi (sonra)

- AI eşleştirme önerileri
- Mobil uygulama (React Native veya PWA güçlendirme)
- Swipe arayüzü (Tinder-tarzı keşif)
- Turnuva entegrasyonu

---

## 9. Tasarım Prensipleri

### Görsel kimlik

- **Tema:** Dark mode default, light mode opsiyonel.
- **Renk paleti:** TBD (logo tasarımı sonrası). Kırmızı/altın CoC çağrışımı yapsa da Supercell renk paletinden uzak dur.
- **Tipografi:** Inter (UI) + Cal Sans (heading). Türkçe karakterler tam destekli olmalı.
- **Tone:** Resmi değil, samimi. "Sen" kullanılır, "siz" kullanılmaz. Mizah olabilir ama küfürlü/argo olmaz.

### UX kuralları

- **Mobile-first.** Her sayfa önce 375px viewport'ta tasarlanır, sonra büyütülür.
- **Tıklama yükü minimum.** Klan bulmak için 3 tıklamadan fazla istemez.
- **Filtre değişikliği anında uygulanır** (sayfa yüklemesi yok, URL state ile).
- **Boş durumlar (empty states) ihmal edilmez.** "Henüz klan yok" yerine "İlk klan ilanını sen ver!" gibi aksiyon önerisi.
- **Hata mesajları Türkçe ve insanca.** "500 Internal Server Error" değil, "Bir şeyler ters gitti, birkaç saniye sonra tekrar dene."
- **Loading state'leri skeleton ile.** Spinner kullanma.

### Erişilebilirlik

- Tüm interaktif öğeler klavye ile erişilebilir.
- Kontrast oranı WCAG AA seviyesinde minimum.
- `alt` text her görsel için.
- Form hataları sadece renk ile gösterilmez (ikon + metin).

---

## 10. Güvenlik

- **HTTPS zorunlu.** HTTP redirect.
- **Rate limiting** her API endpoint'inde (Upstash Redis ile).
- **Input validation** her endpoint'te (zod).
- **SQL injection:** Prisma kullandığımız için otomatik korumalı; raw query yazılmaz.
- **XSS:** React otomatik escape, ama `dangerouslySetInnerHTML` kullanılmaz.
- **CSRF:** Same-site cookies + Supabase auth.
- **Secrets:** Sadece `.env.local` ve Vercel env vars'ta. Kodda asla.
- **CoC API anahtarı:** Sadece proxy sunucusunda. Frontend'e veya Next.js'e asla.
- **Captcha:** Kayıt ve ilan oluşturma akışlarında Cloudflare Turnstile.
- **Audit log:** Admin işlemleri loglanır.

---

## 11. Test Stratejisi

Tek geliştirici olarak %100 coverage hedefi gerçekçi değil. Pragmatik yaklaşım:

- **Unit test (Vitest):** Sadece pure logic için. Filtre algoritması, validation şemaları, utility fonksiyonlar.
- **Integration test:** API endpoint'leri için, sadece kritik olanlar (klan oluşturma, başvuru).
- **E2E test (Playwright):** En kritik 3 akış için:
  1. Kayıt → klan ilanı oluşturma → listede görme
  2. Filtre kullanarak klan bulma → başvuru
  3. Şikayet etme akışı
- **Manuel test:** Mobil cihazda gerçek kullanım. Her PR öncesi.

---

## 12. Claude Code İçin Çalışma Kuralları

> Bu bölüm Claude'un projede hangi davranışları sergileyeceğini tanımlar. Hata yapmaması ve tutarlı çalışması için.

### Genel

- **Önce planla, sonra kodla.** Yeni bir feature'a başlarken önce hangi dosyaların değişeceğini özetle.
- **Tek seferde küçük değişiklik yap.** Bir PR'da 500 satırdan fazla değişiklik olmamalı (mecbur kalınmadıkça).
- **Mevcut kodu tara, kopyala-yapıştır etme.** Aynı işi yapan utility varsa onu kullan.
- **TypeScript strict.** `any` kullanma, gerekiyorsa `unknown` + type guard.
- **Yorumlar Türkçe.** Kod İngilizce, yorumlar Türkçe.

### Dosya oluşturma kuralları

- shadcn/ui bileşeni `npx shadcn@latest add <component>` ile eklenir, manuel yazılmaz.
- Her yeni route için `loading.tsx` ve `error.tsx` mutlaka eklenir.
- Her API endpoint zod ile validate edilir.

### Yapılmaması gerekenler

- ❌ Veritabanı şemasını CLAUDE.md'yi güncellemeden değiştirme.
- ❌ `prisma db push` (production'da). Migration kullan.
- ❌ Yeni dependency eklemeden önce sormadan ekleme. Bundle size'ı düşün.
- ❌ Logoları/görselleri Supercell'den birebir kopyalama.
- ❌ Console.log production'a bırakma.
- ❌ Magic number kullanma — sabitler `lib/constants.ts`'te.

### Yapılması gerekenler

- ✅ Her commit `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` ile başlar.
- ✅ Branch isimleri: `feature/<isim>`, `fix/<isim>`, `chore/<isim>`.
- ✅ Yeni özellik biterken bu CLAUDE.md güncellenir.
- ✅ Karmaşık logic'in başına 2-3 satır Türkçe yorum.
- ✅ TODO bırakırken mutlaka isim/tarih: `// TODO(2024-01-15): X yapılacak`.

### Performans

- Görsel optimizasyonu için Next.js `<Image>` kullan.
- Liste sayfalarında pagination (cursor-based) veya infinite scroll.
- Veritabanı sorgularında her zaman `select` ile gerekli alanları al.
- Heavy hesaplama gerekiyorsa `useMemo`/`useCallback`.

---

## 13. Environment Variables

`.env.example` her zaman güncel tutulur. Gerçek değerler `.env.local` ve Vercel/DO dashboard'da.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=  # Prisma migration için

# CoC API Proxy (kendi sunucumuz)
COC_PROXY_URL=https://coc-proxy.example.com
COC_PROXY_SECRET=  # proxy ile next arasında shared secret

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Auth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=

# E-posta
RESEND_API_KEY=

# Captcha
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Diğer
NEXT_PUBLIC_APP_URL=https://example.com
NODE_ENV=development
```

---

## 14. Dağıtım (Deployment)

### Branchler

- `main` → production (Vercel auto-deploy).
- `develop` → staging (Vercel preview).
- `feature/*` → otomatik preview deployment.

### Pre-deployment kontrol listesi

- [ ] `pnpm lint` temiz
- [ ] `pnpm typecheck` temiz
- [ ] `pnpm test` geçiyor
- [ ] Sentry kaynak haritaları yüklendi
- [ ] Migration uygulandı (`prisma migrate deploy`)
- [ ] `.env.example` güncel

### İlk lansmanda yapılacaklar

- [ ] robots.txt + sitemap.xml
- [ ] Google Search Console
- [ ] OG image (sosyal paylaşımlar için)
- [ ] Favicon seti (multi-platform)
- [ ] Cloudflare DNS + DDoS proxy aktif

---

## 15. Açık Sorular ve Karar Bekleyenler

> Bu liste yaşayan bir liste. Karar verildikçe taşınır.

- [ ] Ürün/domain adı — kısa liste oluştur, oyla
- [ ] Logo tasarımı — kendin mi, freelancer mı?
- [ ] Reklam modeline ne zaman geçilecek? Önerim: 5.000+ MAU sonrası.
- [ ] Discord OAuth mu, sadece email mi başlangıçta? Önerim: ikisi de.
- [ ] Klan tag doğrulaması nasıl olacak?
  - Seçenek A: Oyun içi açıklama alanına geçici kod ekleme (en güvenli).
  - Seçenek B: Sadece klan lideri olduğuna güvenmek (en hızlı).
  - MVP için B, V1'de A.

---

## 16. Yararlı Linkler

- Supercell Fan Content Policy: https://supercell.com/en/fan-content-policy/
- CoC API Docs: https://developer.clashofclans.com/
- Next.js App Router: https://nextjs.org/docs/app
- Prisma Docs: https://www.prisma.io/docs
- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- KVKK: https://www.kvkk.gov.tr

---

## 17. Sürüm Geçmişi (Bu Dosyanın)

| Tarih      | Değişiklik                                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-09 | İlk versiyon — proje planlama                                                                                                                                                                                                                                                               |
| 2026-05-09 | Faz 0 kod iskeleti kuruldu: Next 16 + Tailwind v4 + shadcn/ui (Radix/Nova) + Prisma 7 + tooling (Prettier/Husky/lint-staged/Vitest). Stack güncellendi (Next 15 → 16, Prisma 7 datasource config).                                                                                          |
| 2026-05-09 | Faz 1 MVP core tamam: Supabase Auth (server actions + middleware), klan ilanı/liste/filtre/detay/başvuru akışları, profil sayfası, CoC proxy iskeleti, SEO (robots/sitemap/manifest/OG), Sentry skeleton. Prisma 7 driver adapter (@prisma/adapter-pg) + lazy Proxy. 21/21 unit test geçer. |
| 2026-05-09 | Faz 2 kullanılabilirlik tamam: oyuncu ilanları (`/oyuncular`, `/ilan-ver/oyuncu`), bump/pause aksiyonları (24h cooldown), Resend e-posta (dev fallback), şikayet sistemi (`ReportDialog` + duplicate/rate guard), admin paneli (rol guard + rapor kuyruğu + ilan ban), klan tag doğrulama (oyun içi açıklamaya 6-karakter kod). 29/29 test geçer. |

> **Not:** Bu dosya proje boyunca yaşar. Her büyük karar burada yansıtılır. Karar değiştiyse eski karar silinmez, üstü çizilir veya yeniden yazılır.
