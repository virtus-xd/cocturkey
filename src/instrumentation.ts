// Next.js instrumentation hook'u — server/edge runtime'larda bir kez çalışır.
// Sentry buraya bağlanacak; şimdilik sadece skeleton.
//
// Sentry'i etkinleştirmek için:
//   1. `pnpm add @sentry/nextjs`
//   2. Aşağıdaki yorumları kaldır + DSN'i .env.local'e ekle.

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  // const Sentry = await import("@sentry/nextjs");
  //
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 0.1,
  //     environment: process.env.NODE_ENV,
  //   });
  // }
  //
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 0.05,
  //   });
  // }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routerKind: string; routePath: string },
) {
  // Server tarafında yakalanan hatalar burada toplanır.
  // Sentry kurulduğunda: Sentry.captureRequestError(error, request, context);
  if (process.env.NODE_ENV === "development") {
    console.error("[onRequestError]", { path: request.path, route: context.routePath, error });
  }
}
