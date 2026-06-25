import { useMemo, useState } from "react";
import { Printer, ClipboardList, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "../components/MetricCard";
import { getItemStats, daysUntil, fmtDate, monthLabel, currentMonthKey } from "../lib/helpers";
import { TEAMS } from "../lib/constants";

export default function Reports({ items, usageLog }) {
  const monthsAvailable = useMemo(() => {
    const set = new Set(usageLog.map((u) => u.used_at.slice(0, 7)));
    set.add(currentMonthKey());
    return Array.from(set).sort().reverse();
  }, [usageLog]);

  const [reportMonth, setReportMonth] = useState(monthsAvailable[0]);

  const monthEntries = usageLog.filter((u) => u.used_at.slice(0, 7) === reportMonth);
  const lowStockItems = items.filter((i) => getItemStats(i).low);

  // Per-batch, not per-item: a product can have one expired batch and
  // one healthy batch at once, and "what to physically discard" is a
  // batch-level question, not a product-level one.
  const expiredBatches = useMemo(() => {
    const rows = [];
    items.forEach((it) => {
      (it.batches || []).forEach((b) => {
        if (b.quantity > 0 && b.expiry_date && daysUntil(b.expiry_date) < 0) {
          rows.push({
            batchId: b.id,
            itemName: it.name,
            location: b.location,
            unit: it.unit,
            quantity: b.quantity,
            expiryDate: b.expiry_date,
            daysExpired: Math.abs(daysUntil(b.expiry_date)),
          });
        }
      });
    });
    return rows.sort((a, b) => b.daysExpired - a.daysExpired);
  }, [items]);

  const usageByTeam = TEAMS.map((team) => ({
    team,
    qty: monthEntries.filter((u) => u.team === team).reduce((s, u) => s + u.quantity, 0),
  }));

  const usageByItem = useMemo(() => {
    const map = {};
    monthEntries.forEach((u) => {
      map[u.item_name] = (map[u.item_name] || 0) + u.quantity;
    });
    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [monthEntries]);

  return (
    <>
      <div className="toolbar">
        <select className="select" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
          {monthsAvailable.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <button className="btn" onClick={() => window.print()}>
          <Printer size={14} />
          Print report
        </button>
      </div>

      <div className="metric-grid">
        <MetricCard label="Usage events" value={monthEntries.length} sub={monthLabel(reportMonth)} tone="teal" icon={<ClipboardList size={15} />} />
        <MetricCard label="Units consumed" value={monthEntries.reduce((s, u) => s + u.quantity, 0)} tone="green" icon={<TrendingUp size={15} />} />
        <MetricCard label="Below reorder point" value={lowStockItems.length} tone="amber" icon={<AlertTriangle size={15} />} />
        <MetricCard label="Expired batches" value={expiredBatches.length} sub="Right now, across all products" tone="red" icon={<ShieldAlert size={15} />} />
      </div>

      <div className="panel-grid-2">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Usage by team</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usageByTeam} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#E2DDD0" vertical={false} />
              <XAxis dataKey="team" tick={{ fontSize: 11, fill: "#5C6B69" }} axisLine={{ stroke: "#E2DDD0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5C6B69" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2DDD0" }} />
              <Bar dataKey="qty" name="Units used" fill="#1F6F66" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Most consumed items</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usageByItem} layout="vertical" margin={{ top: 5, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid stroke="#E2DDD0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#5C6B69" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#5C6B69" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2DDD0" }} />
              <Bar dataKey="qty" name="Units used" fill="#C97A1D" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Expired batches — what to discard</span>
        </div>
        {expiredBatches.length === 0 ? (
          <div className="empty-state">No expired stock currently in storage.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Quantity to discard</th>
                <th>Expired on</th>
                <th>Days expired</th>
              </tr>
            </thead>
            <tbody>
              {expiredBatches.map((b) => (
                <tr key={b.batchId}>
                  <td>{b.itemName}</td>
                  <td>
                    <span className="loc-tag">{b.location}</span>
                  </td>
                  <td className="mono">
                    {b.quantity} {b.unit}
                  </td>
                  <td className="mono">{fmtDate(b.expiryDate)}</td>
                  <td className="mono" style={{ color: "var(--red)", fontWeight: 600 }}>
                    {b.daysExpired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
