import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Boxes } from "lucide-react";
import StatusPills from "../components/StatusPills";
import ItemModal from "../components/ItemModal";
import BatchesModal from "../components/BatchesModal";
import { getItemStats, fmtDate, getKnownLocations, getKnownCategories, getKnownFieldValues } from "../lib/helpers";
import { CATEGORIES } from "../lib/constants";

export default function Inventory({ items, addItem, updateItem, deleteItem, addBatch, updateBatch, deleteBatch }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalItem, setModalItem] = useState(null);
  const [batchesItemId, setBatchesItemId] = useState(null);

  const knownLocations = getKnownLocations(items);
  const knownCategories = getKnownCategories(items, CATEGORIES);
  const knownSuppliers = getKnownFieldValues(items, "supplier");
  const knownBinDetails = getKnownFieldValues(items, "bin_details");

  const filtered = items.filter((i) => {
    if (catFilter !== "All" && i.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const locations = (i.batches || []).map((b) => b.location.toLowerCase());
      const haystack = [i.name, i.location || "", i.supplier || "", i.item_code || "", ...locations].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    const s = getItemStats(i);
    if (statusFilter === "Low stock" && !s.low) return false;
    if (statusFilter === "Expired" && s.expiredQty === 0) return false;
    if (statusFilter === "Near expiry" && s.nearExpiryQty === 0) return false;
    if (statusFilter === "Healthy" && (s.low || s.expiredQty > 0 || s.nearExpiryQty > 0)) return false;
    return true;
  });

  // batchesItem is looked up fresh from `items` on every render so the
  // modal always reflects the latest batches after a realtime update.
  const batchesItem = batchesItemId ? items.find((i) => i.id === batchesItemId) : null;

  async function handleSave(form) {
    if (modalItem.id) {
      await updateItem(modalItem.id, form);
    } else {
      await addItem(form);
    }
    setModalItem(null);
  }

  async function handleDelete(id) {
    if (window.confirm("Remove this product and all its batches from inventory? This cannot be undone.")) {
      await deleteItem(id);
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} />
          <input
            className="input"
            placeholder="Search by name, code, location, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option>All</option>
          {knownCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Healthy", "Low stock", "Near expiry", "Expired"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => setModalItem({})}>
          <Plus size={15} />
          Add item
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Location</th>
              <th>Supplier</th>
              <th>Soonest expiry</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => {
              const s = getItemStats(it);
              const locations = [...new Set((it.batches || []).map((b) => b.location))];
              return (
                <tr key={it.id}>
                  <td style={{ fontWeight: 500 }}>
                    {it.name}
                    {it.item_code && <div style={{ fontWeight: 400, fontSize: 11, color: "var(--ink-soft)" }}>{it.item_code}</div>}
                  </td>
                  <td style={{ color: "var(--ink-soft)" }}>{it.category}</td>
                  <td className="mono">
                    {s.totalQty} {it.unit}
                  </td>
                  <td>
                    {locations.length === 0 ? (
                      <span style={{ color: "var(--ink-soft)" }}>No stock</span>
                    ) : (
                      <div className="flex-pills">
                        {locations.map((loc) => (
                          <span className="loc-tag" key={loc}>
                            {loc}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ color: "var(--ink-soft)" }}>{it.supplier || "—"}</td>
                  <td className="mono">
                    {fmtDate(s.earliestExpiry)}
                    {s.batchCount > 1 && (
                      <span style={{ color: "var(--ink-soft)", fontSize: 11 }}> ({s.batchCount} batches)</span>
                    )}
                  </td>
                  <td>
                    <StatusPills item={it} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-icon btn-ghost" onClick={() => setBatchesItemId(it.id)} aria-label="Batches" title="View / restock batches">
                        <Boxes size={14} />
                      </button>
                      <button className="btn btn-icon btn-ghost" onClick={() => setModalItem(it)} aria-label="Edit" title="Edit product details">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-icon btn-danger-ghost" onClick={() => handleDelete(it.id)} aria-label="Delete" title="Delete product">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">No items match your filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalItem && (
        <ItemModal
          item={modalItem}
          knownLocations={knownLocations}
          knownCategories={knownCategories}
          knownSuppliers={knownSuppliers}
          knownBinDetails={knownBinDetails}
          onSave={handleSave}
          onClose={() => setModalItem(null)}
        />
      )}

      {batchesItem && (
        <BatchesModal
          item={batchesItem}
          knownLocations={knownLocations}
          onAddBatch={addBatch}
          onUpdateBatch={updateBatch}
          onDeleteBatch={deleteBatch}
          onClose={() => setBatchesItemId(null)}
        />
      )}
    </>
  );
}
