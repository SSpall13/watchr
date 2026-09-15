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
  searchParams: Promise<{ q?: string; service?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  const { q, service, page: pageParam } = await searchParams;
  const query = (q || "").trim();
  const serviceFilter = (service || "").trim();
  const page = Math.max(1, Number(pageParam || "1") || 1);
  const pageSize = 60;
  const skip = (page - 1) * pageSize;

  const where = {
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
  };

  const [shows, total] = await Promise.all([
    prisma.show.findMany({
      where,
      orderBy: { title: "asc" },
      take: pageSize,
      skip,
    }),
    prisma.show.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const qs = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (serviceFilter) params.set("service", serviceFilter);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/search?${s}` : "/search";
  };

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Search shows</h1>
          <p className="mt-1 text-sm text-violet-200/60">
            Filter by streaming service, then set watching / finished / favorite
          </p>
          <p className="mt-2 text-xs text-violet-200/45">
            Catalog syncs via TMDB — see README for{" "}
            <code className="rounded bg-white/10 px-1">npm run sync:catalog</code>{" "}
            (optional free API key). Discover pages are capped, not every title forever.
          </p>
        </div>
        <Suspense fallback={null}>
          <SearchBox initial={query} initialService={serviceFilter} />
        </Suspense>
        <Suspense fallback={null}>
          <ServiceFilter initialService={serviceFilter} initialQ={query} />
        </Suspense>
        <p className="text-xs text-violet-200/50">
          Showing {shows.length} of {total}
          {totalPages > 1 ? ` · page ${page}/${totalPages}` : null}
        </p>
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            {page > 1 ? (
              <a
                href={qs(page - 1)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-violet-100 hover:bg-white/15"
              >
                Previous
              </a>
            ) : (
              <span className="px-3 py-1.5 text-violet-200/30">Previous</span>
            )}
            {page < totalPages ? (
              <a
                href={qs(page + 1)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-violet-100 hover:bg-white/15"
              >
                Next
              </a>
            ) : (
              <span className="px-3 py-1.5 text-violet-200/30">Next</span>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
