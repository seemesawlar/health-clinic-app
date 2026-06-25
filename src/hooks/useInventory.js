import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    // Embed each item's batches in one query — Supabase follows the
    // foreign key on inventory_batches.item_id automatically. Aliased
    // to `batches` so the rest of the app doesn't need to know the
    // underlying table name.
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*, batches:inventory_batches(*)")
      .order("name", { ascending: true });
    if (error) setError(error.message);
    else {
      setItems(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    // Real-time inventory updates: any staff member adding, editing,
    // restocking, or using a supply is reflected for everyone else
    // immediately, which is what prevents duplicate ordering between
    // teams. Both tables feed the same reload since items are always
    // rendered together with their batches.
    const channel = supabase
      .channel("inventory-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_batches" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // Creates a new product. If an initial quantity is given, also
  // creates its first batch.
  async function addItem(item) {
    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        name: item.name,
        category: item.category,
        unit: item.unit,
        reorder_point: Number(item.reorder),
        location: item.location || null,
        supplier: item.supplier || null,
        item_code: item.itemCode || null,
        unit_cost: item.unitCost === "" ? null : Number(item.unitCost),
        barcode: item.barcode || null,
        needs_expiry_tracking: !!item.needsExpiryTracking,
        bin_details: item.binDetails || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const qty = Number(item.qty);
    if (qty > 0) {
      const { error: batchError } = await supabase.from("inventory_batches").insert({
        item_id: data.id,
        quantity: qty,
        expiry_date: item.expiry || null,
        location: item.batchLocation,
      });
      if (batchError) throw new Error(batchError.message);
    }
    await load();
  }

  // Updates only the product definition fields — quantity, expiry, and
  // physical location are managed per-batch via addBatch/deleteBatch
  // below, not here.
  async function updateItem(id, item) {
    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        name: item.name,
        category: item.category,
        unit: item.unit,
        reorder_point: Number(item.reorder),
        location: item.location || null,
        supplier: item.supplier || null,
        item_code: item.itemCode || null,
        unit_cost: item.unitCost === "" ? null : Number(item.unitCost),
        barcode: item.barcode || null,
        needs_expiry_tracking: !!item.needsExpiryTracking,
        bin_details: item.binDetails || null,
      })
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    assertAffected(data, "update this item");
    await load();
  }

  async function deleteItem(id) {
    // inventory_batches has ON DELETE CASCADE, so its batches go too.
    const { data, error } = await supabase.from("inventory_items").delete().eq("id", id).select();
    if (error) throw new Error(error.message);
    assertAffected(data, "delete this item");
    await load();
  }

  // Restock: always creates a new batch rather than touching an
  // existing one, so an older batch's earlier expiry date is never
  // silently overwritten by a new delivery. location is required since
  // the same product can have stock sitting in more than one physical
  // place at once (e.g. a clinic room AND storage).
  async function addBatch(itemId, quantity, expiryDate, location) {
    const qty = Number(quantity);
    if (!qty || qty <= 0) throw new Error("Enter a quantity greater than zero.");
    if (!location || !location.trim()) throw new Error("Enter where this batch is physically located.");
    const { error } = await supabase.from("inventory_batches").insert({
      item_id: itemId,
      quantity: qty,
      expiry_date: expiryDate || null,
      location: location.trim(),
    });
    if (error) throw new Error(error.message);
    await load();
  }

  // Correcting a batch entered wrong (quantity, expiry, or location) —
  // distinct from addBatch, which always creates a new row for a real
  // restock instead of editing an existing one.
  async function updateBatch(batchId, updates) {
    const payload = {};
    if (updates.quantity !== undefined) {
      const qty = Number(updates.quantity);
      if (!qty || qty <= 0) throw new Error("Enter a quantity greater than zero.");
      payload.quantity = qty;
    }
    if (updates.expiryDate !== undefined) payload.expiry_date = updates.expiryDate || null;
    if (updates.location !== undefined) {
      if (!updates.location.trim()) throw new Error("Enter where this batch is physically located.");
      payload.location = updates.location.trim();
    }
    const { data, error } = await supabase.from("inventory_batches").update(payload).eq("id", batchId).select();
    if (error) throw new Error(error.message);
    assertAffected(data, "update this batch");
    await load();
  }

  // For correcting data-entry mistakes or manually discarding a
  // specific expired batch without it going through usage_log (since
  // throwing out expired stock isn't "usage" by a team).
  async function deleteBatch(batchId) {
    const { data, error } = await supabase.from("inventory_batches").delete().eq("id", batchId).select();
    if (error) throw new Error(error.message);
    assertAffected(data, "delete this batch");
    await load();
  }

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    addBatch,
    updateBatch,
    deleteBatch,
    refresh: load,
  };
}

// Under Supabase's row-level security, UPDATE/DELETE that get blocked
// don't throw an error — the row is just filtered out by the policy and
// 0 rows are affected, which silently looks like "nothing happened."
// This turns that into a clear, actionable error instead.
function assertAffected(data, actionDescription) {
  if (!data || data.length === 0) {
    throw new Error(
      `Couldn't ${actionDescription} — likely a Supabase permissions (RLS) issue rather than a bug. ` +
        `If you haven't set up sign-in yet, see the dev-only RLS note in README.md.`
    );
  }
}
