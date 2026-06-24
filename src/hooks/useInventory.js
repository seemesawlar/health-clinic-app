import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
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
    // or using a supply is reflected for everyone else immediately,
    // which is what prevents duplicate ordering between teams.
    const channel = supabase
      .channel("inventory-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  async function addItem(item) {
    const { error } = await supabase.from("inventory_items").insert({
      name: item.name,
      category: item.category,
      quantity: Number(item.qty),
      unit: item.unit,
      reorder_point: Number(item.reorder),
      expiry_date: item.expiry || null,
      location: item.location,
    });
    if (error) throw new Error(error.message);
  }

  async function updateItem(id, item) {
    const { error } = await supabase
      .from("inventory_items")
      .update({
        name: item.name,
        category: item.category,
        quantity: Number(item.qty),
        unit: item.unit,
        reorder_point: Number(item.reorder),
        expiry_date: item.expiry || null,
        location: item.location,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function deleteItem(id) {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  return { items, loading, error, addItem, updateItem, deleteItem, refresh: load };
}
