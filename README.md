# Watchr

Social media for shows and movies you're watching. Share your currently watching title, pick a favorite, get simple recommendations from people with overlapping tastes, add friends, and earn awards when you finish a series.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) Credentials provider (email/password + bcrypt)
- **Prisma** + **SQLite** (`file:./dev.db`)

## Features

- Accounts (register / login)
- Profile: currently watching + favorite show + awards
- Feed: friends' currently watching + recommendations
- Friends: request / accept / remove; search by email
- Search seeded shows; set watching / finished / want / favorite
- Awards when you mark a series finished (Series Finisher, Binge Badge, etc.)

## Posters

Seeded show/movie artwork uses real posters from **TVMaze** (TV) and **OMDb** / Amazon CDN (movies; iTunes Search is used when available). URLs are hardcoded in `prisma/seed.ts` so seeding works offline. `next.config.ts` allows `static.tvmaze.com`, `*.mzstatic.com` (iTunes), `m.media-amazon.com`, and `image.tmdb.org` for `next/image`.

## Local setup (Windows PowerShell)

```powershell
git clone https://github.com/SSpall13/watchr.git
cd watchr

Copy-Item .env.example .env

npm install

npx prisma db push

npm run seed

npm run dev
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

### Refreshing seed data (new posters)

If you already have a local DB and need the updated poster URLs:

```powershell
git pull
npm run db:reset
# or: Remove-Item prisma\dev.db -ErrorAction SilentlyContinue; npx prisma db push; npm run seed
npm run dev
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
src/lib/          # auth, prisma, recommendations, awards
prisma/           # schema + seed
```

## Out of scope (v1)

- Live TMDB API (search uses the seeded DB; no TMDB API key required)
- Ads / payments
- Push notifications

## License

MIT
