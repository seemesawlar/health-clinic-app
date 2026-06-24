import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useUsageLog() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("usage_log")
      .select("*")
      .order("used_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else {
      setLog(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("usage-log-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "usage_log" },
        load,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // Calls the record_usage() Postgres function, which decrements
  // inventory and inserts the log row in a single transaction so
  // two staff members can never both draw the last unit.
  async function recordUsage(itemId, team, quantity, note) {
    const { data, error } = await supabase.rpc("record_usage", {
      p_item_id: itemId,
      p_team: team,
      p_quantity: Number(quantity),
      p_note: note || null,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  return { log, loading, error, recordUsage, refresh: load };
}
