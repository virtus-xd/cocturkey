// Validation şemalarının pratik testleri. Hatalı input'larda anlamlı hata
// dönmeli; happy path'i de bir kere garantiliyoruz.

import { describe, expect, it } from "vitest";

import { mapWarFrequency, warFrequencyLabel } from "@/lib/coc/mappers";
import {
  clanListFiltersSchema,
  clanTagSchema,
  createClanListingSchema,
  createApplicationSchema,
} from "@/lib/validation/clan";

describe("clanTagSchema", () => {
  it("küçük girdiyi büyütüp geçirir", () => {
    expect(clanTagSchema.safeParse("#2pp").success).toBe(true);
  });
  it("# olmadan reddeder", () => {
    expect(clanTagSchema.safeParse("2PP").success).toBe(false);
  });
});

describe("createClanListingSchema", () => {
  it("default değerleri uygular", () => {
    const result = createClanListingSchema.safeParse({ clanTag: "#2PP" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("tr");
      expect(result.data.timezone).toBe("Europe/Istanbul");
      expect(result.data.tags).toEqual([]);
    }
  });
  it("hatalı saat formatını yakalar", () => {
    const r = createClanListingSchema.safeParse({ clanTag: "#2PP", activeHours: "20-23" });
    expect(r.success).toBe(false);
  });
});

describe("clanListFiltersSchema coercion", () => {
  it("string sayısal değeri sayıya çevirir", () => {
    const r = clanListFiltersSchema.safeParse({ minTH: "12" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.minTH).toBe(12);
  });
});

describe("createApplicationSchema", () => {
  it("kısa mesajı reddeder", () => {
    const r = createApplicationSchema.safeParse({ clanListingId: "abc", message: "selam" });
    expect(r.success).toBe(false);
  });
  it("uygun mesajı geçirir", () => {
    const r = createApplicationSchema.safeParse({
      clanListingId: "abc",
      message: "TH13 oyuncuyum, war yapmak isterim.",
    });
    expect(r.success).toBe(true);
  });
});

describe("mapWarFrequency", () => {
  it.each([
    ["always", "ALWAYS"],
    ["moreThanOncePerWeek", "MORE_THAN_ONCE_PER_WEEK"],
    ["oncePerWeek", "ONCE_PER_WEEK"],
    ["lessThanOncePerWeek", "LESS_THAN_ONCE_PER_WEEK"],
    ["never", "NEVER"],
    ["any", "ANY"],
    [null, "UNKNOWN"],
    ["bilinmeyen", "UNKNOWN"],
  ])("%s → %s", (input, expected) => {
    expect(mapWarFrequency(input)).toBe(expected);
  });

  it("UI etiketi Türkçe", () => {
    expect(warFrequencyLabel("ALWAYS")).toBe("Sürekli");
    expect(warFrequencyLabel("UNKNOWN")).toBe("Belirsiz");
  });
});
