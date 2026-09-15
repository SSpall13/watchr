# Watchr

Social media for shows and movies you're watching. Share your currently watching title, pick a favorite, get simple recommendations from people with overlapping tastes, add friends, and earn awards when you finish a series.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) Credentials provider (email/password + bcrypt)
- **Prisma** + **SQLite** (`file:./dev.db`)

## Features

- Accounts (register / login)
- Profile: currently watching + favorite show + awards (count-based and show-specific)
- Feed: friends' currently watching + recommendations, filterable by streaming service
- Friends: request / accept / remove; search by email
- Search seeded shows; filter by streaming service; set watching / finished / want / favorite
- Awards when you mark a series finished:
  - Count awards (Series Finisher, Binge Badge, Marathon Master, Legend Watcher)
  - Show-specific awards (Breaking Bad, The Office, Stranger Things, Game of Thrones, The Bear, Succession, Severance, The Last of Us, Squid Game, Shogun, and more)
- Streaming service badges on show cards (Netflix, Max, Disney+, Hulu, Prime Video, Apple TV+, Peacock, Paramount+, Theatrical)
- Optional **TMDB catalog sync** by watch provider (large Discover catalogs per service)

## Posters

Seeded show/movie artwork uses real posters from **TVMaze** (TV), **OMDb** / Amazon CDN (movies), and **TMDB** image CDN where available. URLs are hardcoded in `prisma/seed-shows-*.ts` so seeding works offline. `next.config.ts` allows `static.tvmaze.com`, `*.mzstatic.com` (iTunes), `m.media-amazon.com`, and `image.tmdb.org` for `next/image`.

The built-in seed includes **~110** well-known titles balanced across major US streaming services. For a much larger catalog, use TMDB sync below.

## Local setup (Windows PowerShell)

```powershell
git clone https://github.com/SSpall13/watchr.git
cd watchr

Copy-Item .env.example .env

npm.cmd install

npx.cmd prisma db push

npm.cmd run seed

npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo account

After seeding:

- **Email:** `demo@watchr.app`
- **Password:** `demo1234`

Other seeded users (same password): `alex@watchr.app`, `jordan@watchr.app`, `sam@watchr.app`.

### Auth secret

`.env.example` includes a placeholder `AUTH_SECRET`. For local demo it can stay as-is. To generate a strong secret:

```powershell
# If OpenSSL is available:
openssl rand -base64 32
```

Paste the value into `.env` as `AUTH_SECRET=...`.

### Refreshing seed data + optional TMDB sync

```powershell
cd C:\Users\Owner\watchr
git pull
# add TMDB_API_KEY to .env for full sync
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue
npx.cmd prisma db push
npm.cmd run seed
npm.cmd run sync:catalog   # only if TMDB_API_KEY set
npm.cmd run dev
```

Or use the reset script (seed only):

```powershell
git pull
npm.cmd run db:reset
npm.cmd run sync:catalog   # optional
npm.cmd run dev
```

## Optional: TMDB catalog sync

Pull popular TV + movies **per streaming service** from TMDB Discover (US watch providers) into your local `Show` table.

1. Create a free API key: [TMDB settings → API](https://www.themoviedb.org/settings/api)
2. Add to `.env`:

```env
TMDB_API_KEY=your_key_here
# optional:
# TMDB_MAX_PAGES=5          # pages per provider × media type (default 5; raise for more)
# TMDB_WATCH_REGION=US
```

3. Run:

```powershell
npm.cmd run sync:catalog
```

**US watch provider IDs** used by the script (TMDB / JustWatch):

| Service | TMDB provider id |
|---------|------------------|
| Netflix | 8 |
| Prime Video | 9 |
| Hulu | 15 |
| Disney+ | 337 |
| Apple TV+ | 350 |
| Peacock | 386 |
| Paramount+ | 531 |
| Max | 1899 |

Shows are upserted with `externalId` like `tmdb:tv:123` / `tmdb:movie:456`, posters from `https://image.tmdb.org/t/p/w500{poster_path}`, and `streamingService` labels matching the UI filters.

**Important:** This pulls Discover pages (popularity-sorted), page-capped by `TMDB_MAX_PAGES`. It is **not** a legal full dump of every obscure title forever. Raise `TMDB_MAX_PAGES` (e.g. `10` or `20`) for a larger—but still finite—catalog.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run seed` | Seed ~110 shows (upsert), demo users, friendships, awards |
| `npm run sync:catalog` | Optional TMDB Discover sync by watch provider |
| `npm run db:push` | Push Prisma schema to SQLite |
| `npm run db:reset` | Reset DB and re-seed |

## Project layout

```
src/app/          # App Router pages + API routes
src/components/   # UI
src/lib/          # auth, prisma, recommendations, awards, streaming
prisma/           # schema + seed modules
prisma/scripts/   # sync-tmdb-catalog.ts
```

## Out of scope (v1)

- Live in-app TMDB search (search uses the local DB; expand via seed + `sync:catalog`)
- Ads / payments
- Push notifications

## License

MIT
