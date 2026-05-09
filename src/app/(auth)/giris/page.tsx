import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseUser } from "@/lib/auth/session";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Giriş yap",
  description: "Hesabınla giriş yap, klan ilanı ver, başvuru takip et.",
};

type Props = {
  searchParams: Promise<{ next?: string; err?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { next = "/", err } = await searchParams;
  const user = await getSupabaseUser();
  if (user) redirect(next);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Giriş yap</CardTitle>
          <CardDescription>
            Magic link veya Discord ile saniyeler içinde gir. Şifre yok, kayıp olmaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {err === "oauth" ? (
            <p className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
              Discord girişi başlatılamadı. Tekrar dene.
            </p>
          ) : null}
          <SignInForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
