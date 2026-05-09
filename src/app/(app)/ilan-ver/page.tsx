import type { Metadata } from "next";
import Link from "next/link";
import { Shield, User } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "İlan Ver",
  description: "Klan ya da oyuncu ilanı oluştur.",
};

export default async function CreateListingHubPage() {
  await requireSession("/ilan-ver");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Ne yayınlamak istiyorsun?</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Klan lideri misin yoksa klan mı arıyorsun?
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/ilan-ver/klan">
          <Card className="hover:border-primary/50 h-full transition-colors">
            <CardHeader>
              <Shield className="text-primary size-8" />
              <CardTitle>Klan ilanı</CardTitle>
              <CardDescription>
                Klanını listele, oyuncular sana başvursun. CoC etiketi yeterli.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/ilan-ver/oyuncu">
          <Card className="hover:border-primary/50 h-full transition-colors">
            <CardHeader>
              <User className="text-primary size-8" />
              <CardTitle>Oyuncu ilanı</CardTitle>
              <CardDescription>
                Klan ararken sana uygun klan liderlerinin gözüne çarp.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
