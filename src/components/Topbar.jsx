import { NAV } from "./Sidebar";

export default function Topbar({ tab }) {
  const today = new Date();
  return (
    <div className="hco-topbar">
      <div className="hco-title">{NAV.find((n) => n.id === tab)?.label}</div>
      <div className="hco-date mono">
        {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </div>
    </div>
  );
}
