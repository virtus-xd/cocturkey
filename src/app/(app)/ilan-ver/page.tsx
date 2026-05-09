import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İlan Ver",
  description: "Klan ya da oyuncu ilanı oluştur.",
};

export default function CreateListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">İlan Ver</h1>
      <p className="text-muted-foreground mt-2">
        Faz 1'de klan ilanı formu buraya gelecek (clan tag → CoC API ile otomatik veri çekme, Türkçe
        tanıtım, aktif saat, Discord/WhatsApp linki, etiketler).
      </p>
    </div>
  );
}
