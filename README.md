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
   the `inventory_items`, `inventory_batches`, and `usage_log` tables, the
   `record_usage()` function, row-level security policies, and turns on
   realtime.
4. Optional but recommended for trying it out: run `supabase/seed.sql` in a
   new query to load 25 sample products and their batches matching the
   demo data.
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

## Already have this running? Migrate to per-batch location + new fields

This version moves `location` from `inventory_items` down to
`inventory_batches` (since the real data showed the same product often
sits in two physical places — a clinic room AND storage — at once), and
adds `item_code`, `unit_cost`, `barcode`, `needs_expiry_tracking`, and
`bin_details` to `inventory_items`.

**New install?** Skip this — `schema.sql` already includes everything.

**Already on the v2 (batch-tracking) schema?** Run this once before
re-running `schema.sql`:

```sql
alter table inventory_batches add column if not exists location text;
update inventory_batches b set location = coalesce(
  (select location from inventory_items where id = b.item_id), 'Unassigned'
) where location is null;
alter table inventory_batches alter column location set not null;

alter table inventory_items alter column location drop not null;
alter table inventory_items add column if not exists item_code text;
alter table inventory_items add column if not exists unit_cost numeric(10,2);
alter table inventory_items add column if not exists barcode text;
alter table inventory_items add column if not exists needs_expiry_tracking boolean not null default false;
alter table inventory_items add column if not exists bin_details text;
```

Then run `schema.sql` as normal.

## Already have this running? Migrate to batch tracking

This version changes the schema: `inventory_items.quantity` and
`expiry_date` have moved to a new `inventory_batches` table, so a single
product can now have multiple batches in stock at once, each with its own
quantity and expiry date — e.g. 2 units expiring soon **and** 10 units
from a fresh restock expiring later, both tracked separately instead of
the restock overwriting the older batch's expiry date.

**New install?** Skip this — `schema.sql` already includes everything.

**Already have data in the old single-batch schema?** Run this once in
the SQL Editor *before* re-running `schema.sql`, to carry your existing
stock over into its own batch:

```sql
create table if not exists inventory_batches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  quantity integer not null check (quantity >= 0),
  expiry_date date,
  received_at timestamptz not null default now()
);

insert into inventory_batches (item_id, quantity, expiry_date)
select id, quantity, expiry_date from inventory_items where quantity > 0;

alter table inventory_items drop column if exists quantity;
alter table inventory_items drop column if exists expiry_date;
```

Then run `schema.sql` as normal — it will skip the table since it already
exists, but will still add the missing indexes, replace `record_usage()`
with the FEFO-aware version, and apply RLS/realtime. If the
`alter publication ... add table inventory_batches` line at the bottom
errors saying it's already a member, that's fine — just means it ran
once successfully already; you can ignore that one error and move on.

## Already have this running? Add the supplier column

If you set up Supabase before supplier tracking was added, run:

```sql
alter table inventory_items add column if not exists supplier text;
create index if not exists idx_inventory_supplier on inventory_items (supplier);
```

(New installs don't need this — `schema.sql` already includes it.)

## Real data: what's seeded and what's still missing

`seed.sql` now loads Hope Health's actual inventory (41 real products,
125 batches across the Nurse Practitioner and Walk-In Clinic teams),
not placeholder demo data. A few things worth knowing before you rely on it:

- **No expiry dates exist anywhere in the source spreadsheet.** Every
  batch is seeded with `expiry_date = NULL`. The sheet does tell us
  *which* items are FIFO/expiry-sensitive (`needs_expiry_tracking`), so
  those items will show up without an expiry status until someone adds
  the real date via the **Batches** button — worth doing a pass on those
  first.
- **Health Shelter has no inventory yet.** Their sheet in the source file
  was an empty template. Nothing is seeded for them; add their stock the
  same way (Inventory → Add item, or Batches on an existing product)
  once they do a physical count.
