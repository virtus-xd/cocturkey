// Tarayıcı tarafı Supabase client. Component'lerde `useSupabase()` benzeri
// hook'lar yerine doğrudan modülden çağırmak yeterli — singleton hemen kuruluyor.

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
