// Şikayet ve oyuncu ilanı validasyonları.

import { describe, expect, it } from "vitest";

import { createPlayerListingSchema, playerListFiltersSchema } from "@/lib/validation/player";
import { createReportSchema, REPORT_REASON_LABELS_TR } from "@/lib/validation/report";

describe("createPlayerListingSchema", () => {
  it("zorunlu alanlar olmadan reddeder", () => {
    expect(createPlayerListingSchema.safeParse({}).success).toBe(false);
  });
  it("default war freq ANY", () => {
    const r = createPlayerListingSchema.safeParse({
      ingameName: "Erdem",
      thLevel: 13,
      trophies: 4500,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.preferredWarFreq).toBe("ANY");
  });
  it("TH range dışında reddeder", () => {
    const r = createPlayerListingSchema.safeParse({
      ingameName: "Erdem",
      thLevel: 99,
      trophies: 4500,
    });
    expect(r.success).toBe(false);
  });
});

describe("playerListFiltersSchema", () => {
  it("string sayısal değerleri çevirir", () => {
    const r = playerListFiltersSchema.safeParse({ minTH: "12", minTrophies: "3000" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.minTH).toBe(12);
      expect(r.data.minTrophies).toBe(3000);
    }
  });
});

describe("createReportSchema", () => {
  it("ne klan ne oyuncu yoksa reddeder", () => {
    const r = createReportSchema.safeParse({ reason: "SPAM" });
    expect(r.success).toBe(false);
  });
  it("hem klan hem oyuncu varsa reddeder", () => {
    const r = createReportSchema.safeParse({
      reason: "SPAM",
      clanListingId: "a",
      playerListingId: "b",
    });
    expect(r.success).toBe(false);
  });
  it("klan id verilirse geçer", () => {
    const r = createReportSchema.safeParse({
      reason: "SCAM",
      clanListingId: "abc",
    });
    expect(r.success).toBe(true);
  });
});

describe("REPORT_REASON_LABELS_TR", () => {
  it("tüm enum değerleri için Türkçe etiket var", () => {
    const reasons = ["SPAM", "HARASSMENT", "INAPPROPRIATE_CONTENT", "FAKE_INFO", "SCAM", "OTHER"];
    for (const r of reasons) {
      expect(REPORT_REASON_LABELS_TR[r as keyof typeof REPORT_REASON_LABELS_TR]).toBeTruthy();
    }
  });
});
