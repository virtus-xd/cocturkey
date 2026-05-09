import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Kullanım şartları taslağı.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Kullanım Şartları</h1>
      <p className="text-muted-foreground">
        <em>Taslak — yayın öncesi gözden geçirilecek.</em>
      </p>
      <p>
        Bu siteyi kullanarak: küfürlü/argo, ırkçı, taciz edici içerik paylaşmamayı; başkalarına ait
        klan/oyuncu kimliklerini izinsiz yayınlamamayı; spam ve aldatıcı ilan açmamayı kabul
        edersin. İhlaller hesabın askıya alınmasına yol açabilir.
      </p>
    </article>
  );
}
