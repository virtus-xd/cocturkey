import Link from "next/link";
import { Compass, Sparkles, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/i18n";

const features = [
  {
    icon: Compass,
    title: "Doğru klan, hızlı eşleşme",
    body: "TH, kupa, savaş sıklığı ve dil filtreleriyle saniyeler içinde sana uygun klanı bul.",
  },
  {
    icon: ShieldCheck,
    title: "Türkçe ve güvenilir",
    body: "İlanlar moderasyondan geçer, klan etiketleri CoC API ile doğrulanır. Hayalet klanlar yok.",
  },
  {
    icon: Sparkles,
    title: "Mobil-öncelikli",
    body: "Telefonundan rahatça gez, ilan ver, başvur. Discord ya da WhatsApp'ı sürükle bırak.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
          Türkiye CoC topluluğu için
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          {t("home.hero.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-balance">
          {t("home.hero.subtitle")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/klanlar">{t("home.hero.ctaFindClan")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/ilan-ver">{t("home.hero.ctaPostListing")}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-20 sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/60">
            <CardContent className="space-y-3 pt-6">
              <feature.icon className="text-primary size-6" />
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
