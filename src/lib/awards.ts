import { prisma } from "@/lib/prisma";

/** Grant any awards the user qualifies for based on finished series count. */
export async function checkAndGrantAwards(userId: string) {
  const finishedCount = await prisma.userShow.count({
    where: { userId, status: "finished" },
  });

  const awards = await prisma.award.findMany({
    orderBy: { threshold: "asc" },
  });

  const granted = [];
  for (const award of awards) {
    if (finishedCount >= award.threshold) {
      const existing = await prisma.userAward.findUnique({
        where: { userId_awardId: { userId, awardId: award.id } },
      });
      if (!existing) {
        const ua = await prisma.userAward.create({
          data: { userId, awardId: award.id },
          include: { award: true },
        });
        granted.push(ua);
      }
    }
  }
  return granted;
}
