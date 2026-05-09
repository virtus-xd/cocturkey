import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  // Server component'ta canlı saat kullanımı meşru — purity uyarısını kapat.
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3_600_000);
  const [
    totalUsers,
    totalClanListings,
    activeClanListings,
    totalPlayerListings,
    openReports,
    last7DaysApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.clanListing.count(),
    prisma.clanListing.count({ where: { status: "ACTIVE" } }),
    prisma.playerListing.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]).catch(() => [0, 0, 0, 0, 0, 0] as const);

  const stats = [
    { label: "Toplam kullanıcı", value: totalUsers },
    { label: "Toplam klan ilanı", value: totalClanListings },
    { label: "Aktif klan ilanı", value: activeClanListings },
    { label: "Toplam oyuncu ilanı", value: totalPlayerListings },
    { label: "Açık şikayet", value: openReports },
    { label: "Son 7 günlük başvuru", value: last7DaysApplications },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">{s.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{s.value.toLocaleString("tr-TR")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
