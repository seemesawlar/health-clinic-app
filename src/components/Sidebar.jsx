import { LayoutDashboard, Package, MapPin, ClipboardList, BarChart3, Boxes } from "lucide-react";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={18} /> },
  { id: "map", label: "Storage map", icon: <MapPin size={18} /> },
  { id: "usage", label: "Record usage", icon: <ClipboardList size={18} /> },
  { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
];

export default function Sidebar({ tab, setTab }) {
  return (
    <div className="hco-sidebar">
      <div className="hco-brand">
        <Boxes size={22} />
        <div>
          <div className="hco-brand-name">Storage Organizer</div>
          <div className="hco-brand-sub">Riverbend Health Clinic</div>
        </div>
      </div>
      {NAV.map((n) => (
        <button key={n.id} className={`navbtn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
          {n.icon}
          {n.label}
        </button>
      ))}
      <div className="navfoot">
        Shared inventory across Nurse Practitioners, Walk-In Clinic &amp; Health Shelter teams.
      </div>
    </div>
  );
}
