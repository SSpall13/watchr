import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { ShowCard } from "@/components/ShowCard";
import { ShowActions } from "@/components/ShowActions";
import { SearchBox } from "@/components/SearchBox";
import { ServiceFilter } from "@/components/ServiceFilter";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; service?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  const { q, service } = await searchParams;
  const query = (q || "").trim();
  const serviceFilter = (service || "").trim();

  const shows = await prisma.show.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query } },
                { genre: { contains: query } },
                { overview: { contains: query } },
              ],
            }
          : {},
        serviceFilter ? { streamingService: serviceFilter } : {},
      ],
    },
    orderBy: { title: "asc" },
    take: 40,
  });

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Search shows</h1>
          <p className="mt-1 text-sm text-violet-200/60">
            Filter by streaming service, then set watching / finished / favorite
          </p>
        </div>
        <Suspense fallback={null}>
          <SearchBox initial={query} initialService={serviceFilter} />
        </Suspense>
        <Suspense fallback={null}>
          <ServiceFilter initialService={serviceFilter} initialQ={query} />
        </Suspense>
        <div className="space-y-3">
          {shows.map((s) => (
            <ShowCard
              key={s.id}
              show={s}
              actions={<ShowActions showId={s.id} />}
            />
          ))}
          {shows.length === 0 && (
            <div className="glass p-6 text-center text-sm text-violet-200/60">
              No shows match
              {query ? <> &quot;{query}&quot;</> : null}
              {serviceFilter ? <> on {serviceFilter}</> : null}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
