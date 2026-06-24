export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

export function getFlags(item) {
  const dleft = daysUntil(item.expiry_date);
  return {
    expired: item.expiry_date != null && dleft < 0,
    nearExpiry: item.expiry_date != null && dleft >= 0 && dleft <= 30,
    low: item.quantity <= item.reorder_point,
    daysLeft: dleft,
  };
}

export function fmtDate(s) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthLabel(yyyyMm) {
  const d = new Date(yyyyMm + "-01T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}
