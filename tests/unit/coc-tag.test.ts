// İlk unit test: CoC tag normalizasyonu. Hem dummy değil hem regex kapsamını koruyor.

import { describe, expect, it } from "vitest";

import { normalizeCocTag } from "@/lib/coc/tag";

describe("normalizeCocTag", () => {
  it("küçük harfli girişi büyütüp # ekler", () => {
    expect(normalizeCocTag("2pp")).toBe("#2PP");
  });

  it("zaten doğru biçimde olanı değiştirmez", () => {
    expect(normalizeCocTag("#2PP")).toBe("#2PP");
  });

  it("boşlukları temizler", () => {
    expect(normalizeCocTag(" 2 P P ")).toBe("#2PP");
  });

  it("harf O'yu rakam 0'a çevirir (CoC'da O karakteri yok)", () => {
    expect(normalizeCocTag("OL2")).toBe("#0L2");
  });

  it("geçersiz karakter içerirse null döner", () => {
    expect(normalizeCocTag("###")).toBeNull();
    expect(normalizeCocTag("ab")).toBeNull(); // çok kısa
  });
});