- **~40 additional item names appear in the Walk-In Clinic sheet with no
  quantity, price, or category filled in** — a wishlist of things they
  want to stock, not current inventory. These were intentionally **not**
  imported, since seeding them with fake zero quantities would hide the
  fact that they're not real counts yet. They're listed in the chat
  conversation that produced this import if you want to add them once
  they're priced and counted.
- **6 of the 41 products had clinic-room and storage stock recorded in
  different pack sizes** (e.g. "1 box" vs "1 case" for the same item).
  Those were converted to one consistent unit using the box/case ratios
  given elsewhere in the sheet (e.g. Sterile Gauze 2x2: 1 case = 30
  boxes, from "100/box OR 3000/case" in the sheet's own pack-size
  column). Spot-check these if your physical counts ever drift from
  what's shown.
- **reorder_point** is set to each product's combined clinic-room amount
  across both teams — i.e. "reorder once storage can no longer refill
  the normal working stock both clinic rooms keep on hand." Treat this
  as a starting point, not a final answer — adjust per item as real
  usage patterns come in through Record Usage.

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
    helpers.js          Date/status helpers, including getItemStats()
                          which aggregates a product's batches
  hooks/
    useInventory.js      Loads items with their batches embedded,
                          subscribes to realtime changes, exposes
                          addItem/updateItem/deleteItem/addBatch/deleteBatch
    useUsageLog.js        Loads usage history, exposes recordUsage()
                          which calls the record_usage() database function
  components/
    Sidebar.jsx, Topbar.jsx, MetricCard.jsx, StatusPills.jsx,
    ItemModal.jsx (product details), BatchesModal.jsx (restock /
    discard batches for one product)
  pages/
    Dashboard.jsx     Overview metrics, "needs attention" list, usage trend
    Inventory.jsx      Searchable/filterable table with add/edit/delete
                         and a Batches button per row
    StorageMap.jsx      Shelf/bin grid color-coded by stock health
    RecordUsage.jsx     Usage logging form + recent history
    Reports.jsx         Monthly summaries, usage by team, top items,
                          expired batches list
  App.jsx              Tab navigation and data wiring
  main.jsx             Entry point
supabase/
  schema.sql           Tables, FEFO record_usage() function, RLS policies, realtime
  seed.sql             Optional sample data (includes a 2-batch example)
```

## How the key design decisions map to the schema

- **Separate inventory and usage logs** — `usage_log` is its own table with
  a denormalized `item_name` snapshot, so usage history and monthly reports
  stay intact even if an item is later renamed or deleted.
- **Real-time updates** — `useInventory` and `useUsageLog` subscribe to
  Supabase realtime channels, so if one team logs usage, every other open
  dashboard updates within a second or two without a manual refresh. This
  is what prevents duplicate ordering between teams.
- **Atomic usage recording, FEFO** — `record_usage()` is a single Postgres
  function that locks an item's batches, checks total stock, and draws
  down whichever batch expires soonest first across as many batches as
  needed, then inserts the log entry — all in one transaction. Two staff
  members can't both draw the last unit, and the oldest stock always gets
  used before newer stock.
- **Batch/lot tracking** — a product can have several batches in stock at
  once, each with its own quantity and expiry date (`inventory_batches`).
  Restocking always inserts a new batch rather than overwriting an
  existing one, so an older, sooner-expiring batch never gets silently
  hidden by a newer delivery's later expiry date.
- **Expiry awareness** — `getItemStats()` in `lib/helpers.js` aggregates a
  product's batches into total quantity, expired quantity, near-expiry
  quantity (within 30 days), and soonest expiry date, so the highlighting
  in the Dashboard, Inventory table, Storage Map, and Reports is always
  consistent and reflects partial expiry (e.g. 2 units expired while 10
  more are still healthy) rather than treating the whole product as one
  status.

## Not included yet (see "Future Improvements" in the brief)

Barcode scanning, automated reorder suggestions, supplier/PO tracking,
multi-location support, and role-based access control are intentionally
left out of this MVP. The schema and hooks are structured so each of those
can be added without restructuring the existing tables — e.g. RBAC is a
matter of adding a `staff` table and tightening the RLS policies above.
