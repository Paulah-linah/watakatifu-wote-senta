# Watakatifu Wote Senta website

Website and staff portal for Watakatifu Wote Senta (All Saints Conference Centre), Catholic Diocese of Ngong, Kenya.

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, React Router 7, TanStack Query, react-hook-form + zod
- **Backend:** Supabase (Postgres with row-level security, Auth, Storage, Edge Functions)
- **Hosting:** Vercel (`vercel.json` rewrites all routes to the SPA)

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase URL and anon key
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Type-check (strict) and build to `dist/` |
| `npm run lint` | Type-check only |
| `npm run test:rls` | Security tests as an anonymous visitor (needs `scripts/.secrets/service_role` for cleanup) |
| `npm run test:roles` | Role-permission tests with temporary staff accounts (needs `scripts/.secrets/service_role`) |

## Project layout

```
src/
  router.tsx               All routes (public + lazy-loaded /admin)
  layouts/RootLayout.tsx   Public header, footer, floating contact buttons, inquiry modal
  pages/                   Public pages (tabs come from the URL, e.g. /hospitality/catering)
  pages/admin/             Staff portal (login, inquiries, calendar, content, staff, settings)
  services/                Supabase data hooks (content, availability, inquiries)
  context/                 AuthContext (staff session + role) and InquiryModalContext
  lib/                     Supabase client, generated DB types, date + format helpers
supabase/
  migrations/              Versioned schema, RLS, functions, storage, notifications
  seed.sql                 Initial site content
  functions/               Edge Functions: admin-users, notify-inquiry
scripts/
  db.mjs                   Apply migrations / run SQL through the Supabase Management API
  test-rls.mjs, test-roles.mjs
docs/IMPLEMENTATION_PLAN.md  Audit and implementation plan
```

## Database changes

Never edit the schema in the Supabase dashboard. Add a new file to `supabase/migrations/` (`YYYYMMDDHHMMSS_name.sql`), then:

```bash
node scripts/db.mjs apply
```

The script reads the access token from `SUPABASE_ACCESS_TOKEN` or `scripts/.secrets/access_token` (git-ignored). After schema changes, regenerate types:

```bash
npx supabase gen types typescript --project-id lzphdqkpswzhxlwqwxbp > src/lib/database.types.ts
```

## Staff accounts

Public sign-up is disabled. Create the **first** primary administrator from the command line:

```bash
node --experimental-websocket scripts/create-admin.mjs "Fr Charles Ndemange" fr.charles@ngongdiocese.org
```

That administrator then adds everyone else from **Staff portal → Staff accounts**. Each new person gets a temporary password to change after their first sign-in.

## Staff roles

| Role | Manages | Sees inquiries of type |
|---|---|---|
| Primary Administrator | Everything, including staff accounts and site settings | All |
| Hospitality Editor | Halls, hall calendar, accommodation, catering, laundry, events, gallery | Conference, accommodation, catering, general |
| Ministry Editor | Mass schedule, retreats, formation, events, gallery (calendar read-only) | Retreat, formation, event, general |
| Products Editor | Products, categories, gallery | Product, general |

The database enforces these rules (row-level security). The UI only hides what a role can't use.

## Email notifications

New inquiries trigger the `notify-inquiry` Edge Function, which emails the responsible department and sends the visitor a confirmation with their reference number. It stays switched off until these secrets are set in Supabase (Project settings → Edge Functions → Secrets):

- `RESEND_API_KEY`: from resend.com, after verifying the sending domain
- `RESEND_FROM`: e.g. `Watakatifu Wote Senta <bookings@ngongdiocese.org>`
- `SITE_URL`: the live site URL, used for "Open in staff portal" links

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Vite).
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. After the first deploy, add the live URL to Supabase Auth → URL configuration (Site URL and redirect URLs), and update the `SITE_URL` function secret.
