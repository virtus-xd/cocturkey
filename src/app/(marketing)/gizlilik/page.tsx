import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik",
  description: "Gizlilik politikası taslağı.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Gizlilik Politikası</h1>
      <p className="text-muted-foreground">
        <em>Taslak — yayın öncesi avukat onayından geçecek.</em>
      </p>
      <h2>Hangi verileri topluyoruz?</h2>
      <ul>
        <li>Hesap için: e-posta, kullanıcı adı, opsiyonel Discord kimliği.</li>
        <li>İlan için: oyun içi klan/oyuncu etiketi ve sen ekledikçe profil bilgileri.</li>
        <li>Kullanım analitiği: anonim sayfa görüntüleme (Plausible, çerezsiz).</li>
      </ul>
      <h2>Verilerini sileceğimizi nasıl bilebilirsin?</h2>
      <p>
        Hesabını dilediğin zaman silebilirsin; ilanların ve başvurularını 30 gün içinde sileriz.
        Sorularını <a href="mailto:erdemoz2003@gmail.com">erdemoz2003@gmail.com</a> adresine
        iletebilirsin.
      </p>
    </article>
  );
}
