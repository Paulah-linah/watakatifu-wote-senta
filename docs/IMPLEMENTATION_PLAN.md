# Watakatifu Wote Senta Website: Audit & Implementation Plan

**Prepared:** 12 October 2026
**Scope:** The full codebase (`src/`, config, build tooling), the routing, every public page, the staff portal, and the proposed Supabase database.
**Status:** Audit complete. The plan is ready to execute once the open questions in §7 are answered.

---

## Progress (updated 12 October 2026)

**Done and verified:**
- **Phase 0:** git, strict TypeScript, unused dependencies removed, env template, `vercel.json`.
- **Phase 1:** React Router rebuild. Tabs come from the URL; there is a 404 page; navigation uses real links; the mobile menu is complete; the admin is lazy-loaded.
- **Phase 2:** Supabase project `lzphdqkpswzhxlwqwxbp`. 7 migrations, row-level security on every table, `submit_inquiry` RPC with honeypot and rate limit, half-day booking conflict rule, `media` storage bucket, seed content, public sign-up disabled.
- **Phase 3:** all public pages read live data, with loading, empty and error states; Nairobi-timezone dates; the localStorage layer is deleted.
- **Phase 4:** rebuilt inquiry form, reference codes, and the `notify-inquiry` Edge Function + pg_net trigger (emails send once Resend is configured).
- **Phase 5–6:** staff login/reset, role-based portal, inquiries inbox and detail with timeline, hall calendar, CRUD for all 11 content types with image upload, staff accounts (`admin-users` Edge Function), site settings.
- **Tests:** `npm run test:rls` (19 checks) and `npm run test:roles` (25 checks) pass; browser end-to-end checks run on public and admin flows, including mobile at 375px.

**Still to do:**
1. Create the real staff accounts (Staff accounts page, signed in as the first primary admin). The first admin has to be created with the service role; see the README.
2. Resend: create an account, verify the sending domain, set `RESEND_API_KEY` / `RESEND_FROM`. Also configure Resend as custom SMTP in Supabase Auth so password-reset emails reach staff.
3. Deploy to Vercel, then set the Auth Site URL / redirect URLs and the `SITE_URL` secret.
4. Replace stock photos with real photos of the centre (P-1); add `sitemap.xml` and `og:image` once the domain is known.
5. Revoke the Supabase personal access token that was shared in chat, and use a new one locally.

---

## 1. Executive Summary

The site looks finished, but it has **no backend**. Every inquiry, booking and catalogue edit is saved only in the `localStorage` of the browser where it was made. As a result:

1. **Staff never receive inquiries from visitors.** A visitor's inquiry goes into the visitor's own browser, and the staff portal reads the staff member's browser. The two never meet.
2. **The staff portal is open to anyone.** `/admin` has no login. A "Switch Staff Profile" dropdown lets anyone act as any staff member.
3. **Edits made in the portal never reach the public site.** Public pages read the hard-coded `initialData.ts`. Even on the same machine, product edits don't show on `/products`.

There are also confirmed **routing bugs**. Sub-page links such as Hospitality → Accommodation and Ministry → Formation change the URL but show the wrong tab. `/about?tab=…` links are ignored. Unknown URLs silently show the Home page.

Finally, **the type-checker is silently disabled**. `@types/react` is not installed, so `npm run lint` passes no matter what is wrong.

The fix comes in nine phases (§5). The core of it is a Supabase backend (§4) with row-level security, real staff authentication, and a server-side inquiry pipeline with email notifications. That is followed by a routing rebuild, a full admin CMS, and quality work.

---

## 2. Codebase Overview

| Item | Detail |
|---|---|
| Stack | React 19, Vite 6, Tailwind CSS v4, TypeScript 5.8, lucide-react icons |
| Origin | Generated in Google AI Studio (leftover `metadata.json`, Gemini `.env.example`, AI Studio README) |
| Size | 32 files, about 6,450 lines of TSX/TS |
| Persistence | `src/services/storageService.ts`, which wraps `localStorage` and is seeded from `src/data/initialData.ts` |
| Backend | **None.** `express`, `dotenv` and `@google/genai` are installed but never used |
| Version control | **Not a git repository** |
| Build | `npm run build` succeeds (448 kB JS, 115 kB gzipped, one chunk) |

### File map

```
index.html                     SEO meta + JSON-LD, mounts #root
src/main.tsx                   React root
src/App.tsx                    Hand-written router + global inquiry modal + floating WhatsApp/call buttons
src/types/index.ts             All domain types
src/data/initialData.ts        Seed content (institution info, staff, halls, rooms, programs, products, events, gallery, sample inquiries)
src/services/storageService.ts localStorage "database"
src/components/
  layout/Navbar.tsx            Top bar, desktop dropdowns, mobile drawer
  layout/Footer.tsx            Footer links
  inquiry/InquiryForm.tsx      6-type inquiry form (conference, accommodation, catering, retreat, product, general)
  availability/AvailabilityMatrix.tsx  Public hall availability (7-day strip + date picker)
  common/Modal.tsx, Lightbox.tsx, SectionHeader.tsx
src/pages/
  HomePage, AboutPage, HospitalityPage, CatholicMinistryPage, ProductsPage,
  EventsPage, GalleryPage, ContactPage, InquiryPage, admin/AdminDashboard
```

