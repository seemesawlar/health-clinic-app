-- Cedarbrook Community Clinic — Medication Inventory & Usage Tracker
-- Schema: tables, the record_usage() function, indexes, realtime
-- publication, and RLS policies (written but disabled by default).
--
-- Run this whole file once in the Supabase SQL Editor on a fresh
-- project, then optionally run seed.sql to load sample data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- inventory_items — one row per product definition (not the stock itself)
-- ---------------------------------------------------------------------------
create table if not exists inventory_items (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  category               text not null,
  unit                   text not null default 'each',
  reorder_point          integer not null default 5,
  location               text,
  supplier               text,
  item_code              text,
  unit_cost              numeric(10, 2),
  barcode                text,
  needs_expiry_tracking  boolean not null default false,
  bin_details            text,
  created_at             timestamptz not null default now()
);

create unique index if not exists inventory_items_name_key
  on inventory_items (lower(name));

-- ---------------------------------------------------------------------------
-- inventory_batches — one row per physical quantity of a product: its own
-- quantity, expiry date, and location. A product's total stock and soonest
-- expiry are computed by aggregating its batches (see src/lib/helpers.js).
-- ---------------------------------------------------------------------------
create table if not exists inventory_batches (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references inventory_items (id) on delete cascade,
  quantity     integer not null check (quantity >= 0),
  expiry_date  date,
  location     text not null,
  received_at  timestamptz not null default now()
);

create index if not exists inventory_batches_item_id_idx
  on inventory_batches (item_id);
create index if not exists inventory_batches_expiry_idx
  on inventory_batches (expiry_date);

-- ---------------------------------------------------------------------------
-- usage_log — one row per usage event, independent of current stock, for
-- accurate history and reporting. item_name is intentionally denormalized:
-- it's a snapshot of the product name at the time of use, so historical
-- reports stay correct even if a product is later renamed or deleted.
-- ---------------------------------------------------------------------------
create table if not exists usage_log (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid references inventory_items (id) on delete set null,
  item_name  text not null,
  team       text not null,
  quantity   integer not null check (quantity > 0),
  note       text,
  used_at    timestamptz not null default now()
);

create index if not exists usage_log_used_at_idx on usage_log (used_at desc);
create index if not exists usage_log_team_idx on usage_log (team);

-- ---------------------------------------------------------------------------
-- record_usage() — the only way usage should be logged. Runs as a single
-- transaction (a Postgres function body is implicitly one transaction) so
-- two staff members can never both draw the last unit of something:
--
--   1. Locks the item's batches (FOR UPDATE) so a concurrent call has to
--      wait rather than read a stale total.
--   2. Confirms total stock covers the requested quantity.
--   3. Draws from whichever batch expires soonest first (FIFO by expiry;
--      batches with no expiry date are drawn from last), decrementing or
--      deleting batches as they're consumed.
--   4. Inserts the usage_log row with a snapshot of the item name.
-- ---------------------------------------------------------------------------
create or replace function record_usage(
  p_item_id  uuid,
  p_team     text,
  p_quantity integer,
  p_note     text default null
)
returns void
language plpgsql
as $$
declare
  v_item_name   text;
  v_remaining   integer := p_quantity;
  v_batch       record;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero.';
  end if;

  select name into v_item_name from inventory_items where id = p_item_id;
  if v_item_name is null then
    raise exception 'Item not found.';
  end if;

  -- Lock this item's batches for the duration of the transaction.
  perform 1 from inventory_batches where item_id = p_item_id for update;

  if (select coalesce(sum(quantity), 0) from inventory_batches where item_id = p_item_id) < p_quantity then
    raise exception 'Not enough stock on hand for this item.';
  end if;

  for v_batch in
    select id, quantity
    from inventory_batches
    where item_id = p_item_id and quantity > 0
    order by (expiry_date is null), expiry_date asc, received_at asc
    for update
  loop
    exit when v_remaining <= 0;

    if v_batch.quantity <= v_remaining then
      v_remaining := v_remaining - v_batch.quantity;
      delete from inventory_batches where id = v_batch.id;
    else
      update inventory_batches
      set quantity = quantity - v_remaining
      where id = v_batch.id;
      v_remaining := 0;
    end if;
  end loop;

  insert into usage_log (item_id, item_name, team, quantity, note)
  values (p_item_id, v_item_name, p_team, p_quantity, p_note);
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime — every open screen reflects another user's change within a
-- second or two. Supabase's default `supabase_realtime` publication is
-- used; these tables are added to it explicitly.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table inventory_items;
alter publication supabase_realtime add table inventory_batches;
alter publication supabase_realtime add table usage_log;

-- ---------------------------------------------------------------------------
-- Row-Level Security — WRITTEN, NOT ENABLED.
--
-- These policies assume an authenticated staff user (auth.uid() is not
-- null) and are ready to flip on once a sign-in screen exists. Until then,
-- RLS stays disabled on all three tables and anon/authenticated roles get
-- blanket grants below, so the app is usable without building
-- authentication first. See the README's "Note on permissions".
-- ---------------------------------------------------------------------------
alter table inventory_items   enable row level security;
alter table inventory_batches enable row level security;
alter table usage_log         enable row level security;

create policy "Authenticated staff can read items"
  on inventory_items for select
  using (auth.uid() is not null);
create policy "Authenticated staff can write items"
  on inventory_items for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated staff can read batches"
  on inventory_batches for select
  using (auth.uid() is not null);
create policy "Authenticated staff can write batches"
  on inventory_batches for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated staff can read usage log"
  on usage_log for select
  using (auth.uid() is not null);
create policy "Authenticated staff can write usage log"
  on usage_log for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Disable RLS again for this no-auth submission — comment these three
-- lines out (and remove the blanket grants below) once sign-in exists.
alter table inventory_items   disable row level security;
alter table inventory_batches disable row level security;
alter table usage_log         disable row level security;

grant usage on schema public to anon, authenticated;
grant all on inventory_items, inventory_batches, usage_log to anon, authenticated;
grant execute on function record_usage(uuid, text, integer, text) to anon, authenticated;
