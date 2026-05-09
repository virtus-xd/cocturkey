import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Kişisel verilerin korunması aydınlatma metni taslağı.",
};

export default function KvkkPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="text-muted-foreground">
        <em>Taslak — yayın öncesi avukat onayından geçecek.</em>
      </p>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, sana ait kişisel verileri
        sınırlı amaçlarla işliyoruz: hesap doğrulama, ilan eşleşmesi ve hizmet kalitesini
        iyileştirme. Verilerini üçüncü taraflarla pazarlama amaçlı paylaşmıyoruz.
      </p>
      <p>
        Veri silme, düzeltme veya taşıma talebin için bize{" "}
        <a href="mailto:erdemoz2003@gmail.com">erdemoz2003@gmail.com</a> üzerinden ulaşabilirsin; en
        geç 30 gün içinde geri dönüş yaparız.
      </p>
    </article>
  );
}