---

## 3. Routing Analysis

### 3.1 How routing works today

`App.tsx` keeps `currentRoute` (from `window.location.pathname`) in React state. A `navigate()` helper calls `history.pushState`, and a `popstate` listener handles Back/Forward. `renderView()` is an `if` chain of `startsWith` checks:

| URL | Renders | Sub-section logic |
|---|---|---|
| `/` or `''` | `HomePage` | none |
| `/about*` | `AboutPage` | none (query string ignored) |
| `/hospitality*` | `HospitalityPage` | `includes('accommodation' / 'catering' / 'laundry' / 'water')`, otherwise `conference` |
| `/ministry*` | `CatholicMinistryPage` | `includes('retreats' / 'formation' / 'prayer')`, otherwise `mass` |
| `/products*` | `ProductsPage` | none |
| `/events*` | `EventsPage` | none |
| `/gallery*` | `GalleryPage` | none |
| `/contact*` | `ContactPage` | none |
| `/inquiry*` | `InquiryPage` | always `initialType="conference"` |
| `/admin*` | `AdminDashboard` | none, and **unprotected** |
| anything else | `HomePage` | **no 404** |

All navigation uses `<button onClick>`, not links. The inquiry form opens as a global modal through `openInquiryModal(type, prefill)`, which is passed down as a prop.

### 3.2 Routing defects (confirmed in the running app)

| ID | Defect | Evidence |
|---|---|---|
| **R-1** | Sub-section links don't switch tabs when you're already on that page. The URL updates but the old tab stays. | On `/hospitality/conference`, clicking footer "Accommodation" gives URL `/hospitality/accommodation` but still shows the **Conference** tab. Same for `/ministry/retreats` → `/ministry/formation`. Cause: `useState(subSection)` only reads the prop on first mount (`HospitalityPage.tsx:35`, `CatholicMinistryPage.tsx:32`). |
| **R-2** | Clicking an in-page tab doesn't update the URL, so tabs can't be shared or bookmarked, and Back skips them. | Clicking "Chapel & Prayer Grounds" leaves the URL at `/ministry/formation`. |
| **R-3** | About dropdown links (`/about?tab=vision`, `philosophy`, `values`) are ignored. | `AboutPage` hard-codes `useState('story')`. |
| **R-4** | No 404 page. Mistyped URLs show Home, and so does `/hospitalityXYZ` because of `startsWith`. | `/does-not-exist` renders the Home hero. |
| **R-5** | Navigation uses `<button>`s, not `<a href>`. No middle-click or "open in new tab", and crawlers can't follow links (SEO). The logo is a clickable `<div>`. | `Navbar.tsx`, `Footer.tsx`, `HomePage.tsx` |
| **R-6** | `/inquiry` can't be deep-linked to a type (e.g. `/inquiry?type=retreat`). | `App.tsx:117` |
| **R-7** | The mobile menu has no **Contact** link and no About sub-links. | `Navbar.tsx:472-491` |
| **R-8** | Each route change runs `window.scrollTo` twice (App and Navbar). Desktop dropdowns open only on hover, so keyboard and touch users can't reach them. | `Navbar.tsx:37,138-183` |
| **R-9** | The admin is in the main bundle and its route is unguarded. | `App.tsx:120` |
| **R-10** | Deep links need host-level SPA rewrites (every path served `index.html`). There is no config for this yet. | Deployment |

### 3.3 Target routing

Replace the hand-written router with **React Router v7** (`createBrowserRouter`):

```
/                                   Home
/about/:tab?                        story | mission-vision | philosophy | values
/hospitality/:section?              conference | accommodation | catering | laundry | water
/ministry/:section?                 mass | retreats | formation | prayer
/products                           ?category=&q=  (filters in the URL)
/products/:sku                      (optional product detail page)
/events                             ?filter=upcoming|past|all
/events/:slug                       event detail
/gallery                            ?category=
/contact
/inquiry                            ?type=&facility=&date=&program=&product=
/admin/login
/admin  (guarded, lazy-loaded)
  /admin/inquiries, /admin/inquiries/:id
  /admin/calendar
  /admin/facilities, /admin/accommodation, /admin/catering, /admin/laundry
  /admin/mass, /admin/retreats, /admin/formation, /admin/events
  /admin/products, /admin/gallery
  /admin/staff, /admin/settings
*                                   404 Not Found
```

The tab or section always comes **from the URL**. Clicking a tab navigates; it doesn't call `setState`. That fixes R-1, R-2, R-3 and R-6 at their root.

---

## 4. Database Design (Supabase / Postgres)

### 4.1 Principles
- **Every piece of content the staff edit lives in the database.** `initialData.ts` becomes seed SQL only.
- **Row-level security (RLS) on every table.** The browser only ever holds the `anon` key.
- **The public can read published content but can't read inquiries or private booking details.** Inquiries are written only through a validated RPC.
- **Staff log in with Supabase Auth.** What each person can do comes from their role in `staff_profiles`.
- **Images live in Supabase Storage** (bucket `media`), not as hot-linked Unsplash URLs.
- **Schema changes are versioned migrations** in `supabase/migrations/`, committed to git.

