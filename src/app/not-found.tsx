import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-primary font-mono text-sm">404</p>
      <h1 className="text-2xl font-semibold">Aradığını bulamadık</h1>
      <p className="text-muted-foreground text-sm">
        Bu sayfa silinmiş, taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Button asChild>
        <Link href="/">Ana sayfa</Link>
      </Button>
    </div>
  );
}
