import { prisma } from "@/lib/prisma";

/**
 * Simple recommendations:
 * 1. Shows popular among users who share currently-watching genre or co-watched titles
 * 2. Fall back to globally popular watching shows
 */
export async function getRecommendations(userId: string, limit = 8) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      currentlyWatching: true,
      watchActivities: true,
    },
  });
  if (!me) return [];

  const myShowIds = new Set(me.watchActivities.map((w) => w.showId));
  if (me.currentlyWatchingId) myShowIds.add(me.currentlyWatchingId);
  if (me.favoriteShowId) myShowIds.add(me.favoriteShowId);

  const myGenre = me.currentlyWatching?.genre;

  const similarUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        ...(myShowIds.size
          ? [{ watchActivities: { some: { showId: { in: [...myShowIds] } } } }]
          : []),
        ...(myGenre
          ? [{ currentlyWatching: { genre: myGenre } }]
          : []),
      ],
    },
    include: {
      currentlyWatching: true,
      watchActivities: {
        where: { status: { in: ["watching", "finished", "want"] } },
        include: { show: true },
      },
    },
    take: 50,
  });

  const scores = new Map<string, { show: NonNullable<(typeof similarUsers)[0]["currentlyWatching"]>; score: number }>();

  for (const u of similarUsers) {
    const candidates = [
      ...(u.currentlyWatching ? [u.currentlyWatching] : []),
      ...u.watchActivities.map((a) => a.show),
    ];
    for (const show of candidates) {
      if (!show || myShowIds.has(show.id)) continue;
      const prev = scores.get(show.id);
      const bump =
        (myGenre && show.genre === myGenre ? 2 : 1) +
        (u.currentlyWatchingId === show.id ? 1 : 0);
      if (prev) {
        prev.score += bump;
      } else {
        scores.set(show.id, { show, score: bump });
      }
    }
  }

  let ranked = [...scores.values()].sort((a, b) => b.score - a.score);

  if (ranked.length < limit) {
    const popular = await prisma.userShow.groupBy({
      by: ["showId"],
      where: {
        status: { in: ["watching", "finished"] },
        showId: { notIn: [...myShowIds] },
      },
      _count: { showId: true },
      orderBy: { _count: { showId: "desc" } },
      take: limit,
    });
    const have = new Set(ranked.map((r) => r.show.id));
    for (const p of popular) {
      if (have.has(p.showId)) continue;
      const show = await prisma.show.findUnique({ where: { id: p.showId } });
      if (show) {
        ranked.push({ show, score: p._count.showId });
        have.add(show.id);
      }
    }
  }

  if (ranked.length < limit) {
    const fillers = await prisma.show.findMany({
      where: { id: { notIn: [...myShowIds, ...ranked.map((r) => r.show.id)] } },
      take: limit - ranked.length,
    });
    for (const show of fillers) {
      ranked.push({ show, score: 0 });
    }
  }

  return ranked.slice(0, limit).map((r) => r.show);
}
