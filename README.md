# Health Clinic Storage Organizer

A Vite + React dashboard backed by Supabase (Postgres) for tracking shared
medical inventory across three teams: Nurse Practitioners, Walk-In Clinic,
and Health Shelter staff.

Covers the MVP from the brief: inventory CRUD with location/category/expiry,
usage logging that auto-decrements stock, low-stock and expiry highlighting,
a storage bin map, and monthly reporting (usage by team, most consumed
items, expired items list).

## 1. Prerequisites

- Node.js 18+ and npm
- A free Supabase account: https://supabase.com

## 2. Create the Supabase project

1. Go to https://supabase.com/dashboard and click **New project**.
2. Pick a name (e.g. "health-clinic-organizer"), set a database password,
   choose the region closest to the clinic, and create the project.
   Wait ~2 minutes for provisioning.
3. Open the **SQL Editor** in the left sidebar, click **New query**, paste
   the contents of `supabase/schema.sql`, and click **Run**. This creates
   the `inventory_items` and `usage_log` tables, the `record_usage()`
   function, row-level security policies, and turns on realtime.
4. Optional but recommended for trying it out: run `supabase/seed.sql` in a
   new query to load 25 sample items matching the demo data.
5. Go to **Authentication -> Providers** and make sure Email is enabled,
   then go to **Authentication -> Users** and add one user per staff
   member (or one shared clinic login for the MVP — see "Notes on access"
   below). The schema's RLS policies require a logged-in (`authenticated`)
   user for all reads and writes.
6. Go to **Project Settings -> API**. You'll need:
   - **Project URL**
   - **anon public** key

## 3. Configure the app

```bash
cp .env.example .env.local
```

Open `.env.local` and paste in your Project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Install and run

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

The app currently calls Supabase without a login screen, so until you wire
up sign-in (see below) you'll see a permissions error from the RLS
policies. The quickest way to test end-to-end right now is to temporarily
relax the policies for development:

```sql
-- DEV ONLY — do not run this in a real clinic deployment
alter policy "Authenticated read inventory" on inventory_items using (true);
alter policy "Authenticated write inventory" on inventory_items using (true) with check (true);
alter policy "Authenticated read usage" on usage_log using (true);
alter policy "Authenticated insert usage" on usage_log with check (true);
```

For a real deployment, add a simple sign-in screen using
`supabase.auth.signInWithPassword()` (Supabase Auth docs:
https://supabase.com/docs/guides/auth) and keep the original policies —
that's the natural place to later layer in role-based access control,
listed as a future improvement in the brief.

## 5. Build for production

```bash
npm run build
```

This outputs a static `dist/` folder you can host anywhere (Netlify,
Vercel, Cloudflare Pages, or a folder on a clinic PC opened in a browser).
Set the same two environment variables in your hosting provider's
dashboard before building.

## Project structure

```
src/
  lib/
    supabaseClient.js   Supabase client setup
    constants.js        Teams and categories
    helpers.js          Date/status helper functions
  hooks/
    useInventory.js      Loads inventory, subscribes to realtime changes,
                          exposes addItem/updateItem/deleteItem
    useUsageLog.js        Loads usage history, exposes recordUsage()
                          which calls the record_usage() database function
  components/
    Sidebar.jsx, Topbar.jsx, MetricCard.jsx, StatusPills.jsx, ItemModal.jsx
  pages/
    Dashboard.jsx     Overview metrics, "needs attention" list, usage trend
    Inventory.jsx      Searchable/filterable table with add/edit/delete
    StorageMap.jsx      Shelf/bin grid color-coded by stock health
    RecordUsage.jsx     Usage logging form + recent history
    Reports.jsx         Monthly summaries, usage by team, top items,
                          expired items list
  App.jsx              Tab navigation and data wiring
  main.jsx             Entry point
supabase/
  schema.sql           Tables, function, RLS policies, realtime
  seed.sql             Optional sample data
```

## How the key design decisions map to the schema

- **Separate inventory and usage logs** — `usage_log` is its own table with
  a denormalized `item_name` snapshot, so usage history and monthly reports
  stay intact even if an item is later renamed or deleted.
- **Real-time updates** — `useInventory` and `useUsageLog` subscribe to
  Supabase realtime channels, so if one team logs usage, every other open
  dashboard updates within a second or two without a manual refresh. This
  is what prevents duplicate ordering between teams.
- **Atomic usage recording** — `record_usage()` is a single Postgres
  function that locks the row, checks stock, decrements it, and inserts
  the log entry in one transaction, so two staff members can't both draw
  the last unit of something at the same moment.
- **Expiry awareness** — `getFlags()` in `lib/helpers.js` derives low-stock,
  near-expiry (within 30 days), and expired status from `reorder_point` and
  `expiry_date` on every render, so the highlighting in the Dashboard,
  Inventory table, Storage Map, and Reports is always consistent.

## Not included yet (see "Future Improvements" in the brief)

Barcode scanning, automated reorder suggestions, supplier/PO tracking,
multi-location support, and role-based access control are intentionally
left out of this MVP. The schema and hooks are structured so each of those
can be added without restructuring the existing tables — e.g. RBAC is a
matter of adding a `staff` table and tightening the RLS policies above.
