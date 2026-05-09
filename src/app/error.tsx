"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(2026-05-09): Sentry kurulduktan sonra captureException buraya bağlanacak.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Bir şeyler ters gitti</h1>
      <p className="text-muted-foreground text-sm">
        Birkaç saniye sonra tekrar dene. Sorun sürerse bize ulaşmaktan çekinme.
      </p>
      <Button onClick={reset}>Tekrar dene</Button>
    </div>
  );
}
