/**
 * Sync popular TMDB Discover titles per US watch provider into the Show table.
 *
 * Requires TMDB_API_KEY in .env (free key from https://www.themoviedb.org/settings/api).
 *
 * This is NOT a legal/full dump of every title forever — it pulls Discover pages
 * (popularity-ordered) capped by TMDB_MAX_PAGES (default 5) per provider × media type.
 * Raise TMDB_MAX_PAGES (e.g. 10–20) for a larger catalog.
 *
 * US watch provider IDs (TMDB / JustWatch):
 *   Netflix 8, Amazon Prime Video 9, Hulu 15, Disney+ 337,
 *   Apple TV+ 350, Peacock 386, Paramount+ 531, Max 1899
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile();

const prisma = new PrismaClient();

const API_KEY = process.env.TMDB_API_KEY || "";
const MAX_PAGES = Math.max(1, Number(process.env.TMDB_MAX_PAGES || "5") || 5);
const WATCH_REGION = process.env.TMDB_WATCH_REGION || "US";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/** Label used in Show.streamingService (matches UI filters). */
export const TMDB_PROVIDERS: { id: number; label: string }[] = [
  { id: 8, label: "Netflix" },
  { id: 9, label: "Prime Video" },
  { id: 15, label: "Hulu" },
  { id: 337, label: "Disney+" },
  { id: 350, label: "Apple TV+" },
  { id: 386, label: "Peacock" },
  { id: 531, label: "Paramount+" },
  { id: 1899, label: "Max" },
];

type DiscoverItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
};

async function tmdbFetch(path: string, params: Record<string, string>) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<{ results: DiscoverItem[]; total_pages: number }>;
}

function yearFromDate(d?: string) {
  if (!d || d.length < 4) return null;
  const y = Number(d.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

async function upsertFromDiscover(
  item: DiscoverItem,
  mediaType: "tv" | "movie",
  streamingService: string,
) {
  const title = (mediaType === "tv" ? item.name : item.title)?.trim();
  if (!title) return false;

  const externalId = `tmdb:${mediaType}:${item.id}`;
  const posterUrl = item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null;
  const year = yearFromDate(mediaType === "tv" ? item.first_air_date : item.release_date);
  const overview = item.overview || null;

  const existing =
    (await prisma.show.findFirst({ where: { externalId } })) ||
    (await prisma.show.findFirst({ where: { title } }));

  const data = {
    title,
    year,
    overview,
    posterUrl,
    mediaType,
    streamingService,
    externalId,
  };

  if (existing) {
    await prisma.show.update({
      where: { id: existing.id },
      data: {
        ...data,
        // Prefer non-null poster/overview updates
        posterUrl: posterUrl || existing.posterUrl,
        overview: overview || existing.overview,
        year: year ?? existing.year,
      },
    });
  } else {
    await prisma.show.create({ data });
  }
  return true;
}

async function syncProvider(
  provider: { id: number; label: string },
  mediaType: "tv" | "movie",
) {
  const path = mediaType === "tv" ? "/discover/tv" : "/discover/movie";
  let upserted = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const json = await tmdbFetch(path, {
      with_watch_providers: String(provider.id),
      watch_region: WATCH_REGION,
      sort_by: "popularity.desc",
      page: String(page),
      language: "en-US",
      include_adult: "false",
    });

    if (!json.results?.length) break;

    for (const item of json.results) {
      const ok = await upsertFromDiscover(item, mediaType, provider.label);
      if (ok) upserted++;
    }

    if (page >= json.total_pages) break;
    // Be polite to the free API
    await new Promise((r) => setTimeout(r, 200));
  }

  return upserted;
}

async function main() {
  if (!API_KEY) {
    console.error(
      "Missing TMDB_API_KEY. Get a free key at https://www.themoviedb.org/settings/api and add it to .env",
    );
    process.exit(1);
  }

  console.log(
    `Syncing TMDB catalog (region=${WATCH_REGION}, maxPages=${MAX_PAGES} per provider×type)...`,
  );
  console.log("Providers:", TMDB_PROVIDORS.map((p) => `${p.label}(${p.id})`).join(", "));

  let total = 0;
  for (const provider of TMDB_PROVIDERS) {
    for (const mediaType of ["tv", "movie"] as const) {
      const n = await syncProvider(provider, mediaType);
      console.log(`  ${provider.label} ${mediaType}: +${n}`);
      total += n;
    }
  }

  const count = await prisma.show.count();
  console.log(`Done. Upserted ~${total} rows this run. Shows in DB: ${count}`);
  console.log(
    "Note: Discover pages are popularity-sorted and page-capped — not a complete catalog of every title.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
