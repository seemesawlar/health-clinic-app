# Health Clinic Storage Organizer

A web app that replaces the clinic's spreadsheet-based inventory workflow
with a shared, real-time system for tracking medical supplies, usage,
and expiry across three teams: **Nurse Practitioners**, **Walk-In
Clinic**, and **Health Shelter**.

## The problem

The storage room serves three teams who all draw from the same physical
supplies, tracked in a spreadsheet nobody fully trusted:

- No centralized visibility of stock levels
- Expired items remaining in circulation undetected
- Duplicate ordering from a lack of shared stock awareness
- No structured way to see usage broken down by team
- Disorganized storage, with items spread across bins inconsistently
- No reporting for monthly review or restocking decisions

## What this builds

| Requirement             | How it's covered                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Track inventory**     | Add/edit/delete products; quantity, location, and expiry tracked per batch (see below); category and storage location on every item; low-stock and expired items highlighted automatically |
| **Track usage**         | Log usage per team from a shared pool; stock decrements automatically; usage history kept independently for reporting                                                                      |
| Inventory visibility    | Searchable/filterable inventory table; a storage map showing what's stored where, color-coded by stock health                                                                              |
| Reporting               | Monthly usage by team, most-consumed products, and an exact list of expired stock to discard                                                                                               |
| Real-time collaboration | Every open screen reflects another user's change within a second or two — this is what actually prevents two teams from ordering the same thing                                            |

## Quick start

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor (creates the tables, the
   usage-recording function, and permissions). Optionally also run
   `supabase/seed.sql` to load sample inventory data.
3. Create`.env.local` and fill in your Supabase project
   URL and anon key (Project Settings → API).
4. `npm install && npm run dev`, then open the printed local URL.

> **Note on permissions:** Row-Level Security is currently disabled on
> all tables so the app is usable without building a login screen first
> — this was a deliberate scope cut for this submission (see
> _Limitations_ below), not an oversight. The policies are already
> written in `schema.sql`, ready to enable once authentication exists.

## Architecture

**Stack:** React + Vite on the frontend, Supabase (managed Postgres)
for the database, real-time subscriptions, and generated client —
no separate backend server to run.

**Data model** — three tables, deliberately kept separate:

| Table               | Holds                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `inventory_items`   | One row per product (name, category, unit, reorder point, supplier) — the definition, not the stock |
| `inventory_batches` | One row per physical quantity of a product: its quantity, expiry date, and location                 |
| `usage_log`         | One row per usage event, independent of current stock, for accurate history and reporting           |

**Why batches, not a single quantity per product:** the same product
often needs to exist in more than one place at once — a small working
stock in a clinic room and a larger reserve in storage — and a restock
shouldn't silently overwrite an older batch's earlier expiry date. So
quantity and expiry live on `inventory_batches`, and a product's total
stock and "soonest expiry" are computed by aggregating its batches.

**Other key decisions:**

- Usage is logged through a single database function
  (`record_usage()`) that locks a product's batches, checks total stock,
  and draws from whichever batch expires soonest first
  (first-expired-first-out) — so two people can never both claim the
  last unit, and old stock gets used before new stock.
- Every action refreshes its own screen immediately after saving,
  rather than waiting on the real-time round-trip, so the person who
  made a change always sees it instantly.
- Location and category fields use editable suggestion dropdowns
  (existing values + free text) rather than rigid closed lists or fully
  free text — reduces near-duplicate entries from typos without
  blocking a genuinely new location or category.

## Assumptions

- Single clinic location; three teams share one inventory pool.
- Inventory is measurable in discrete quantities (no partial units).
- No supplier/purchase-order integration in this version — supplier is
  a free-text field for reference.
- Staff interact with the system directly at the point of use (no
  offline mode).

## Limitations (deliberately out of scope for this submission)

- **No authentication or role-based access.** Anyone with the app URL
  can read and write. RLS policies are written but disabled — adding a
  login screen is the natural next step before enabling them.
- **No automated reorder suggestions** — reorder point is a static
  threshold per product, not derived from usage trends yet.
- **No barcode scanning or supplier/PO tracking** at the UI level, though
  the schema already has fields (`barcode`, `supplier`) ready for it.
- **No multi-location support** beyond the named storage locations within
  this one clinic.

## Future improvements

- Staff sign-in and role-based access control
- Automated reorder suggestions from real usage trends
- Barcode scanning at the point of use
- A supplier directory and purchase-order tracking
- Multi-location support
- Mobile-first interface

## Project structure

```
supabase/
  schema.sql          Tables, record_usage() function, permissions, real-time
  seed.sql             Optional sample inventory data
src/
  lib/                 Supabase client, shared constants, helper functions
  hooks/               useInventory.js, useUsageLog.js — all Supabase reads/writes
  components/          Sidebar, Topbar, MetricCard, StatusPills, ItemModal, BatchesModal
  pages/               Dashboard, Inventory, StorageMap, RecordUsage, Reports
  App.jsx              Tab navigation and data wiring
  main.jsx             Entry point
```
