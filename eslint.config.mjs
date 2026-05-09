import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Default ignores + projeye özel olanlar.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code skill dosyaları lint kapsamı dışında.
    ".claude/**",
    // Üretilmiş veya bizim yazmadığımız.
    "node_modules/**",
    "coverage/**",
    "src/components/ui/**",
    // CoC proxy ayrı servis, kendi tooling'i var.
    "coc-proxy/**",
  ]),
  {
    rules: {
      // Türkçe içerikte apostrof yaygın; bu kural İngilizce odaklı stil tartışması.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
