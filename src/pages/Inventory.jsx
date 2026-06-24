import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import StatusPills from "../components/StatusPills";
import ItemModal from "../components/ItemModal";
import { getFlags, fmtDate } from "../lib/helpers";
import { CATEGORIES } from "../lib/constants";

export default function Inventory({ items, addItem, updateItem, deleteItem }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalItem, setModalItem] = useState(null);

  const filtered = items.filter((i) => {
    if (catFilter !== "All" && i.category !== catFilter) return false;
    if (
      search &&
      !i.name.toLowerCase().includes(search.toLowerCase()) &&
      !i.location.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    const f = getFlags(i);
    if (statusFilter === "Low stock" && !f.low) return false;
    if (statusFilter === "Expired" && !f.expired) return false;
    if (statusFilter === "Near expiry" && !f.nearExpiry) return false;
    if (statusFilter === "Healthy" && (f.low || f.expired || f.nearExpiry)) return false;
    return true;
  });

  async function handleSave(form) {
    if (modalItem.id) {
      await updateItem(modalItem.id, form);
    } else {
      await addItem(form);
    }
    setModalItem(null);
  }

  async function handleDelete(id) {
    if (window.confirm("Remove this item from inventory? This cannot be undone.")) {
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
            placeholder="Search by name or bin location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((c) => (
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
              <th>Expires</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id}>
                <td style={{ fontWeight: 500 }}>{it.name}</td>
                <td style={{ color: "var(--ink-soft)" }}>{it.category}</td>
                <td className="mono">
                  {it.quantity} {it.unit}
                </td>
                <td>
                  <span className="loc-tag">{it.location}</span>
                </td>
                <td className="mono">{fmtDate(it.expiry_date)}</td>
                <td>
                  <StatusPills item={it} />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-icon btn-ghost" onClick={() => setModalItem(it)} aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-icon btn-danger-ghost" onClick={() => handleDelete(it.id)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">No items match your filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalItem && <ItemModal item={modalItem} onSave={handleSave} onClose={() => setModalItem(null)} />}
    </>
  );
}
