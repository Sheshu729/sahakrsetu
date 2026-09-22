# HomeWork Connect

A two-sided home-services marketplace (Urban Company style) for India. Homeowners post household jobs; workers browse, apply, chat, get paid, and earn reviews.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **SQLite** via `better-sqlite3` (file DB at `data/homework.db`, zero setup)
- **Auth**: JWT (`jose`) in httpOnly cookie, bcrypt password hashes
- **Styling**: Tailwind CSS v4

## Quick start

```bash
npm install
npm run seed    # demo accounts + sample jobs
npm run dev     # http://localhost:3000
```

### Demo accounts (password for all: `demo123`)

| Role   | Email              |
| ------ | ------------------ |
| Owner  | `owner@demo.com`   |
| Worker | `worker@demo.com`  |
| Admin  | `admin@homework.com` (password `admin123`) |

## 60-second demo script

1. **Owner** login → *New Post* → post a job (title, budget, location, pincode).
2. **Worker** login (incognito/second browser) → *Available Jobs* → filter by pincode → apply with a proposed rate.
3. **Owner** → open the post → **Accept** the applicant (auto-creates chat, rejects others).
4. **Worker** → *Messages* → chat with the owner (live polling).
5. **Owner** → *Mark as Complete* → **Pay** the worker (demo payment) → **Rate** the worker.
6. **Worker** → *My Applications* → see accepted/completed status; profile shows the rating.

## Environment

`.env.local`:

```
JWT_SECRET=<random string>          # required in production
RAZORPAY_KEY_ID=                    # optional — enables Razorpay order mode
RAZORPAY_KEY_SECRET=                # optional
```

Without Razorpay keys, payments complete in **demo mode** (instant success) so the flow always works offline/in judges' rooms.

## Scripts

| Command       | What it does                          |
| ------------- | ------------------------------------- |
| `npm run dev` | Start dev server                      |
| `npm run build` | Production build                     |
| `npm start`   | Serve production build                |
| `npm run lint` | ESLint                                |
| `npm run seed` | Reset & seed demo data (SQLite)       |

## Architecture notes

- `src/proxy.ts` — Next 16 request proxy (formerly middleware): redirects unauthenticated users off `/owner`, `/worker`, `/admin`.
- `src/lib/db.ts` — typed SQLite layer; all API routes use it. Legacy `data/db.json` is auto-imported once, then renamed.
- Rate limiting is per-IP with periodic cleanup (`src/lib/rate-limit.ts`).
- Chat polls every 3s; notification bell polls every 15s — no websockets needed at this scale.