### 4.2 Enums

| Enum | Values |
|---|---|
| `staff_role` | `primary_admin`, `hospitality_editor`, `ministry_editor`, `products_editor` |
| `availability_status` | `AVAILABLE`, `PENDING`, `BOOKED`, `BLOCKED` |
| `time_slot` | `FULL_DAY`, `MORNING`, `AFTERNOON`, `EVENING` |
| `inquiry_type` | `conference`, `accommodation`, `catering`, `retreat`, `formation`, `product`, `event`, `general` |
| `inquiry_status` | `New`, `In Progress`, `Responded`, `Completed`, `Cancelled` |
| `retreat_category` | `individual`, `group`, `seminar`, `youth`, `clergy` |
| `gallery_category` | `Facilities`, `Accommodation`, `Catering`, `Catholic Ministry`, `Events`, `Grounds` |

### 4.3 Tables

Every table has `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()` and `updated_at timestamptz` (kept current by a shared trigger). Content tables also have `sort_order int` and `is_published boolean`.

**Identity & configuration**

| Table | Key columns | Notes |
|---|---|---|
| `staff_profiles` | `id uuid pk → auth.users`, `full_name`, `title`, `role staff_role`, `email`, `phone`, `avatar_url`, `is_active` | One row per staff login. Created when a staff member is invited, never through public sign-up. |
| `site_settings` | singleton (`id = 1`): `name`, `phone`, `phone_display`, `whatsapp_number`, `email`, `address`, `diocese`, `daily_mass_time`, `office_hours`, `mission`, `vision`, `philosophy`, `core_values jsonb`, `map_embed_url`, `social jsonb` | Replaces `INSTITUTION_INFO`. Today "7:00 AM" is hard-coded in 10 places. |

**Hospitality**

| Table | Key columns | Notes |
|---|---|---|
| `facilities` | `slug unique`, `name`, `capacity_min`, `capacity_max`, `price_kes numeric(10,2)`, `price_note`, `description`, `features text[]`, `seating_styles text[]`, `image_url` | The 3 halls. `CHECK (capacity_min <= capacity_max)`. |
| `facility_bookings` | `facility_id → facilities`, `date`, `time_slot`, `status availability_status`, `client_name`, `contact_phone`, `contact_email`, `public_note`, `internal_note`, `inquiry_id → inquiries null`, `created_by → staff_profiles` | `UNIQUE (facility_id, date, time_slot)`. Private: staff only. |
| `facility_availability_public` (**view**) | `facility_id`, `facility_slug`, `date`, `time_slot`, `status` | The **only** availability data the public sees. No client names or notes (fixes D-6). |
| `accommodation_options` | `name`, `category`, `capacity_desc`, `rooms_count`, `price_estimate`, `description`, `amenities text[]`, `image_url`, `is_available` | |
| `catering_services` | `title`, `description`, `ideal_for`, `includes text[]`, `image_url` | |
| `laundry_services` | `title`, `description`, `turnaround_time`, `notes`, `is_available` | |

**Catholic ministry**

| Table | Key columns | Notes |
|---|---|---|
| `mass_schedules` | `day_label`, `time_label`, `celebration_type`, `description`, `location`, `is_special` | |
| `retreats` | `slug`, `title`, `category retreat_category`, `target_audience`, `description`, `start_date`, `end_date`, `duration`, `requirements text[]`, `fee_kes`, `fee_note`, `image_url` | `CHECK (end_date >= start_date)` |
| `formation_programs` | `slug`, `title`, `description`, `duration`, `schedule`, `requirements text[]`, `fee_kes`, `fee_note`, `image_url` | |
| `events` | `slug`, `title`, `description`, `event_date date`, `start_time time`, `end_time time`, `time_label`, `location`, `image_url`, `registration_open` | "Past" is **calculated from `event_date`**, not a stored flag (fixes D-9). |

**Catalogue & media**

| Table | Key columns | Notes |
|---|---|---|
| `product_categories` | `name unique`, `sort_order` | Seeded with the 4 current categories. Admins can add more. |
| `products` | `sku unique`, `name`, `category_id → product_categories`, `description`, `price_kes numeric null`, `image_url`, `is_available`, `is_featured` | Price display (`KES 1,200` / "Price on inquiry") is formatted in the UI, not stored. |
| `gallery_images` | `title`, `category gallery_category`, `image_url`, `caption` | |

**Inquiries (the core business workflow)**

