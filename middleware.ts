// Her request'te Supabase oturumunu yeniler (cookie rotation).
// `matcher` ile statik dosyaları ve image asset'leri dışarıda tutar.

import { type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/auth/supabase-middleware";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * Şunlar dışındaki tüm istekler:
     * - _next/static (statik dosyalar)
     * - _next/image  (image optimization)
     * - favicon, robots, sitemap, manifest
     * - public klasöründeki uzantısı olan dosyalar
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
