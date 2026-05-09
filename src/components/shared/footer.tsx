import Link from "next/link";

import { FAN_CONTENT_POLICY_URL } from "@/lib/constants";
import { t } from "@/i18n";

const links = [
  { href: "/hakkinda", label: t("footer.about") },
  { href: "/gizlilik", label: t("footer.privacy") },
  { href: "/sartlar", label: t("footer.terms") },
  { href: "/kvkk", label: t("footer.kvkk") },
] as const;

export function Footer() {
  return (
    <footer className="border-border/60 bg-muted/30 mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-muted-foreground mt-6 max-w-3xl text-xs leading-relaxed">
          {t("footer.fanContent")}{" "}
          <a
            href={FAN_CONTENT_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-2"
          >
            {t("footer.fanContentLink")}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
