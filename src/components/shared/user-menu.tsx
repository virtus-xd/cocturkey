import Link from "next/link";
import { LogIn, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSessionUser } from "@/lib/auth/session";

export async function UserMenu() {
  const session = await getSessionUser().catch(() => null);

  if (!session) {
    return (
      <Button asChild size="sm" variant="ghost">
        <Link href="/giris" className="gap-1.5">
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Giriş</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1.5">
          <User className="size-4" />
          <span className="hidden max-w-[120px] truncate sm:inline">{session.app.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{session.app.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ilan-ver">İlan ver</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action="/auth/sign-out" method="post" className="contents">
            <button type="submit" className="w-full text-left">
              Çıkış
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
