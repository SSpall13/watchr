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

## Posters

Seeded show/movie artwork uses real posters from **TVMaze** (TV) and **OMDb** / Amazon CDN (movies; iTunes Search is used when available). URLs are hardcoded in `prisma/seed.ts` so seeding works offline. `next.config.ts` allows `static.tvmaze.com`, `*.mzstatic.com` (iTunes), `m.media-amazon.com`, and `image.tmdb.org` for `next/image`.

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

### Refreshing seed data (awards + streaming services)

If you already have a local DB and need the updated schema/seed:

```powershell
cd C:\Users\Owner\watchr
git pull
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue
npx.cmd prisma db push
npm.cmd run seed
npm.cmd run dev
```

Or use the reset script:

```powershell
git pull
npm.cmd run db:reset
npm.cmd run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run seed` | Seed shows, demo users, friendships, awards |
| `npm run db:push` | Push Prisma schema to SQLite |
| `npm run db:reset` | Reset DB and re-seed |

## Project layout

```
src/app/          # App Router pages + API routes
src/components/   # UI
src/lib/          # auth, prisma, recommendations, awards, streaming
prisma/           # schema + seed
```

## Out of scope (v1)

- Live TMDB API (search uses the seeded DB; no TMDB API key required)
- Ads / payments
- Push notifications

## License

MIT
