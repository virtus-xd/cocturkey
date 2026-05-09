// Supabase OAuth ve magic link callback'i — code'u session'a takas eder.
// Sonra `next` parametresine yönlendirir.

import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { ensureAppUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/giris?err=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/giris?err=exchange`);
  }

  // İlk girişte App User satırı oluşur.
  try {
    await ensureAppUser(data.user);
  } catch (e) {
    console.error("ensureAppUser failed", e);
    // Auth oturumu yine de açık — kullanıcı yönlendirilir, sonradan retry edilir.
  }

  return NextResponse.redirect(`${origin}${next}`);
}