| Table | Key columns | Notes |
|---|---|---|
| `inquiries` | `reference_code unique` (e.g. `WWS-2026-00042`, set by trigger), `type inquiry_type`, `status inquiry_status default 'New'`, `full_name`, `phone`, `email`, `organization`, `subject`, `message`, **links:** `facility_id`, `accommodation_id`, `catering_service_id`, `retreat_id`, `formation_id`, `event_id`, `product_id` (all nullable FKs); **details:** `event_date`, `start_time`, `end_time`, `attendees_count`, `seating_arrangement`, `additional_requirements`, `check_in_date`, `check_out_date`, `guests_count`, `event_nature`, `retreat_format`, `preferred_date`, `participants_count`, `product_quantity`; **workflow:** `assigned_to → staff_profiles`, `responded_at`, `source` (`page` / `modal` / `contact`), `user_agent` | `CHECK`s: `check_out_date >= check_in_date`, `end_time > start_time`, counts > 0, email format, phone 9–15 digits. Indexes on `(status, created_at desc)` and `(type)`. |
| `inquiry_activity` | `inquiry_id → inquiries on delete cascade`, `author_id → staff_profiles`, `kind` (`note` / `status_change` / `assignment` / `booking_created`), `body`, `from_status`, `to_status` | Replaces the single overwritable `adminNotes` field with a full timeline. |
| `audit_log` (optional) | `actor_id`, `table_name`, `row_id`, `action`, `diff jsonb` | Generic trigger on content tables, so changes can be traced. |

### 4.4 Functions & triggers
- `set_updated_at()`: BEFORE UPDATE trigger on every table.
- `current_staff_role()` / `is_staff()` / `can_manage(area text)`: `SECURITY DEFINER` helpers that RLS policies use. The area-to-role matrix is in §4.5.
- `submit_inquiry(payload jsonb) returns (reference_code)`: `SECURITY DEFINER` RPC and **the only way the public can create an inquiry**. It validates required fields per type, trims and limits lengths, checks a honeypot field, rate-limits per email/phone (e.g. at most 5 per hour), and inserts with `status = 'New'`. Direct `INSERT` on `inquiries` is not granted to `anon`.
- `generate_inquiry_reference()`: BEFORE INSERT trigger using a sequence.
- `log_inquiry_status_change()`: AFTER UPDATE trigger that writes to `inquiry_activity`.
- `convert_inquiry_to_booking(inquiry_id, status, time_slot)`: staff RPC that creates or updates a `facility_bookings` row and links it.
- **Notifications:** a database webhook on `inquiries` INSERT calls an Edge Function `notify-inquiry`. It emails the right staff member and sends the visitor an acknowledgement with their reference code. Provider: Resend (recommended) or SMTP. Secrets live in Supabase, never in the frontend.
- **Staff onboarding:** Edge Function `invite-staff` (primary_admin only) uses the service role to call `auth.admin.inviteUserByEmail` and creates the `staff_profiles` row. **Public sign-up is turned off** in Auth settings.

### 4.5 Access matrix (RLS)

| Area / table | Public (`anon`) | primary_admin | hospitality_editor | ministry_editor | products_editor |
|---|---|---|---|---|---|
| `site_settings` | read | read/write | read | read | read |
| facilities, accommodation, catering, laundry | read published | full | full | read | read |
| `facility_bookings` | none (view only) | full | full | read | none |
| `facility_availability_public` view | read | read | read | read | read |
| mass, retreats, formation | read published | full | read | full | read |
| events | read published | full | full | full | read |
| product_categories, products | read published | full | read | read | full |
| gallery_images | read published | full | full | full | full |
| inquiries | **RPC insert only** | all | conference, accommodation, catering, general | retreat, formation, event, general | product, general |
| inquiry_activity | none | all | for visible inquiries | for visible inquiries | for visible inquiries |
| staff_profiles | none | full | read self + list names | read self + list names | read self + list names |
| Storage `media` | read | write | write | write | write |

> The inquiry-visibility rows are a **recommendation**. Today every staff profile can see every inquiry. See open question Q2.

### 4.6 Seeding
`supabase/seed.sql` will contain everything now in `initialData.ts`: institution settings, 3 halls, 3 accommodation options, 4 catering, 3 laundry, 2 mass schedules, 3 retreats, 2 formation programs, 4 product categories, 8 products, 3 events and 9 gallery images. The sample inquiries and the September availability blocks will **not** be seeded into production; they're demo data. The 3 staff accounts are created through invites, not seed SQL.

---

## 5. Issue Register

