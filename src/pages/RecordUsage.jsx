import { useState } from "react";
import { ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TEAMS } from "../lib/constants";
import { fmtDate } from "../lib/helpers";

export default function RecordUsage({ items, usageLog, recordUsage }) {
  const [itemId, setItemId] = useState(items[0]?.id || "");
  const [team, setTeam] = useState(TEAMS[0]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const item = items.find((i) => i.id === itemId);
    const n = Number(qty);
    if (!item) return;
    if (!n || n <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (n > item.quantity) {
      setError(`Only ${item.quantity} ${item.unit}(s) of ${item.name} in stock. Cannot log ${n}.`);
      return;
    }
    setSubmitting(true);
    try {
      await recordUsage(item.id, team, n, note);
      setSuccess(`Logged ${n} ${item.unit}(s) of ${item.name} for ${team}.`);
      setQty(1);
      setNote("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel-grid-2">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Log supply usage</span>
        </div>
        {error && (
          <div className="alert-banner">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}
        {success && (
          <div className="success-banner">
            <CheckCircle2 size={15} />
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Item</label>
            <select
              className="select"
              value={itemId}
              onChange={(e) => {
                setItemId(e.target.value);
                setError("");
                setSuccess("");
              }}
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} — {it.quantity} {it.unit} in stock
                </option>
              ))}
            </select>
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Team</label>
              <select className="select" value={team} onChange={(e) => setTeam(e.target.value)}>
                {TEAMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Quantity used</label>
              <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Note (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. restocking exam room 2"
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          >
            <ClipboardList size={15} />
            {submitting ? "Recording..." : "Record usage"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Usage history</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Team</th>
              <th>Qty</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {usageLog.slice(0, 12).map((u) => (
              <tr key={u.id}>
                <td>{u.item_name}</td>
                <td style={{ color: "var(--ink-soft)" }}>{u.team}</td>
                <td className="mono">{u.quantity}</td>
                <td className="mono">{fmtDate(u.used_at.slice(0, 10))}</td>
              </tr>
            ))}
            {usageLog.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">No usage logged yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
