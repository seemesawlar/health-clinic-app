import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "../lib/constants";

export default function ItemModal({ item, onSave, onClose }) {
  const isNew = !item.id;
  const [form, setForm] = useState({
    name: item.name || "",
    category: item.category || CATEGORIES[0],
    unit: item.unit || "each",
    reorder: item.reorder_point ?? 5,
    location: item.location || "",
    supplier: item.supplier || "",
    itemCode: item.item_code || "",
    unitCost: item.unit_cost ?? "",
    barcode: item.barcode || "",
    needsExpiryTracking: item.needs_expiry_tracking || false,
    binDetails: item.bin_details || "",
    // new-item-only: creates the first batch alongside the product
    qty: 0,
    batchLocation: "",
    expiry: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (isNew && Number(form.qty) > 0 && !form.batchLocation.trim()) {
      setError("Enter where this initial stock is physically located (e.g. \"NP – Storage\").");
      return;
    }
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
              <label>Item code / SKU (optional)</label>
              <input
                className="input"
                value={form.itemCode}
                onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                placeholder="e.g. 200-69c"
              />
            </div>
            <div className="form-row">
              <label>Unit cost (optional)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-row">
              <label>Default zone (optional)</label>
              <input
                className="input"
                placeholder="e.g. Zone B"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
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
              <label>Supplier (optional)</label>
              <input
                className="input"
                placeholder="e.g. McKesson, Medline..."
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Barcode (optional)</label>
              <input
                className="input"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <label>Bin details (optional)</label>
            <input
              className="input"
              placeholder='e.g. Medium Bin 7x12x4" • S-13397 • Blue • Max 40'
              value={form.binDetails}
              onChange={(e) => setForm({ ...form, binDetails: e.target.value })}
            />
          </div>

          <div className="form-row" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="needsExpiryTracking"
              checked={form.needsExpiryTracking}
              onChange={(e) => setForm({ ...form, needsExpiryTracking: e.target.checked })}
            />
            <label htmlFor="needsExpiryTracking" style={{ margin: 0 }}>
              This item is FIFO/expiry-sensitive (flag it even before a real expiry date is on file)
            </label>
          </div>

          {isNew && (
            <>
              <div className="form-row-2" style={{ marginTop: 8 }}>
                <div className="form-row">
                  <label>Initial quantity</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>Initial expiry date (optional)</label>
                  <input
                    className="input"
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <label>Where is this stock physically located?</label>
                <input
                  className="input"
                  placeholder="e.g. NP – Storage (Zone B)"
                  value={form.batchLocation}
                  onChange={(e) => setForm({ ...form, batchLocation: e.target.value })}
                />
              </div>
            </>
          )}

          {!isNew && (
            <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginBottom: 12 }}>
              To restock, adjust quantities, or set expiry dates, use the <strong>Batches</strong> button on this item in
              the inventory table instead — each batch has its own quantity, expiry date, and physical location.
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
            {saving ? "Saving..." : item.id ? "Save changes" : "Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}
