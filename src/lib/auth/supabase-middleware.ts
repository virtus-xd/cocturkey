// Middleware için Supabase client + session refresh.
// Bu dosya `middleware.ts`'ten çağrılır; her request'te çalışır.
// Detay: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase yapılandırılmamışsa middleware no-op — local dev için.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims yerine getUser tercih edildi — auth state'in JWT'den değil,
  // Supabase server'dan doğrulanmasını ister. Performans için ileride
  // getClaims'e geçilebilir (CLAUDE.md §10).
  await supabase.auth.getUser();

  return response;
}
