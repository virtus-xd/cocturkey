// Proje genelinde kullanılan sabitler. Magic number kullanma — buraya ekle.

export const SITE = {
  name: "TBD — coc-klan",
  description:
    "Türkiye'nin Türkçe ve mobil-öncelikli Clash of Clans klan/oyuncu eşleştirme platformu.",
  locale: "tr",
  defaultTimezone: "Europe/Istanbul",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

// Supercell Fan Content Policy zorunluluğu — her sayfa altında görünür.
export const FAN_CONTENT_DISCLAIMER =
  "Bu içerik, Supercell tarafından onaylanmamıştır ve Supercell'in görüşlerini ya da resmî tutumunu yansıtmaz. Daha fazla bilgi için Supercell'in Fan Content Politikası'na bakın.";

export const FAN_CONTENT_POLICY_URL = "https://supercell.com/en/fan-content-policy/";

// Liste/sayfalama
export const LISTINGS_PAGE_SIZE = 20;

// Klan ilanı yenileme rate limit (manuel bump)
export const CLAN_REFRESH_COOLDOWN_MS = 60 * 60 * 1000; // 1 saat

// CoC cache TTL'leri (proxy tarafında uygulanır, burada referans için)
export const COC_CACHE = {
  clanTtlSeconds: 10 * 60, // 10 dk
  playerTtlSeconds: 5 * 60, // 5 dk
} as const;

// TH seviyesi sınırları (CoC'da güncel: TH17). Yeni TH çıkınca artırılır.
export const TH_LEVEL = {
  min: 1,
  max: 17,
  defaultMin: 10, // TH 10+ hedef kitlemiz
} as const;

// Klan tag normalizasyonu için: küçük harfler büyütülür, # eklenir.
export const CLAN_TAG_REGEX = /^#[0289PYLQGRJCUV]{3,10}$/;
