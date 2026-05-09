// CoC etiket (tag) normalizasyonu. Kullanıcı `abc123`, `#abc123`,
// `ABC 123` gibi farklı biçimlerde girebilir; hepsini `#ABC123`'e döner.
// Geçersiz ise null. Format: # + 3-10 büyük harf/rakam (sadece izinli alfabeden).

import { CLAN_TAG_REGEX } from "@/lib/constants";

const ALLOWED_CHARS = /[^0289PYLQGRJCUV]/g;

export function normalizeCocTag(input: string): string | null {
  if (!input) return null;
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/\s+/g, "")
    .replace(/O/g, "0") // sık yapılan harf-rakam karışıklığı
    .replace(ALLOWED_CHARS, "");

  if (cleaned.length < 3 || cleaned.length > 10) return null;

  const tag = `#${cleaned}`;
  return CLAN_TAG_REGEX.test(tag) ? tag : null;
}

// CoC API URL'lerinde tag URL-encode edilmeli: `#` → `%23`.
export function encodeCocTagForUrl(tag: string): string {
  return encodeURIComponent(tag);
}
