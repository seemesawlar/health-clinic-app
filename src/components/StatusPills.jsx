import { AlertTriangle, Clock3, CheckCircle2, PackageX } from "lucide-react";
import { getFlags } from "../lib/helpers";

function Pill({ tone, icon, children }) {
  return (
    <span className={`pill pill-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export default function StatusPills({ item }) {
  const f = getFlags(item);

  if (f.expired) {
    return (
      <Pill tone="red" icon={<PackageX size={12} />}>
        Expired {Math.abs(f.daysLeft)}d ago
      </Pill>
    );
  }

  return (
    <div className="flex-pills">
      {f.low && (
        <Pill tone="amber" icon={<AlertTriangle size={12} />}>
          Low stock
        </Pill>
      )}
      {f.nearExpiry && (
        <Pill tone="amber" icon={<Clock3 size={12} />}>
          Expires in {f.daysLeft}d
        </Pill>
      )}
      {!f.low && !f.nearExpiry && (
        <Pill tone="green" icon={<CheckCircle2 size={12} />}>
          Healthy
        </Pill>
      )}
    </div>
  );
}
