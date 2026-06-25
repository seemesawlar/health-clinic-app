import { Package, AlertTriangle, PackageX, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import MetricCard from "../components/MetricCard";
import StatusPills from "../components/StatusPills";
import { getItemStats, fmtDate, currentMonthKey } from "../lib/helpers";
import { CATEGORIES } from "../lib/constants";

export default function Dashboard({ items, usageLog }) {
  const lowStockItems = items.filter((i) => getItemStats(i).low);
  const expiredItems = items.filter((i) => getItemStats(i).expiredQty > 0);
  const nearExpiryItems = items.filter((i) => getItemStats(i).nearExpiryQty > 0);

  const monthKey = currentMonthKey();
  const usageThisMonthQty = usageLog
    .filter((u) => u.used_at.slice(0, 7) === monthKey)
    .reduce((s, u) => s + u.quantity, 0);

  const recentUsage = usageLog.slice(0, 8);
  const totalUnits = items.reduce((s, i) => s + getItemStats(i).totalQty, 0);

  const categoryBreakdown = CATEGORIES.map((cat) => {
    const inCat = items.filter((i) => i.category === cat);
    return {
      category: cat,
      count: inCat.length,
      units: inCat.reduce((s, i) => s + getItemStats(i).totalQty, 0),
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const needsAttention = [
    ...expiredItems,
    ...lowStockItems.filter((i) => getItemStats(i).expiredQty === 0),
    ...nearExpiryItems.filter((i) => getItemStats(i).expiredQty === 0 && !getItemStats(i).low),
  ].slice(0, 6);

  const sixMonthTrend = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - m);
    const key = d.toISOString().slice(0, 7);
    const total = usageLog.filter((u) => u.used_at.slice(0, 7) === key).reduce((s, u) => s + u.quantity, 0);
    sixMonthTrend.push({ month: d.toLocaleDateString("en-US", { month: "short" }), qty: total });
  }

   return (
    <>
      <div className="metric-grid">
        <MetricCard
          label="Clinic Items in inventory"
          value={items.length}
          sub={`${totalUnits.toLocaleString()} total units across ${CATEGORIES.length} categories`}
          tone="teal"
          icon={<Package size={15} />}
        />
        <MetricCard label="Low stock" value={lowStockItems.length} sub="At or below reorder point" tone="amber" icon={<AlertTriangle size={15} />} />
        <MetricCard label="Expired items" value={expiredItems.length} sub="Remove from circulation" tone="red" icon={<PackageX size={15} />} />
        <MetricCard label="Usage this month" value={usageThisMonthQty} sub="Units logged" tone="green" icon={<TrendingUp size={15} />} />
      </div>

      <div className="panel-grid-3">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Products by category</span>
          </div>
          <table className="tbl tbl-mini">
            <thead>
              <tr>
                <th>Category</th>
                <th>Qty</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((c) => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td className="mono">{c.count}</td>
                  <td className="mono">{c.units.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td>Total</td>
                <td className="mono">{items.length}</td>
                <td className="mono">{totalUnits.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Needs attention</span>
          </div>
          {needsAttention.length === 0 ? (
            <div className="empty-state">Everything is in good shape. No low stock or expired items.</div>
          ) : (
            <table className="tbl tbl-mini">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {needsAttention.map((it) => {
                  const locs = [...new Set((it.batches || []).map((b) => b.location))];
                  return (
                    <tr key={it.id}>
                      <td>{it.name}</td>
                      <td>
                        {locs.length === 0 ? (
                          <span style={{ color: "var(--ink-soft)" }}>No stock</span>
                        ) : (
                          <span className="loc-tag">
                            {locs[0]}
                            {locs.length > 1 && ` +${locs.length - 1}`}
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusPills item={it} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent usage</span>
          </div>
          {recentUsage.length === 0 && <div className="empty-state">No usage logged yet.</div>}
          {recentUsage.map((u) => (
            <div className="feed-item" key={u.id}>
              <div>
                <div>{u.item_name}</div>
                <div className="feed-team">{u.team}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono">-{u.quantity}</div>
                <div className="feed-team">{fmtDate(u.used_at.slice(0, 10))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">6-month usage trend</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={sixMonthTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#E2DDD0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5C6B69" }} axisLine={{ stroke: "#E2DDD0" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#5C6B69" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2DDD0" }} />
            <Line type="monotone" dataKey="qty" name="Units used" stroke="#1F6F66" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
