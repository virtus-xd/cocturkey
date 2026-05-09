import type { Metadata } from "next";

import { FAN_CONTENT_POLICY_URL, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hakkında",
  description: `${SITE.name} hakkında bilgi.`,
};

export default function AboutPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Hakkında</h1>
      <p>
        {SITE.name}, Türkiye'deki Clash of Clans oyuncularını ve klan liderlerini Türkçe ve
        mobil-öncelikli bir arayüzde buluşturmak için kuruldu.
      </p>
      <h2>Niçin var?</h2>
      <p>
        Mevcut global platformlar İngilizce ve Türk oyuncu kültürüne uzak. Türkler şu anda klan
        bulmayı dağınık Discord/WhatsApp gruplarında yapıyor. Bu site, merkezi ve filtrelenebilir
        bir Türkçe çözüm sunmayı hedefliyor.
      </p>
      <h2>Supercell ile ilişkimiz</h2>
      <p>
        Bu site Supercell tarafından onaylanmamıştır. Tüm marka ve görseller hak sahiplerine aittir.
        Detaylar için{" "}
        <a href={FAN_CONTENT_POLICY_URL} target="_blank" rel="noopener noreferrer">
          Supercell Fan Content Politikası
        </a>{" "}
        sayfasını okuyabilirsin.
      </p>
    </article>
  );
}
