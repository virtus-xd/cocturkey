import { ImageResponse } from "next/og";

import { SITE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.name;

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginBottom: 16,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Türkiye CoC topluluğu için
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          Türkiye'nin CoC klan evi
        </div>
        <div style={{ fontSize: 28, color: "#d4d4d8", textAlign: "center" }}>
          Sana uygun klanı bul, oyuncu ararken zaman kaybetme.
        </div>
      </div>
    ),
    size,
  );
}
