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
  }

  // Updates only the product definition fields — quantity, expiry, and
  // physical location are managed per-batch via addBatch/deleteBatch
  // below, not here.
  async function updateItem(id, item) {
    const { error } = await supabase
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
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function deleteItem(id) {
    // inventory_batches has ON DELETE CASCADE, so its batches go too.
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
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
  }

  // For correcting data-entry mistakes or manually discarding a
  // specific expired batch without it going through usage_log (since
  // throwing out expired stock isn't "usage" by a team).
  async function deleteBatch(batchId) {
    const { error } = await supabase.from("inventory_batches").delete().eq("id", batchId);
    if (error) throw new Error(error.message);
  }

  return { items, loading, error, addItem, updateItem, deleteItem, addBatch, deleteBatch, refresh: load };
}
