// Server tarafı oturum yardımcıları. Server components, server actions
// ve API route'larda mevcut kullanıcıyı almak için kullanılır.

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import { createSupabaseServerClient } from "./supabase-server";

import type { User as AppUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type SessionUser = {
  supabase: SupabaseUser;
  app: AppUser;
};

/** Mevcut Supabase kullanıcısını döner; yoksa null. */
export async function getSupabaseUser(): Promise<SupabaseUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Supabase auth.users ile public.users (uygulama tarafı) arasındaki köprü.
 * İlk girişte App User satırını oluşturur, sonraki çağrılarda upsert.
 */
export async function ensureAppUser(supabaseUser: SupabaseUser): Promise<AppUser> {
  const email = supabaseUser.email ?? `${supabaseUser.id}@noemail.local`;
  const username =
    (supabaseUser.user_metadata?.username as string | undefined) ??
    (supabaseUser.user_metadata?.preferred_username as string | undefined) ??
    `oyuncu-${supabaseUser.id.slice(0, 8)}`;
  const discordId =
    supabaseUser.app_metadata?.provider === "discord"
      ? ((supabaseUser.user_metadata?.provider_id as string | undefined) ??
        (supabaseUser.user_metadata?.sub as string | undefined))
      : undefined;

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    update: {
      email,
      ...(discordId ? { discordId } : {}),
    },
    create: {
      id: supabaseUser.id,
      email,
      username,
      discordId: discordId ?? null,
    },
  });
}

/** Hem Supabase hem app User; ikisinden biri yoksa null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;
  const app = await ensureAppUser(supabaseUser);
  return { supabase: supabaseUser, app };
}

/** Korumalı sayfalar için: oturum yoksa /giris'e yönlendir. */
export async function requireSession(redirectTo?: string): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    const params = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/giris${params}`);
  }
  return session;
}
