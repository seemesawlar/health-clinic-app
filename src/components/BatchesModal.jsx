import { useState } from "react";
import { X, Plus, Trash2, PackageX, Clock3 } from "lucide-react";
import { fmtDate, daysUntil } from "../lib/helpers";

export default function BatchesModal({ item, onAddBatch, onDeleteBatch, onClose }) {
  const [qty, setQty] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [location, setLocation] = useState(item.location || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const batches = [...(item.batches || [])].sort((a, b) => {
    if (a.location !== b.location) return a.location < b.location ? -1 : 1;
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return a.expiry_date < b.expiry_date ? -1 : 1;
  });

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onAddBatch(item.id, qty, expiry, location);
      setQty(1);
      setExpiry("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batchId) {
    if (window.confirm("Remove this batch from inventory? Use this for discarding expired stock, not for logging team usage.")) {
      try {
        await onDeleteBatch(batchId);
      } catch (err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 520 }}>
        <div className="modal-head">
          <span className="panel-title">Batches — {item.name}</span>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {error && <div className="alert-banner">{error}</div>}

        {batches.length === 0 ? (
          <div className="empty-state">No stock on hand. Add a batch below to restock.</div>
        ) : (
          <table className="tbl tbl-mini" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Quantity</th>
                <th>Expires</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const d = daysUntil(b.expiry_date);
                const expired = b.expiry_date != null && d < 0;
                const nearExpiry = b.expiry_date != null && d >= 0 && d <= 30;
                return (
                  <tr key={b.id}>
                    <td>
                      <span className="loc-tag">{b.location}</span>
                    </td>
                    <td className="mono">
                      {b.quantity} {item.unit}
                    </td>
                    <td className="mono">
                      {fmtDate(b.expiry_date)}
                      {expired && <PackageX size={12} style={{ color: "var(--red)", marginLeft: 5, verticalAlign: "middle" }} />}
                      {nearExpiry && <Clock3 size={12} style={{ color: "var(--amber)", marginLeft: 5, verticalAlign: "middle" }} />}
                    </td>
                    <td className="mono" style={{ color: "var(--ink-soft)" }}>
                      {fmtDate(b.received_at?.slice(0, 10))}
                    </td>
                    <td>
                      <button className="btn btn-icon btn-danger-ghost" onClick={() => handleDelete(b.id)} aria-label="Discard batch">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="panel-head">
          <span className="panel-title" style={{ fontSize: 13 }}>
            Add new batch (restock)
          </span>
        </div>
        <form onSubmit={handleAdd}>
          <div className="form-row-2">
            <div className="form-row">
              <label>Quantity received</label>
              <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Expiry date (optional)</label>
              <input className="input" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Physical location</label>
            <input
              className="input"
              required
              placeholder="e.g. NP – Storage (Zone B), Walk-In – Clinic Room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={15} />
            {saving ? "Adding..." : "Add batch"}
          </button>
        </form>
      </div>
    </div>
  );
}
