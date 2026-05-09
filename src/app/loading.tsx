// Global yükleniyor durumu — sayfa segment'leri kendi loading.tsx'leriyle override eder.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="space-y-4">
        <div className="bg-muted h-8 w-2/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        <div className="bg-muted h-64 w-full animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