Severity: 🔴 Critical (the site doesn't do its job) · 🟠 High · 🟡 Medium · ⚪ Low.

### 5.1 Data & backend
| ID | Sev | Issue | Location | Fix (phase) |
|---|---|---|---|---|
| D-1 | 🔴 | Inquiries are saved to the visitor's own `localStorage`. Staff never see them. | `InquiryForm.tsx:99`, `storageService.ts:290` | `submit_inquiry` RPC + notifications (P4) |
| D-2 | 🔴 | Public pages read hard-coded `INITIAL_*` constants, so portal edits never show. Products page ignores the portal entirely. | `ProductsPage.tsx:36`, `EventsPage.tsx:21`, `GalleryPage.tsx:25`, `HospitalityPage`, `CatholicMinistryPage`, `HomePage` | Supabase data layer (P3) |
| D-3 | 🔴 | No real persistence. Data is per-browser and lost when site data is cleared. | `storageService.ts` | Supabase (P2–P3) |
| D-4 | 🟠 | `getItem` writes the seed into `localStorage` on first read, so returning visitors never see content updates. | `storageService.ts:63-66` | Removed with StorageService (P3) |
| D-5 | 🟠 | Facility names are inconsistent. Seed availability uses "St. Bakhita", the portal uses "St. Bakhita Conference Hall", and the portal maps names to IDs with `includes('Bakhita')`. | `initialData.ts:158+`, `AdminDashboard.tsx:93-98` | FK `facility_id` everywhere (P2) |
| D-6 | 🟠 | **Privacy leak:** the public availability matrix shows internal notes such as "Reserved for <client> (by <staff>)" and "Released by administrator". | `AvailabilityMatrix.tsx:268`, `AdminDashboard.tsx:105,120` | Public view without notes (P2) |
| D-7 | 🟡 | "Release block" keeps a row as AVAILABLE instead of deleting it. Past blocks pile up and are never sorted. | `AdminDashboard.tsx:113-124, 543` | Delete + date sorting/filters (P6) |
| D-8 | 🟡 | Editing a product drops its `featured` flag and generates random SKUs that can collide (`WWS-100…999`). | `AdminDashboard.tsx:131-145` | DB `is_featured` + unique `sku` (P6) |
| D-9 | 🟡 | `isPast` on events is a static flag, so events never move to "Past" on their own. | `EventsPage.tsx:21-24` | Calculate from `event_date` (P3) |
| D-10 | 🟡 | Dates use `toISOString()` (UTC). In Kenya (UTC+3) "today" is wrong between 00:00 and 03:00, which affects date `min`s and the matrix strip. | `AvailabilityMatrix.tsx:31,47,180`, `InquiryForm.tsx`, `AdminDashboard.tsx:50` | `todayInNairobi()` util (P3) |

### 5.2 Security & access
| ID | Sev | Issue | Fix |
|---|---|---|---|
| S-1 | 🔴 | `/admin` has no authentication. Anyone can open it, and the "Switch Staff Profile" dropdown lets anyone act as any staff member. | Supabase Auth + route guard (P5) |
| S-2 | 🔴 | `AdminUser.permissions` are defined but **never checked**. | RLS + role-aware UI (P2, P5) |
| S-3 | 🟠 | No spam or abuse protection on the inquiry forms. | Honeypot + rate limit in RPC; optional Cloudflare Turnstile (P4) |
| S-4 | 🟠 | Staff emails and roles are in the public JS bundle (`INITIAL_STAFF_USERS`). | Move to `staff_profiles` behind RLS (P2) |
| S-5 | 🟡 | `.env.example` asks for a Gemini key that is never used, and there are no Supabase env vars. | New `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (P0) |

### 5.3 Inquiry form
| ID | Sev | Issue | Location |
|---|---|---|---|
| F-1 | 🟠 | Prefill keys are dropped. Catering cards send `cateringType` and Laundry/Mass/Event buttons send `subject`, but the form ignores both. Products send `quantity`, but the form reads `productQuantity`. | `InquiryForm.tsx:72,89,92` vs callers |
| F-2 | 🟠 | Select values don't match. The accommodation default "All Saints Guest House Apartments" and cards' names (e.g. "Centre Main Residential **Wings**") aren't in the option list. Formation program titles sent as `retreatTitle` aren't in the retreat options. | `InquiryForm.tsx:67,416-419,511-516` |
| F-3 | 🟠 | Dropdown options (halls, rooms, programs) are hard-coded and will drift from the database. | Same |
| F-4 | 🟡 | No checks that end time > start time, check-out > check-in, or attendees within the hall's capacity (the max is 155 but the largest hall holds 100). No phone format check. | Same |
| F-5 | 🟡 | The visitor gets no reference number or email confirmation. The success message says "routed directly to Fr Charles…", which isn't true today. | `InquiryForm.tsx:173-178,704` |
| F-6 | 🟡 | "Retreat" and "Formation" share one type, and event registrations are filed as "general". | `types/index.ts:154` |
| F-7 | ⚪ | The modal title shows `BOOKING & INQUIRY - CONFERENCE` (raw enum, uppercase). | `App.tsx:179` |

### 5.4 Staff portal (functionality gaps)
| ID | Sev | Issue |
|---|---|---|
| A-1 | 🟠 | Only 4 tabs exist (Inquiries, Calendar, Products, Staff). There's no way to manage halls, accommodation, catering, laundry, Mass times, retreats, formation, events, gallery or site settings, even though `storageService` has some save methods. |
| A-2 | 🟠 | Images are entered as URLs only. There's no upload. |
| A-3 | 🟡 | Inquiries have no search, date range, assignment, notes timeline, export (CSV) or "convert to booking" action. |
| A-4 | 🟡 | The calendar is a flat list. There's no month view, and it can't book a half-day `time_slot` even though the type supports it. |
| A-5 | 🟡 | The Staff tab is read-only, with no invite, deactivate or role change. It renders `member.phone`, which doesn't exist on `AdminUser`. **This is the only real TypeScript error** (`AdminDashboard.tsx:735`). |
| A-6 | ⚪ | The tab label "Facility Calendar & Blocks (n)" counts only BOOKED, while the panel heading counts all non-available entries. |

### 5.5 Code quality & tooling
| ID | Sev | Issue | Fix |
|---|---|---|---|
| C-1 | 🟠 | **`@types/react` / `@types/react-dom` are missing**, so React is typed `any` and `tsc` can't catch anything. Verified: with the types installed, 1 error appears (A-5). | Install types; turn on `strict` (P0) |
| C-2 | 🟠 | Not a git repository, so there's no history or safety net. | `git init` + first commit before any change (P0) |
| C-3 | 🟡 | Unused dependencies: `@google/genai`, `express`, `@types/express`, `dotenv`, `tsx`, `esbuild`, `autoprefixer`; also `vite` is listed in both deps and devDeps. | Remove (P0) |
| C-4 | 🟡 | AI Studio leftovers: `metadata.json`, README, `package.json` name `react-example`, the `DISABLE_HMR` block, and a garbled comment character in `vite.config.ts:16`. | Clean up (P0) |
| C-5 | 🟡 | Tailwind classes that do nothing: `xs:` (no `xs` breakpoint in Tailwind v4), so the WhatsApp label never shows and the matrix grid jumps from 2 to 7 columns. `animate-in` / `fade-in` / `zoom-in-95` (20 uses) need `tw-animate-css`, which isn't installed. | Define `--breakpoint-xs` + add `tw-animate-css` (P7) |
| C-6 | 🟡 | Heavy repetition: tab buttons copy-pasted 4–5 times per page, and identical card markup everywhere. Pages are 400–1,000 lines. | Extract `Tabs`, `Card`, `PageHero`, `Field` components (P7) |
| C-7 | ⚪ | `prefillData as Record<string, any>`, `(subSection as any)`, and unused icon imports. | Typed props (P1, P7) |
| C-8 | ⚪ | No tests, no ESLint/Prettier, no CI. | P9 |

### 5.6 UI, accessibility & responsiveness
| ID | Sev | Issue |
|---|---|---|
| U-1 | 🟠 | Desktop dropdowns are hover-only, with no keyboard or touch access and no `aria-expanded`. |
| U-2 | 🟠 | Modal and Lightbox have no `role="dialog"`, `aria-modal`, focus trap or focus return. Both reset `body.overflow` to `unset`, which breaks if they're stacked. |
| U-3 | 🟡 | The logo text crowds and wraps at tablet widths (~800px). The top bar wraps into 2–3 rows on mobile and pushes the sticky header to about 170px. |
| U-4 | 🟡 | Clickable `<div>`s (logo, gallery tiles, home gallery) can't be focused. |
| U-5 | 🟡 | No loading, empty or error states (needed once data comes from the network). No toast feedback after admin saves. `window.confirm` is used for destructive actions. |
| U-6 | ⚪ | The floating WhatsApp button covers form submit buttons on small screens. |

### 5.7 Content, SEO & performance
| ID | Sev | Issue |
|---|---|---|
| P-1 | 🟠 | Every image is an Unsplash stock photo, yet the Gallery says "authentic photography". Several images are reused (the chapel photo appears 5 times). Real photos of the centre are needed. |
| P-2 | 🟡 | Every route shares one `<title>`/description. No `og:image`, favicon, `robots.txt`, `sitemap.xml` or canonical URLs. |
| P-3 | 🟡 | 448 kB single bundle; the admin, lightbox and map ship to every visitor. |
| P-4 | 🟡 | The Google Maps embed uses a made-up `pb=` string centred on generic "Ngong", not the centre's location. |
| P-5 | ⚪ | An internal note shows on the public About page: "…maintained in partnership with **PN Innovations**". |
| P-6 | ⚪ | The phone `tel:` link uses `0704346417` (no country code), while the JSON-LD uses `+254…`. International callers can't dial it. |
| P-7 | ⚪ | `loading="lazy"`, `width`/`height` and `srcset` are missing on most images. |

---

## 6. Phased Implementation Plan

Each phase ends in a working, buildable state. Phases P2–P6 are the critical path. P7–P8 can overlap once P3 is in.

### Phase 0: Foundation & hygiene *(about 0.5 day)*
1. `git init`, add `.gitignore` for `dist/`, `.env*`, `supabase/.temp`, and make a baseline commit of the current code.
2. Install `@types/react` and `@types/react-dom`; set `"strict": true`; fix the `member.phone` error (C-1, A-5).
3. Remove unused deps and AI Studio leftovers; rename the package to `watakatifu-wote-senta`; rewrite the README (C-3, C-4).
4. New `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (S-5).
5. Add ESLint (typescript-eslint, react-hooks, jsx-a11y) and Prettier.

**Exit:** `npm run lint` and `npm run build` pass with real type checking.

### Phase 1: Routing rebuild *(about 1 day)*
1. Add `react-router-dom` v7. Create `src/router.tsx` with the route tree from §3.3 and a `RootLayout` (Navbar, Outlet, Footer, floating buttons, inquiry modal).
2. Make the tab or section come from the URL params for About, Hospitality and Ministry. Tab clicks become `<NavLink>`s (R-1, R-2, R-3).
3. Change every `<button onClick={navigate}>` into `<Link>`/`<NavLink>`; make the logo a link; use active styling from `NavLink` (R-5).
4. Add a `NotFoundPage` and `errorElement` (R-4).
5. `/inquiry` reads `?type=…` and prefill parameters (R-6).
6. Move the inquiry modal into an `InquiryModalProvider` context (`useInquiryModal().open(type, prefill)`) to remove the `onOpenInquiry` prop-drilling.
7. Add `ScrollRestoration`; remove the duplicate `scrollTo` calls (R-8).
8. Mobile menu: add Contact and the About sub-links (R-7). Make the dropdowns open on click/keyboard with `aria-expanded` (U-1).
9. Lazy-load `/admin/*` with `React.lazy` (R-9, P-3).
10. Add SPA rewrite config for the chosen host (R-10). See Q1.

**Exit:** every link in the navbar, footer and home page goes to the correct page and tab; Back/Forward and refresh keep the tab; unknown URLs show a 404.

### Phase 2: Supabase database *(about 1.5 days, needs project access)*
1. Set up the Supabase CLI in the repo (`supabase/config.toml`) and link the project.
2. Migration `0001_schema.sql`: enums, tables, constraints, indexes and the `updated_at` trigger (§4.2–4.3).
3. Migration `0002_auth_rls.sql`: role helper functions, RLS on every table, the public availability view, and grants (§4.5).
4. Migration `0003_functions.sql`: `submit_inquiry`, the reference-code trigger, the activity trigger, and `convert_inquiry_to_booking` (§4.4).
5. Migration `0004_storage.sql`: the `media` bucket and its policies.
6. `seed.sql` from `initialData.ts` (§4.6).
7. Turn off public sign-ups; set the Site URL and redirect URLs for staff login.
8. Generate types: `supabase gen types typescript > src/lib/database.types.ts`.
9. **RLS test pass:** as `anon`, confirm that inquiries, bookings and staff can't be read, that `submit_inquiry` works, and that published content is readable. As each role, confirm the matrix in §4.5.

**Exit:** the schema and seed are deployed, and the security tests pass.

### Phase 3: Data layer & public pages *(about 1.5 days)*
1. Add `@supabase/supabase-js` and `@tanstack/react-query`; create `src/lib/supabase.ts` and a `QueryClientProvider`.
2. Create `src/services/` per domain (`settings`, `facilities`, `availability`, `hospitality`, `ministry`, `events`, `products`, `gallery`, `inquiries`) with typed queries and React Query hooks.
3. Switch Home, About, Hospitality, Ministry, Products, Events, Gallery, Contact, Navbar and Footer to the hooks (D-2). Replace every hard-coded "7:00 AM", phone number and email with `site_settings`.
4. Add loading skeletons, empty states and error states with retry (U-5).
5. `AvailabilityMatrix` reads the public view and subscribes to Supabase Realtime for live updates (D-6).
6. Add date utilities in `src/lib/dates.ts` (Africa/Nairobi): `todayISO()`, `isPast()`, formatters (D-9, D-10).
7. Delete `storageService.ts` and the `localStorage` code (D-3, D-4). Keep `initialData.ts` only as the source for the seed, or delete it.

**Exit:** the public site renders entirely from Supabase, and a content change in the DB shows up after a refresh.

### Phase 4: Inquiry pipeline *(about 1 day)*
1. Rebuild `InquiryForm` with `react-hook-form` + `zod`, using one schema per inquiry type that matches the RPC checks (F-4).
2. Fill dropdowns from the DB (halls, rooms, catering, retreats, formation, events, products) and pass **IDs, not names** (F-2, F-3).
3. Standardise prefill keys (`facilityId`, `date`, `accommodationId`, `cateringId`, `programId`, `productId`, `quantity`, `subject`) and update every caller (F-1). Add the `formation` and `event` types (F-6).
4. Submit through `supabase.rpc('submit_inquiry')`. Show the **reference code** on success, and add a honeypot field (S-3, F-5).
5. Edge Function `notify-inquiry` + DB webhook: send the staff notification (routed by type) and the visitor confirmation email. Optionally add a WhatsApp click-to-chat link in the staff email.
6. Make the success copy truthful; human-readable modal title (F-7).

**Exit:** an inquiry submitted on a phone appears in the staff portal on another device within seconds, and both emails arrive.

### Phase 5: Authentication & portal shell *(about 1 day)*
1. `/admin/login`: email + password with "forgot password" (magic link as an alternative). `AuthProvider` with `useSession()`.
2. `RequireStaff` route guard. Load `staff_profiles` for the role; deactivated staff are signed out.
3. Admin layout: sidebar showing only the modules the role can use, a profile menu and sign-out. Remove the "Switch Staff Profile" dropdown (S-1, S-2).
4. Edge Function `invite-staff` + accept-invite / set-password page.
5. Create the 3 staff accounts by invite (and a ministry editor if wanted). See Q5.

**Exit:** `/admin` can't be opened without logging in, and each role sees only its own modules.

### Phase 6: Admin CMS modules *(about 3–4 days)*
1. **Dashboard home:** counts of new inquiries, this week's bookings and upcoming events; recent activity.
2. **Inquiries:** table with search, filters (type, status, date range, assignee), pagination and CSV export. Detail page with a notes timeline, status changes, assignment, quick call/WhatsApp/email actions, and **Convert to booking** (A-3).
3. **Calendar:** month grid per hall with half-day slots; click to create/edit a booking; private vs public notes; conflict prevention via the unique constraint (A-4, D-7).
4. **Content modules** built on one shared `CrudTable` + `CrudForm` pattern: Facilities, Accommodation, Catering, Laundry, Mass schedule, Retreats, Formation, Events, Products (+ categories), Gallery. Each has publish/unpublish and drag-to-reorder (A-1, D-8).
5. **Media:** an image uploader to Supabase Storage with client-side resize/compress, used by every content form (A-2).
6. **Staff** (primary_admin): invite, change role, deactivate (A-5).
7. **Site settings** (primary_admin): contact details, Mass time, mission/vision/values, map link.
8. Toasts for every save; confirmation dialogs instead of `window.confirm` (U-5).

**Exit:** staff can manage every piece of content on the public site without touching code.

### Phase 7: UI, accessibility & responsiveness *(about 1.5 days)*
1. Extract shared components (`Tabs`, `PageHero`, `ServiceCard`, `Field`, `Button`) to shrink the pages (C-6).
2. Make Modal/Lightbox accessible: dialog roles, focus trap, focus return, scroll lock that handles stacked dialogs (U-2).
3. Define the `xs` breakpoint; add `tw-animate-css` (C-5).
4. Header: compact the top bar on mobile and fix the logo wrapping at md widths (U-3). Make every clickable element a real button or link (U-4).
5. Floating buttons: hide them or move them up when a modal or form footer is in view (U-6).
6. Accessibility audit with axe: colour contrast, labels on every input, heading order, and alt text from the DB.

### Phase 8: Content, SEO & performance *(about 1 day, plus real photos)*
1. Replace stock images with real photos of the centre uploaded to Storage (P-1). See Q4.
2. Per-route `<title>`/meta through React 19's `<title>` support (or `react-helmet-async`); add `og:image`, favicon set, `robots.txt`, `sitemap.xml` and canonical URLs (P-2). Add `Event` JSON-LD for events.
3. Fix the Google Maps embed and the "Open in Maps" link to point at the real pin (P-4). Use international `tel:+254…` links (P-6).
4. Remove the internal "PN Innovations" note (P-5).
5. Image optimisation: `loading="lazy"`, explicit sizes, Supabase image transforms or `srcset` (P-7). Split code per route (P-3).

### Phase 9: QA, testing & launch *(about 1.5 days)*
1. **Unit tests** (Vitest): zod schemas, date utilities, formatters.
2. **E2E tests** (Playwright): every nav link → correct page and tab; submit each of the 6+ inquiry types; staff login; change inquiry status; create a booking and see it on the public matrix; role restrictions.
3. **RLS regression script**: SQL tests run as `anon` and as each role.
4. Lighthouse targets: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
5. Deploy: environment variables on the host, SPA rewrites, custom domain + HTTPS, Supabase Auth redirect URLs, email domain (SPF/DKIM) for notifications.
6. Hand-over: a staff user guide (how to answer inquiries, block dates, add products/events, upload photos) and a backup/restore note (Supabase PITR or scheduled dumps).

**Estimated total:** about 13–15 working days.

---

## 7. Open Questions (need answers before or during the phases noted)

| # | Question | Needed by |
|---|---|---|
| Q1 | **Where will the site be hosted?** (Vercel, Netlify, cPanel or shared hosting, or keep AI Studio/Cloud Run.) This affects the SPA rewrites and the deploy setup. | P1 / P9 |
| Q2 | **Who should see which inquiries?** The recommendation is in §4.5: editors see their own types and the primary admin sees all. Or should every staff member see everything, as today? | P2 |
| Q3 | **Email notifications:** which address(es) get each inquiry type? Is there a sending domain we can verify (e.g. `ngongdiocese.org`) for Resend/SMTP? | P4 |
| Q4 | Are **real photos** of the halls, chapel, rooms and grounds available? | P8 |
| Q5 | Which **staff accounts** should be created, and is there a Ministry Editor? (The role exists but nobody has it.) | P5 |
| Q6 | Is **half-day booking** (morning/afternoon/evening) needed, or full days only? | P2 |
| Q7 | Should accommodation also have an availability calendar, or stay inquiry-only? | P2 |

---

## 8. Supabase Access: Safe Handling

- Please **don't paste the personal access token into chat.** Set it in the terminal instead:
  `setx SUPABASE_ACCESS_TOKEN "<token>"` (new terminal), or run `npx supabase login`. Then share only the **project reference** (the `xxxx` in `https://xxxx.supabase.co`).
- The frontend will only ever use the **anon** key. The **service-role** key is stored only as an Edge Function secret.
- Every schema change goes through migration files in `supabase/migrations/`, so it can be reviewed and reproduced. Nothing is changed by hand in the dashboard.
- Before running migrations, I'll confirm whether the project is empty or already has tables, and won't drop anything without your approval.
