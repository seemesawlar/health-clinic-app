import { useMemo, useState } from "react";
import { daysUntil, fmtDate } from "../lib/helpers";
import { PackageX, Clock3 } from "lucide-react";

function entryStatus(batch) {
  const d = daysUntil(batch.expiry_date);
  if (batch.expiry_date != null && d < 0) return "red";
  if (batch.expiry_date != null && d <= 30) return "amber";
  return "green";
}

function binStatus(entries) {
  if (entries.some((e) => entryStatus(e.batch) === "red")) return "red";
  if (entries.some((e) => entryStatus(e.batch) === "amber")) return "amber";
  return "green";
}

export default function StorageMap({ items }) {
  const [selectedBin, setSelectedBin] = useState(null);

  // Flatten to one entry per (item, batch) pair, since a single product
  // can have stock sitting in several different physical locations at
  // once (e.g. a clinic room AND a storage zone).
  const entries = useMemo(() => {
    const out = [];
    items.forEach((it) => {
      (it.batches || []).forEach((b) => {
        if (b.quantity > 0) out.push({ item: it, batch: b });
      });
    });
    return out;
  }, [items]);

  const bins = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      if (!map[e.batch.location]) map[e.batch.location] = [];
      map[e.batch.location].push(e);
    });
    return map;
  }, [entries]);

  // Group bins by the team/area before the " – " separator (e.g. "NP",
  // "Walk-In"), falling back to a single "Other" group for any location
  // that doesn't follow that convention.
  const groups = useMemo(() => {
    const byGroup = {};
    Object.keys(bins).forEach((loc) => {
      const group = loc.includes(" – ") ? loc.split(" – ")[0].trim() : "Other";
      if (!byGroup[group]) byGroup[group] = [];
      byGroup[group].push(loc);
    });
    return Object.keys(byGroup)
      .sort()
      .map((group) => ({ group, binIds: byGroup[group].sort() }));
  }, [bins]);

  return (
    <div className="panel-grid-2">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Storage locations</span>
        </div>
        {groups.length === 0 && <div className="empty-state">No stock in inventory yet.</div>}
        {groups.map((g) => (
          <div key={g.group}>
            <div className="shelf-label">{g.group}</div>
            <div className="bin-grid">
              {g.binIds.map((binId) => {
                const binEntries = bins[binId];
                const status = binStatus(binEntries);
                return (
                  <div
                    key={binId}
                    className={`bin-cell ${status} ${selectedBin === binId ? "selected" : ""}`}
                    onClick={() => setSelectedBin(binId)}
                  >
                    <div className="bin-id">{binId.includes(" – ") ? binId.split(" – ")[1] : binId}</div>
                    <div className="bin-count">
                      {binEntries.length} item{binEntries.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="legend-row">
          <span>
            <span className="legend-dot" style={{ background: "#3F8F5C" }} />
            Healthy
          </span>
          <span>
            <span className="legend-dot" style={{ background: "#C97A1D" }} />
            Expiring within 30 days
          </span>
          <span>
            <span className="legend-dot" style={{ background: "#B23A32" }} />
            Contains expired stock
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">{selectedBin || "Select a location"}</span>
        </div>
        {!selectedBin && <div className="empty-state">Click a location on the left to see what's stored there.</div>}
        {selectedBin &&
          bins[selectedBin]?.map((e) => {
            const status = entryStatus(e.batch);
            return (
              <div key={e.batch.id} className="feed-item" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 500 }}>{e.item.name}</span>
                  <span className="mono">
                    {e.batch.quantity} {e.item.unit}
                  </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-soft)" }}>
                  {e.batch.expiry_date ? (
                    <>
                      Expires {fmtDate(e.batch.expiry_date)}
                      {status === "red" && <PackageX size={12} style={{ color: "var(--red)", marginLeft: 5, verticalAlign: "middle" }} />}
                      {status === "amber" && <Clock3 size={12} style={{ color: "var(--amber)", marginLeft: 5, verticalAlign: "middle" }} />}
                    </>
                  ) : (
                    "No expiry on file"
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
