// Minimal i18n yardımcısı. MVP'de tek dil (tr) aktif. Faz 2'de gerçek
// kullanıcı dili gerekirse `next-intl` veya benzerine taşınabilir; bu yüzden
// sadece dot-path okuyan basit bir t() helper var.

import en from "./en.json";
import tr from "./tr.json";

export type Locale = "tr" | "en";

const dictionaries = { tr, en } as const;

export const DEFAULT_LOCALE: Locale = "tr";

type Dict = Record<string, unknown>;

function get(obj: Dict, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Dict)) {
      return (acc as Dict)[key];
    }
    return undefined;
  }, obj);
}

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const value = get(dictionaries[locale], key);
  if (typeof value === "string") return value;
  // Eksik anahtarsa anahtarın kendisini dön — UI'da "missing" görünür, hata atmaz.
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[i18n] Missing key: ${key} (${locale})`);
  }
  return key;
}

export const dict = dictionaries;
