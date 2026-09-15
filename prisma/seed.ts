import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SHOWS_A } from "./seed-shows-a";
import { SHOWS_B } from "./seed-shows-b";
import { COUNT_AWARDS, SHOW_AWARDS } from "./seed-awards";

const prisma = new PrismaClient();
const SHOWS = [...SHOWS_A, ...SHOWS_B];

async function main() {
  console.log("Seeding Watchr...");

  await prisma.userAward.deleteMany();
  await prisma.userShow.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.awardDefinition.deleteMany();
  await prisma.show.deleteMany();
  await prisma.user.deleteMany();

  for (const a of COUNT_AWARDS) {
    await prisma.awardDefinition.create({ data: a });
  }

  for (const a of SHOW_AWARDS) {
    await prisma.awardDefinition.create({
      data: {
        slug: a.slug,
        name: a.name,
        description: a.description,
        icon: a.icon,
        kind: "show",
        showTitle: a.title,
        showExternalKey: a.externalId,
      },
    });
  }

  const shows = [];
  for (const s of SHOWS) {
    shows.push(await prisma.show.create({ data: { ...s } }));
  }

  const byTitle = Object.fromEntries(shows.map((s) => [s.title, s]));

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demo = await prisma.user.create({
    data: {
      email: "demo@watchr.app",
      name: "Demo Watcher",
      bio: "Always hunting for the next great series.",
      passwordHash,
      currentlyWatchingId: byTitle["Severance"].id,
      favoriteShowId: byTitle["Breaking Bad"].id,
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: "alex@watchr.app",
      name: "Alex Rivera",
      bio: "Sci-fi & thrillers only.",
      passwordHash,
      currentlyWatchingId: byTitle["The Last of Us"].id,
      favoriteShowId: byTitle["Stranger Things"].id,
    },
  });

  const jordan = await prisma.user.create({
    data: {
      email: "jordan@watchr.app",
      name: "Jordan Lee",
      bio: "Comedy queen.",
      passwordHash,
      currentlyWatchingId: byTitle["The Bear"].id,
      favoriteShowId: byTitle["Ted Lasso"].id,
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: "sam@watchr.app",
      name: "Sam Chen",
      bio: "Fantasy + prestige drama.",
      passwordHash,
      currentlyWatchingId: byTitle["Shogun"].id,
      favoriteShowId: byTitle["Succession"].id,
    },
  });

  await prisma.userShow.createMany({
    data: [
      { userId: demo.id, showId: byTitle["Severance"].id, status: "watching", progress: "S2E3" },
      { userId: demo.id, showId: byTitle["Breaking Bad"].id, status: "finished", finishedAt: new Date("2024-06-01") },
      { userId: demo.id, showId: byTitle["The Office"].id, status: "finished", finishedAt: new Date("2024-08-15") },
      { userId: demo.id, showId: byTitle["Arcane"].id, status: "want" },
      { userId: alex.id, showId: byTitle["The Last of Us"].id, status: "watching", progress: "S1E5" },
      { userId: alex.id, showId: byTitle["Stranger Things"].id, status: "finished", finishedAt: new Date("2023-01-01") },
      { userId: alex.id, showId: byTitle["Severance"].id, status: "finished", finishedAt: new Date("2025-03-01") },
      { userId: jordan.id, showId: byTitle["The Bear"].id, status: "watching", progress: "S3E2" },
      { userId: jordan.id, showId: byTitle["Ted Lasso"].id, status: "finished", finishedAt: new Date("2023-06-01") },
      { userId: jordan.id, showId: byTitle["Abbott Elementary"].id, status: "watching" },
      { userId: sam.id, showId: byTitle["Shogun"].id, status: "watching", progress: "S1E8" },
      { userId: sam.id, showId: byTitle["Succession"].id, status: "finished", finishedAt: new Date("2023-05-28") },
      { userId: sam.id, showId: byTitle["Game of Thrones"].id, status: "finished", finishedAt: new Date("2022-01-01") },
    ],
  });

  await prisma.friendship.createMany({
    data: [
      { userId: demo.id, friendId: alex.id, status: "accepted" },
      { userId: demo.id, friendId: jordan.id, status: "accepted" },
      { userId: sam.id, friendId: demo.id, status: "pending" },
    ],
  });

  async function grantBySlug(userId: string, slug: string) {
    const def = await prisma.awardDefinition.findUniqueOrThrow({ where: { slug } });
    await prisma.userAward.create({
      data: { userId, awardDefinitionId: def.id },
    });
  }

  await grantBySlug(demo.id, "series-finisher");
  await grantBySlug(demo.id, "finish-breaking-bad");
  await grantBySlug(demo.id, "finish-the-office");
  await grantBySlug(alex.id, "series-finisher");
  await grantBySlug(alex.id, "finish-stranger-things");
  await grantBySlug(alex.id, "finish-severance");
  await grantBySlug(jordan.id, "series-finisher");
  await grantBySlug(jordan.id, "finish-ted-lasso");
  await grantBySlug(sam.id, "series-finisher");
  await grantBySlug(sam.id, "finish-succession");
  await grantBySlug(sam.id, "finish-game-of-thrones");

  console.log("Seed complete.");
  console.log("Demo login: demo@watchr.app / demo1234");
  console.log(`Shows: ${shows.length}, Users: 4, Award defs: ${COUNT_AWARDS.length + SHOW_AWARDS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
