import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { ShowCard } from "@/components/ShowCard";
import { AddFriendButton } from "@/components/AddFriendButton";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      currentlyWatching: true,
      favoriteShow: true,
      awards: { include: { awardDefinition: true }, orderBy: { earnedAt: "desc" } },
      watchActivities: {
        where: { status: "finished" },
        include: { show: true },
        take: 10,
        orderBy: { finishedAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const isSelf = user.id === session.user.id;

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-6">
        <section className="glass p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              {user.bio && <p className="mt-2 text-sm text-violet-100/80">{user.bio}</p>}
            </div>
            {!isSelf && <AddFriendButton friendId={user.id} />}
            {isSelf && (
              <Link href="/profile" className="btn-secondary !text-xs">
                Edit profile
              </Link>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200/50">
              Currently watching
            </h2>
            <div className="mt-3">
              {user.currentlyWatching ? (
                <ShowCard show={user.currentlyWatching} />
              ) : (
                <p className="text-sm text-violet-200/50">Nothing set</p>
              )}
            </div>
          </div>
          <div className="glass p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200/50">
              Favorite
            </h2>
            <div className="mt-3">
              {user.favoriteShow ? (
                <ShowCard show={user.favoriteShow} />
              ) : (
                <p className="text-sm text-violet-200/50">No favorite</p>
              )}
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Awards</h2>
          {user.awards.length === 0 ? (
            <p className="text-sm text-violet-200/50">No awards yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.awards.map((ua) => (
                <span
                  key={ua.id}
                  className="badge border-brand-400/30 bg-brand-500/15 text-brand-100"
                  title={ua.awardDefinition.description}
                >
                  {ua.awardDefinition.icon} {ua.awardDefinition.name}
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Recently finished</h2>
          <div className="space-y-2">
            {user.watchActivities.map((w) => (
              <ShowCard key={w.id} show={w.show} compact />
            ))}
            {user.watchActivities.length === 0 && (
              <p className="text-sm text-violet-200/50">None yet</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
