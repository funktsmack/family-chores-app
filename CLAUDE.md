# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000 (no auth required locally)
npm run build    # Production build (run this to catch TypeScript errors before pushing)
npm run lint     # ESLint
```

After any change, push to GitHub and Railway auto-deploys:
```bash
git add <files> && git commit -m "message" && git push
```

## Architecture

**Single-page app** — `app/page.tsx` is a client component that holds all state. It fetches from the API routes on load and after every mutation, then passes data down to components as props.

**Database** — `lib/db.ts` exports a singleton `getDb()`. The SQLite file location is controlled by `DATA_DIR` env var (Railway volume) or defaults to the project root. Tables are created and seeded with example data on first run. All DB calls use `better-sqlite3`'s synchronous API (no `async/await` needed in API routes).

**Auth** — `proxy.ts` (Next.js 16's replacement for `middleware.ts`) intercepts all requests. If `AUTH_PIN` env var is set, it checks for a `auth_token` cookie containing SHA-256 of the PIN. Without `AUTH_PIN` set, auth is completely bypassed (local dev). Login/logout API routes live at `/api/auth/login` and `/api/auth/logout`.

**Chore reset logic** — Implemented client-side in `app/page.tsx` via `isCompletedInPeriod()`. It filters the completions list to find chores done in the current period (daily = today, weekly = Mon–Sun, monthly = calendar month). Completed chore IDs are passed as a `Set<number>` to components.

**Points** — Awarded atomically in a `better-sqlite3` transaction when a completion is posted. Deducted when a completion is deleted (undo). Member `total_points` is stored on the `members` table (denormalized for leaderboard performance).

## Deployment

- GitHub repo: https://github.com/funktsmack/family-chores-app
- Hosted on Railway — auto-deploys on push to `master`
- Required Railway env vars: `AUTH_PIN`, `DATA_DIR=/data`
- Railway volume must be mounted at `/data` for SQLite persistence
- Node 20+ required (enforced via `.node-version` and `engines` in `package.json`)
