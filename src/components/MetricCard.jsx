export default function MetricCard({ label, value, sub, tone, icon }) {
  return (
    <div className={`metric-card metric-${tone || "neutral"}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
