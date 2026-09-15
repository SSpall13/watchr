import { prisma } from "@/lib/prisma";

type GrantResult = {
  id: string;
  userId: string;
  awardDefinitionId: string;
  earnedAt: Date;
  awardDefinition: {
    id: string;
    slug: string;
    name: string;
    description: string;
    kind: string;
    threshold: number | null;
    showExternalKey: string | null;
    showTitle: string | null;
    icon: string;
  };
};

async function grantIfMissing(
  userId: string,
  awardDefinitionId: string
): Promise<GrantResult | null> {
  const existing = await prisma.userAward.findUnique({
    where: {
      userId_awardDefinitionId: { userId, awardDefinitionId },
    },
  });
  if (existing) return null;
  return prisma.userAward.create({
    data: { userId, awardDefinitionId },
    include: { awardDefinition: true },
  });
}

/** Grant show-specific + count-based awards after marking a show finished. */
export async function checkAndGrantAwards(
  userId: string,
  finishedShowId?: string
) {
  const granted: GrantResult[] = [];

  if (finishedShowId) {
    const show = await prisma.show.findUnique({ where: { id: finishedShowId } });
    if (show) {
      const showAwards = await prisma.awardDefinition.findMany({
        where: { kind: "show" },
      });
      for (const award of showAwards) {
        const matchesExternal =
          award.showExternalKey &&
          show.externalId &&
          award.showExternalKey === show.externalId;
        const matchesTitle =
          award.showTitle &&
          award.showTitle.toLowerCase() === show.title.toLowerCase();
        if (matchesExternal || matchesTitle) {
          const ua = await grantIfMissing(userId, award.id);
          if (ua) granted.push(ua);
        }
      }
    }
  }

  const finishedCount = await prisma.userShow.count({
    where: { userId, status: "finished" },
  });

  const countAwards = await prisma.awardDefinition.findMany({
    where: { kind: "count" },
    orderBy: { threshold: "asc" },
  });

  for (const award of countAwards) {
    const threshold = award.threshold ?? 0;
    if (finishedCount >= threshold) {
      const ua = await grantIfMissing(userId, award.id);
      if (ua) granted.push(ua);
    }
  }

  return granted;
}
