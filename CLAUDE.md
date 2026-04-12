# coisinhas-do-gu — Claude context

Baby inventory + enxoval tracker. Next.js 16 App Router, Drizzle ORM, Neon (Postgres), Vercel Blob, cookie-based auth.

## First-time setup

```bash
npm install
vercel link          # links to rodolfo-albuquerques-projects/coisinhas-do-gu
vercel env pull .env.local --yes   # DATABASE_URL, BLOB_READ_WRITE_TOKEN, AUTH_*, etc.
```

`node_modules/` is not committed. `.env.local` is not committed (gitignored).
The `drizzle.config.ts` uses `@next/env` (loadEnvConfig) to pick up `.env.local` — so drizzle-kit commands need the env file present.

## Auth

Cookie-based HMAC-SHA256 session (`coisinhas-session`). No NextAuth, no Supabase.
- Secret: `AUTH_SECRET` env var
- Password: `AUTH_PASSWORD` env var
- All server actions call `requireAuth()` — located in each actions file

## Key directories

```
src/
  app/
    (app)/          ← authenticated routes
      registrar/    ← register a piece/item (?kind=roupinhas|quarto)
      inventario/   ← inventory list + filters (?kind=)
      enxoval/      ← enxoval list, /novo, /[id], /[id]/editar
      tipos/        ← manage clothing/item types (?kind=)
    actions/        ← server actions (clothes.ts, enxovais.ts, clothing-types.ts, photos.ts)
    presentes/      ← public gift registry page
  components/       ← shared UI components
  lib/
    db/schema.ts    ← Drizzle schema (source of truth)
    types/database.ts ← TypeScript interfaces
    constants.ts    ← SEASONS, ENXOVAL_KINDS, parseEnxovalKind()
    suggested-enxovais.ts ← suggested templates (roupinhas + quarto)
```

## Domain model

Two **kinds** of enxoval: `roupinhas` (sized baby clothes) and `quarto` (nursery items, size-agnostic).

- `clothing_types.kind` — scopes types to a kind; unique on `(name, kind)`
- `enxovais.kind` — which kind of enxoval
- `clothes.size_period_id` — nullable (NULL for quarto items)
- `enxoval_items.size_period_id` — nullable; unique constraint uses `NULLS NOT DISTINCT`

Progress matching key: `${clothing_type_id}-${size_period_id ?? "none"}` — used consistently in enxoval list, detail, and presentes pages.

Clothes are always counted per-kind (join to `clothing_types` on `kind`) so Roupinhas and Quarto progress never cross-count.

## Running migrations

`drizzle-kit migrate` does **not** work out of the box — the `__drizzle_migrations` table is not tracked (0000_init was applied manually). Run SQL directly:

```bash
node --env-file=.env.local -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  // run your SQL statements here
"
```

Also: `drizzle/meta/0000_snapshot.json` is stale — it still contains old Supabase/NextAuth tables that no longer exist. The generated diff for new migrations will include spurious DROP TABLEs; hand-edit the generated SQL to remove them (only keep the real changes).

## Build / typecheck

```bash
npx tsc --noEmit    # type check — should be clean
npm run lint        # eslint — 2 pre-existing warnings (unused imports), no errors
npm run build       # fails without DATABASE_URL (expected locally)
```

## Deploying

Push to `main` → Vercel auto-deploys. No manual deploy step needed.
