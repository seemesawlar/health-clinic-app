# Clinic Medication Inventory Tracker

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A real-time medication and medical-supply inventory system for a
multi-team clinic — built to replace a spreadsheet-based workflow with
shared, live tracking of stock, usage, and expiry across three teams:
**Nurse Practitioners**, **Walk-In Clinic**, and **Health Shelter**.

> This is a portfolio project modeled on a real take-home assignment
> for a clinic operations role. The clinic name, medication list, and
> data below are fictional/sample — built to demonstrate the same
> product and engineering decisions the original assignment required.

## The problem

The storage room serves three teams who all draw from the same shared
supply of medications, tracked in a spreadsheet nobody fully trusted:

- No centralized visibility of stock levels
- Expired medications remaining in circulation undetected
- Duplicate ordering from a lack of shared stock awareness
- No structured way to see usage broken down by team
- Disorganized storage, with items spread across bins inconsistently
- No reporting for monthly review or restocking decisions

## What this builds

| Requirement              | How it's covered                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Track inventory**      | Add/edit/delete medications; quantity, location, and expiry tracked per batch (see below); category and storage location on every item; low-stock and expired items highlighted automatically |
| **Track usage**          | Log usage per team from a shared pool; stock decrements automatically; usage history kept independently for reporting                                                                      |
| Inventory visibility     | Searchable/filterable inventory table; a storage map showing what's stored where, color-coded by stock health                                                                              |
| Reporting                | Monthly usage by team, most-consumed medications, and an exact list of expired stock to discard                                                                                            |
| Real-time collaboration  | Every open screen reflects another user's change within a second or two — this is what actually prevents two teams from ordering the same thing                                            |

## Quick start

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor (creates the tables, the
   usage-recording function, and permissions). Then run
   `supabase/seed.sql` to load a sample medication inventory — 58
   medications across 12 pharmacy categories, with a realistic mix of
   expired, near-expiry, and healthy stock, plus three months of
   sample usage history.
3. Fill in your Supabase  project URL and
   anon key (Project Settings → API) to `.env.local` .
5. `npm install && npm run dev`, then open the printed local URL.

> **Note on permissions:** Row-Level Security is currently disabled on
> all tables so the app is usable without building a login screen
> first — this was a deliberate scope cut for this submission (see
> _Limitations_ below), not an oversight. The policies are already
> written in `schema.sql`, ready to enable once authentication exists.

## Architecture

**Stack:** React + Vite on the frontend, Supabase (managed Postgres)
for the database, real-time subscriptions, and generated client —
no separate backend server to run.

**Data model** — three tables, deliberately kept separate:

| Table               | Holds                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `inventory_items`   | One row per medication (name, category, unit, reorder point, supplier) — the definition, not the stock |
| `inventory_batches` | One row per physical quantity of a medication: its quantity, expiry date, and location                |
| `usage_log`         | One row per usage event, independent of current stock, for accurate history and reporting              |

**Why batches, not a single quantity per medication:** the same
medication often needs to exist in more than one place at once — a
small working stock in a clinic room and a larger reserve in the
pharmacy cabinet — and a restock shouldn't silently overwrite an older
batch's earlier expiry date. So quantity and expiry live on
`inventory_batches`, and a medication's total stock and "soonest
expiry" are computed by aggregating its batches.

**Other key decisions:**

- Usage is logged through a single database function
  (`record_usage()`) that locks a medication's batches, checks total
  stock, and draws from whichever batch expires soonest first
  (first-expired-first-out) — so two people can never both claim the
  last unit, and old stock gets used before new stock.
- Every action refreshes its own screen immediately after saving,
  rather than waiting on the real-time round-trip, so the person who
  made a change always sees it instantly.
- Location and category fields use editable suggestion dropdowns
  (existing values + free text) rather than rigid closed lists or fully
  free text — reduces near-duplicate entries from typos without
  blocking a genuinely new location or category.
- Controlled substances and refrigerated items (vaccines, insulin) get
  their own categories and bin-detail conventions, since those drive
  different storage and compliance handling than a bottle of ibuprofen.

## Assumptions

- Single clinic location; three teams share one medication pool.
- Inventory is measurable in discrete quantities (no partial units).
- No supplier/purchase-order integration in this version — supplier is
  a free-text field for reference.
- Staff interact with the system directly at the point of use (no
  offline mode).

## Limitations (deliberately out of scope for this project)

- **No authentication or role-based access.** Anyone with the app URL
  can read and write. RLS policies are written but disabled — adding a
  login screen is the natural next step before enabling them.
- **No automated reorder suggestions** — reorder point is a static
  threshold per medication, not derived from usage trends yet.
- **No barcode scanning or supplier/PO tracking** at the UI level,
  though the schema already has fields (`barcode`, `supplier`) ready
  for it.
- **No multi-location support** beyond the named storage locations
  within this one clinic.
- **No controlled-substance dispensing log** beyond the standard usage
  log — a real deployment would need a dedicated CII–CV audit trail.

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
  seed.sql             Sample medication inventory + usage history
src/
  lib/                 Supabase client, shared constants, helper functions
  hooks/               useInventory.js, useUsageLog.js — all Supabase reads/writes
  components/          Sidebar, Topbar, MetricCard, StatusPills, ItemModal, BatchesModal
  pages/               Dashboard, Inventory, StorageMap, RecordUsage, Reports
  App.jsx              Tab navigation and data wiring
  main.jsx             Entry point
```

## License

MIT — see [LICENSE](LICENSE).
