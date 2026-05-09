import Link from "next/link";
import { Shield } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

const navItems = [
  { href: "/klanlar", label: t("nav.clans") },
  { href: "/oyuncular", label: t("nav.players") },
] as const;

export function Header() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="text-primary size-5" />
          <span>{t("common.appName")}</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/ilan-ver">{t("nav.createListing")}</Link>
          </Button>
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
