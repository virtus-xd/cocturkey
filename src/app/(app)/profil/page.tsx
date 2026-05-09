import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "Hesabını ve ilanlarını yönet.",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Profil</h1>
      <p className="text-muted-foreground mt-2">
        Faz 1'de Supabase Auth entegrasyonundan sonra burada hesap bilgileri, ilanlarının listesi ve
        gelen başvurular yer alacak.
      </p>
    </div>
  );
}
