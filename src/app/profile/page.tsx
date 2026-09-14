import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { ShowCard } from "@/components/ShowCard";
import { ShowActions } from "@/components/ShowActions";
import { ProfileEditForm } from "@/components/ProfileEditForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      currentlyWatching: true,
      favoriteShow: true,
      watchActivities: {
        include: { show: true },
        orderBy: { updatedAt: "desc" },
      },
      awards: {
        include: { award: true },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const finished = user.watchActivities.filter((w) => w.status === "finished");
  const watching = user.watchActivities.filter((w) => w.status === "watching");
  const want = user.watchActivities.filter((w) => w.status === "want");

  return (
    <AppShell userName={user.name}>
      <div className="space-y-8">
        <section className="glass p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-violet-200/50">{user.email}</p>
              {user.bio && <p className="mt-2 text-sm text-violet-100/80">{user.bio}</p>}
            </div>
            <Link href={`/users/${user.id}`} className="btn-secondary !text-xs">
              Public view
            </Link>
          </div>
          <div className="mt-4">
            <ProfileEditForm name={user.name} bio={user.bio} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="glass p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200/50">
              Currently watching
            </h2>
            <div className="mt-3">
              {user.currentlyWatching ? (
                <ShowCard
                  show={user.currentlyWatching}
                  actions={<ShowActions showId={user.currentlyWatching.id} compact />}
                />
              ) : (
                <p className="text-sm text-violet-200/50">
                  Nothing set.{" "}
                  <Link href="/search" className="text-brand-300 hover:underline">
                    Pick a show
                  </Link>
                </p>
              )}
            </div>
          </div>
          <div className="glass p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200/50">
              Favorite show
            </h2>
            <div className="mt-3">
              {user.favoriteShow ? (
                <ShowCard show={user.favoriteShow} />
              ) : (
                <p className="text-sm text-violet-200/50">
                  No favorite yet. Use ★ Favorite on search.
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Awards</h2>
          {user.awards.length === 0 ? (
            <div className="glass p-6 text-sm text-violet-200/60">
              Finish a series to unlock your first award.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {user.awards.map((ua) => (
                <div key={ua.id} className="glass flex items-center gap-3 p-4">
                  <span className="text-3xl">{ua.award.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{ua.award.name}</p>
                    <p className="text-xs text-violet-200/60">{ua.award.description}</p>
                    <p className="mt-1 text-[10px] text-violet-200/40">
                      Earned {ua.earnedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Finished ({finished.length})
          </h2>
          <div className="space-y-2">
            {finished.map((w) => (
              <ShowCard key={w.id} show={w.show} compact subtitle={w.finishedAt ? `Finished ${w.finishedAt.toLocaleDateString()}` : undefined} />
            ))}
            {finished.length === 0 && (
              <p className="text-sm text-violet-200/50">No finished shows yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Watching list ({watching.length})
          </h2>
          <div className="space-y-2">
            {watching.map((w) => (
              <ShowCard
                key={w.id}
                show={w.show}
                compact
                subtitle={w.progress || undefined}
                actions={<ShowActions showId={w.showId} compact />}
              />
            ))}
          </div>
        </section>

        {want.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Want to watch</h2>
            <div className="space-y-2">
              {want.map((w) => (
                <ShowCard
                  key={w.id}
                  show={w.show}
                  compact
                  actions={<ShowActions showId={w.showId} compact />}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
