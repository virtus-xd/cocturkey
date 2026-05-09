// Server tarafı Supabase client. Server components, server actions ve
// route handler'larda kullanılır. Cookies okuma/yazma Next.js'in `cookies()`
// API'si üzerinden yapılır; @supabase/ssr en güncel önerilen pattern.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server component'tan çağrılınca set başarısız olur — middleware
            // session refresh'i hallettiği için yutmak güvenli.
          }
        },
      },
    },
  );
}
