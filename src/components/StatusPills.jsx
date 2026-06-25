import { AlertTriangle, Clock3, CheckCircle2, PackageX } from "lucide-react";
import { getItemStats } from "../lib/helpers";

function Pill({ tone, icon, children }) {
  return (
    <span className={`pill pill-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export default function StatusPills({ item }) {
  const s = getItemStats(item);
  const pills = [];

  // A product can have one expired batch and one healthy batch at the
  // same time, so these are independent, additive pills rather than a
  // single status — e.g. "2 expired" AND "Low stock" can both show.
  if (s.expiredQty > 0) {
    pills.push(
      <Pill key="expired" tone="red" icon={<PackageX size={12} />}>
        {s.expiredQty} {item.unit} expired
      </Pill>
    );
  }
  if (s.low) {
    pills.push(
      <Pill key="low" tone="amber" icon={<AlertTriangle size={12} />}>
        Low stock
      </Pill>
    );
  }
  if (s.nearExpiryQty > 0) {
    pills.push(
      <Pill key="near" tone="amber" icon={<Clock3 size={12} />}>
        {s.nearExpiryQty} {item.unit} expiring soon
      </Pill>
    );
  }
  if (pills.length === 0) {
    pills.push(
      <Pill key="healthy" tone="green" icon={<CheckCircle2 size={12} />}>
        Healthy
      </Pill>
    );
  }

  return <div className="flex-pills">{pills}</div>;
}
