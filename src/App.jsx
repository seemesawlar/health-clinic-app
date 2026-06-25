import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import StorageMap from "./pages/StorageMap";
import RecordUsage from "./pages/RecordUsage";
import Reports from "./pages/Reports";
import { useInventory } from "./hooks/useInventory";
import { useUsageLog } from "./hooks/useUsageLog";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const { items, loading: itemsLoading, error: itemsError, addItem, updateItem, deleteItem, addBatch, deleteBatch } = useInventory();
  const { log, loading: logLoading, error: logError, recordUsage } = useUsageLog();

  const loading = itemsLoading || logLoading;
  const connectionError = itemsError || logError;

  return (
    <div className="hco-root">
      <Sidebar tab={tab} setTab={setTab} />
      <div className="hco-main">
        <Topbar tab={tab} />
        <div className="hco-body">
          {connectionError && (
            <div className="alert-banner">
              Could not reach Supabase: {connectionError}. Check your .env.local values and that the schema has
              been applied.
            </div>
          )}

          {loading && !connectionError && <div className="empty-state">Loading inventory…</div>}

          {!loading && !connectionError && (
            <>
              {tab === "dashboard" && <Dashboard items={items} usageLog={log} />}
              {tab === "inventory" && (
                <Inventory
                  items={items}
                  addItem={addItem}
                  updateItem={updateItem}
                  deleteItem={deleteItem}
                  addBatch={addBatch}
                  deleteBatch={deleteBatch}
                />
              )}
              {tab === "map" && <StorageMap items={items} />}
              {tab === "usage" && <RecordUsage items={items} usageLog={log} recordUsage={recordUsage} />}
              {tab === "reports" && <Reports items={items} usageLog={log} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
