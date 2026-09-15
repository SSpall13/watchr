import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SHOWS = [
  {
    title: "Breaking Bad",
    year: 2008,
    mediaType: "tv",
    genre: "Drama",
    totalSeasons: 5,
    overview: "A chemistry teacher turned methamphetamine manufacturer.",
    posterUrl: "https://picsum.photos/seed/bb/300/450",
    externalId: "tmdb-1396",
  },
  {
    title: "Stranger Things",
    year: 2016,
    mediaType: "tv",
    genre: "Sci-Fi",
    totalSeasons: 4,
    overview: "Kids in Hawkins face supernatural forces.",
    posterUrl: "https://picsum.photos/seed/st/300/450",
    externalId: "tmdb-66732",
  },
  {
    title: "The Office",
    year: 2005,
    mediaType: "tv",
    genre: "Comedy",
    totalSeasons: 9,
    overview: "A mockumentary on office life at Dunder Mifflin.",
    posterUrl: "https://picsum.photos/seed/office/300/450",
    externalId: "tmdb-2316",
  },
  {
    title: "Game of Thrones",
    year: 2011,
    mediaType: "tv",
    genre: "Fantasy",
    totalSeasons: 8,
    overview: "Noble families fight for control of Westeros.",
    posterUrl: "https://picsum.photos/seed/got/300/450",
    externalId: "tmdb-1399",
  },
  {
    title: "The Bear",
    year: 2022,
    mediaType: "tv",
    genre: "Drama",
    totalSeasons: 3,
    overview: "A young chef takes over his family's sandwich shop.",
    posterUrl: "https://picsum.photos/seed/bear/300/450",
    externalId: "tmdb-136315",
  },
  {
    title: "Severance",
    year: 2022,
    mediaType: "tv",
    genre: "Sci-Fi",
    totalSeasons: 2,
    overview: "Office workers surgically split work and personal memories.",
    posterUrl: "https://picsum.photos/seed/sev/300/450",
    externalId: "tmdb-95396",
  },
  {
    title: "Ted Lasso",
    year: 2020,
    mediaType: "tv",
    genre: "Comedy",
    totalSeasons: 3,
    overview: "An American football coach manages a British soccer team.",
    posterUrl: "https://picsum.photos/seed/ted/300/450",
    externalId: "tmdb-97546",
  },
  {
    title: "The Last of Us",
    year: 2023,
    mediaType: "tv",
    genre: "Drama",
    totalSeasons: 1,
    overview: "Survivors navigate a post-apocalyptic America.",
    posterUrl: "https://picsum.photos/seed/tlou/300/450",
    externalId: "tmdb-100088",
  },
  {
    title: "Succession",
    year: 2018,
    mediaType: "tv",
    genre: "Drama",
    totalSeasons: 4,
    overview: "A media dynasty fights over who will take the throne.",
    posterUrl: "https://picsum.photos/seed/succ/300/450",
    externalId: "tmdb-85552",
  },
  {
    title: "Shogun",
    year: 2024,
    mediaType: "tv",
    genre: "Drama",
    totalSeasons: 1,
    overview: "An English sailor becomes embroiled in feudal Japan.",
    posterUrl: "https://picsum.photos/seed/shogun/300/450",
    externalId: "tmdb-126308",
  },
  {
    title: "Inception",
    year: 2010,
    mediaType: "movie",
    genre: "Sci-Fi",
    overview: "A thief who steals secrets through dream-sharing technology.",
    posterUrl: "https://picsum.photos/seed/incep/300/450",
    externalId: "tmdb-27205",
  },
  {
    title: "Interstellar",
    year: 2014,
    mediaType: "movie",
    genre: "Sci-Fi",
    overview: "Explorers travel through a wormhole in space.",
    posterUrl: "https://picsum.photos/seed/inter/300/450",
    externalId: "tmdb-157336",
  },
  {
    title: "The Dark Knight",
    year: 2008,
    mediaType: "movie",
    genre: "Action",
    overview: "Batman faces the Joker in Gotham City.",
    posterUrl: "https://picsum.photos/seed/tdk/300/450",
    externalId: "tmdb-155",
  },
  {
    title: "Dune",
    year: 2021,
    mediaType: "movie",
    genre: "Sci-Fi",
    overview: "Paul Atreides must survive on the desert planet Arrakis.",
    posterUrl: "https://picsum.photos/seed/dune/300/450",
    externalId: "tmdb-438631",
  },
  {
    title: "Arcane",
    year: 2021,
    mediaType: "tv",
    genre: "Animation",
    totalSeasons: 2,
    overview: "Twin cities of Piltover and Zaun collide.",
    posterUrl: "https://picsum.photos/seed/arcane/300/450",
    externalId: "tmdb-94605",
  },
  {
    title: "Abbott Elementary",
    year: 2021,
    mediaType: "tv",
    genre: "Comedy",
    totalSeasons: 3,
    overview: "Teachers at an underfunded Philadelphia school.",
    posterUrl: "https://picsum.photos/seed/abbott/300/450",
    externalId: "tmdb-124418",
  },
  {
    title: "The Mandalorian",
    year: 2019,
    mediaType: "tv",
    genre: "Sci-Fi",
    totalSeasons: 3,
    overview: "A lone bounty hunter in the outer reaches of the galaxy.",
    posterUrl: "https://picsum.photos/seed/mando/300/450",
    externalId: "tmdb-82856",
  },
  {
    title: "Only Murders in the Building",
    year: 2021,
    mediaType: "tv",
    genre: "Comedy",
    totalSeasons: 4,
    overview: "Three strangers investigate a murder in their apartment building.",
    posterUrl: "https://picsum.photos/seed/omib/300/450",
    externalId: "tmdb-107113",
  },
];

const AWARDS = [
  {
    slug: "series-finisher",
    name: "Series Finisher",
    description: "Finished your first series.",
    icon: "🎬",
    threshold: 1,
  },
  {
    slug: "binge-badge",
    name: "Binge Badge",
    description: "Finished 3 series.",
    icon: "🍿",
    threshold: 3,
  },
  {
    slug: "marathon-master",
    name: "Marathon Master",
    description: "Finished 5 series.",
    icon: "🏆",
    threshold: 5,
  },
  {
    slug: "legend-watcher",
    name: "Legend Watcher",
    description: "Finished 10 series.",
    icon: "👑",
    threshold: 10,
  },
];

async function main() {
  console.log("Seeding Watchr...");

  await prisma.userAward.deleteMany();
  await prisma.userShow.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.award.deleteMany();
  await prisma.show.deleteMany();
  await prisma.user.deleteMany();

  for (const a of AWARDS) {
    await prisma.award.create({ data: a });
  }

  const shows = [];
  for (const s of SHOWS) {
    shows.push(await prisma.show.create({ data: s }));
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

  const finisher = await prisma.award.findUniqueOrThrow({ where: { slug: "series-finisher" } });
  await prisma.userAward.create({
    data: { userId: demo.id, awardId: finisher.id },
  });

  const alexFinisher = await prisma.award.findUniqueOrThrow({ where: { slug: "series-finisher" } });
  await prisma.userAward.create({
    data: { userId: alex.id, awardId: alexFinisher.id },
  });

  console.log("Seed complete.");
  console.log("Demo login: demo@watchr.app / demo1234");
  console.log(`Shows: ${shows.length}, Users: 4`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
