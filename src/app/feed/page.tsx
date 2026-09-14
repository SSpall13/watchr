import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAcceptedFriendIds } from "@/lib/friends";
import { getRecommendations } from "@/lib/recommendations";
import { AppShell } from "@/components/AppShell";
import { ShowCard, ShowPosterLink } from "@/components/ShowCard";
import { ShowActions } from "@/components/ShowActions";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
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

  const recommendations = await getRecommendations(userId, 8);

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <p className="mt-1 text-sm text-violet-200/60">
            What friends are watching & picks for you
          </p>
        </section>

        {me?.currentlyWatching && (
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
          ) : (
            <div className="space-y-3">
              {friends.map((f) => (
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
              Mark some shows to get recommendations.
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
