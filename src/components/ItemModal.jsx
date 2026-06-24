import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "../lib/constants";

export default function ItemModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    name: item.name || "",
    category: item.category || CATEGORIES[0],
    qty: item.quantity ?? 0,
    unit: item.unit || "each",
    reorder: item.reorder_point ?? 5,
    location: item.location || "",
    expiry: item.expiry_date || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="panel-title">{item.id ? "Edit item" : "Add inventory item"}</span>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {error && <div className="alert-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Item name</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-row">
              <label>Category</label>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Unit</label>
              <input
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="box, each, bottle..."
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-row">
              <label>Quantity on hand</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Reorder point</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.reorder}
                onChange={(e) => setForm({ ...form, reorder: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-row">
              <label>Storage location (shelf-bin)</label>
              <input
                className="input"
                required
                placeholder="e.g. A-1"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Expiry date (optional)</label>
              <input
                className="input"
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
            {saving ? "Saving..." : item.id ? "Save changes" : "Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}
