export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

// item is expected to have a `batches` array (from the embedded
// Supabase select: *, batches:inventory_batches(*)). Aggregates across
// all of an item's batches instead of reading a single quantity/expiry
// — a product can have several batches in stock at once, each with its
// own expiry date.
export function getItemStats(item) {
  const batches = (item.batches || []).filter((b) => b.quantity > 0);
  const totalQty = batches.reduce((s, b) => s + b.quantity, 0);

  let expiredQty = 0;
  let nearExpiryQty = 0;
  let earliestExpiry = null;
  let earliestDays = null;

  for (const b of batches) {
    if (!b.expiry_date) continue;
    const d = daysUntil(b.expiry_date);
    if (d < 0) expiredQty += b.quantity;
    else if (d <= 30) nearExpiryQty += b.quantity;
    if (earliestExpiry == null || b.expiry_date < earliestExpiry) {
      earliestExpiry = b.expiry_date;
      earliestDays = d;
    }
  }

  return {
    totalQty,
    expiredQty,
    nearExpiryQty,
    low: totalQty <= item.reorder_point,
    earliestExpiry,
    earliestDays,
    batchCount: batches.length,
  };
}

export function fmtDate(s) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthLabel(yyyyMm) {
  const d = new Date(yyyyMm + "-01T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

// Every location currently in use, across both each item's default zone
// and every batch's physical location — feeds the editable location
// dropdown so staff pick an existing spot instead of retyping it
// (and risking a typo that quietly creates a duplicate "location").
export function getKnownLocations(items) {
  const set = new Set();
  items.forEach((i) => {
    if (i.location) set.add(i.location);
    (i.batches || []).forEach((b) => {
      if (b.location) set.add(b.location);
    });
  });
  return Array.from(set).sort();
}

// CATEGORIES is the curated starting list; this appends any category
// that's already in use on real data but isn't in that list, so the
// dropdown never hides a category that's actually being used.
export function getKnownCategories(items, baseCategories) {
  const extra = new Set();
  items.forEach((i) => {
    if (i.category && !baseCategories.includes(i.category)) extra.add(i.category);
  });
  return [...baseCategories, ...Array.from(extra).sort()];
}

// Generic "distinct values already in use for this field" — used for
// supplier and bin-details suggestions, where there's no curated base
// list to start from (unlike categories).
export function getKnownFieldValues(items, field) {
  const set = new Set();
  items.forEach((i) => {
    if (i[field]) set.add(i[field]);
  });
  return Array.from(set).sort();
}
