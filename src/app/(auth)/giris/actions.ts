"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

const emailSchema = z.string().trim().toLowerCase().email("Geçerli bir e-posta gir.");

type ActionResult = { ok: true; message: string } | { ok: false; error: string };

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/**
 * Magic link giriş — e-postaya tek kullanımlık link gönderilir.
 * Supabase email template Türkçeye çevrilebilir; bkz. Supabase dashboard.
 */
export async function signInWithMagicLink(formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta." };
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();
  const next = (formData.get("next") as string | null) ?? "/";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { ok: false, error: "Giriş bağlantısı gönderilemedi. Birkaç dakika sonra tekrar dene." };
  }

  return { ok: true, message: "E-postanı kontrol et: giriş bağlantısını yolladık." };
}

/** Discord OAuth — Supabase üzerinden, yönlendirme akışı. */
export async function signInWithDiscord(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();
  const next = (formData.get("next") as string | null) ?? "/";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "identify email",
    },
  });

  if (error || !data.url) {
    redirect(`/giris?err=oauth&next=${encodeURIComponent(next)}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
