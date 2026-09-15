import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAcceptedFriendIds } from "@/lib/friends";
import { getRecommendations } from "@/lib/recommendations";
import { AppShell } from "@/components/AppShell";
import { ShowCard, ShowPosterLink } from "@/components/ShowCard";
import { ShowActions } from "@/components/ShowActions";
import { ServiceFilter } from "@/components/ServiceFilter";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const { service } = await searchParams;
  const serviceFilter = (service || "").trim();

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { currentlyWatching: true },
  });

  const friendIds = await getAcceptedFriendIds(userId);
  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    include: { currentlyWatching: true },
    orderBy: { name: "asc" },
  });

  const filteredFriends = serviceFilter
    ? friends.filter(
        (f) => f.currentlyWatching?.streamingService === serviceFilter
      )
    : friends;

  let recommendations = await getRecommendations(userId, 8);
  if (serviceFilter) {
    recommendations = recommendations.filter(
      (s) => s.streamingService === serviceFilter
    );
  }

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <p className="mt-1 text-sm text-violet-200/60">
            What friends are watching & picks for you
          </p>
          <div className="mt-4">
            <Suspense fallback={null}>
              <ServiceFilter initialService={serviceFilter} />
            </Suspense>
          </div>
        </section>

        {me?.currentlyWatching &&
          (!serviceFilter ||
            me.currentlyWatching.streamingService === serviceFilter) && (
          <section className="glass p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200/50">
              You&apos;re watching
            </h2>
            <div className="mt-3">
              <ShowCard show={me.currentlyWatching} />
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Friends watching</h2>
          {friends.length === 0 ? (
            <div className="glass p-6 text-center text-sm text-violet-200/60">
              No friends yet.{" "}
              <Link href="/friends" className="text-brand-300 hover:underline">
                Add friends
              </Link>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="glass p-6 text-center text-sm text-violet-200/60">
              No friends currently watching on {serviceFilter}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((f) => (
                <div key={f.id} className="glass p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Link
                      href={`/users/${f.id}`}
                      className="font-medium text-brand-200 hover:underline"
                    >
                      {f.name}
                    </Link>
                    {!f.currentlyWatching && (
                      <span className="text-xs text-violet-200/40">Nothing set</span>
                    )}
                  </div>
                  {f.currentlyWatching && (
                    <ShowCard
                      show={f.currentlyWatching}
                      compact
                      actions={<ShowActions showId={f.currentlyWatching.id} compact />}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Recommended for you</h2>
          <p className="mb-3 text-xs text-violet-200/50">
            Based on overlapping tastes & currently-watching genres
          </p>
          {recommendations.length === 0 ? (
            <div className="glass p-6 text-center text-sm text-violet-200/60">
              {serviceFilter
                ? `No recommendations on ${serviceFilter} yet.`
                : "Mark some shows to get recommendations."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recommendations.map((s) => (
                <div key={s.id} className="space-y-2">
                  <ShowPosterLink show={s} href="/search" />
                  <ShowActions showId={s.id} compact />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
