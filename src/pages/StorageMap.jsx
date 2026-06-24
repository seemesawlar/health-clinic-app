import { useMemo, useState } from "react";
import { getFlags } from "../lib/helpers";
import StatusPills from "../components/StatusPills";

function binStatus(binItems) {
  if (binItems.some((i) => getFlags(i).expired)) return "red";
  if (binItems.some((i) => getFlags(i).low || getFlags(i).nearExpiry)) return "amber";
  return "green";
}

export default function StorageMap({ items }) {
  const [selectedBin, setSelectedBin] = useState(null);

  const bins = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      if (!map[it.location]) map[it.location] = [];
      map[it.location].push(it);
    });
    return map;
  }, [items]);

  const shelves = useMemo(() => {
    const shelfSet = Array.from(new Set(Object.keys(bins).map((l) => l.split("-")[0]))).sort();
    return shelfSet.map((s) => ({
      shelf: s,
      binIds: Array.from(new Set(Object.keys(bins).filter((l) => l.startsWith(s + "-")))).sort(),
    }));
  }, [bins]);

  return (
    <div className="panel-grid-2">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Shelves &amp; bins</span>
        </div>
        {shelves.length === 0 && <div className="empty-state">No items in storage yet.</div>}
        {shelves.map((s) => (
          <div key={s.shelf}>
            <div className="shelf-label">Shelf {s.shelf}</div>
            <div className="bin-grid">
              {s.binIds.map((binId) => {
                const binItems = bins[binId];
                const status = binStatus(binItems);
                return (
                  <div
                    key={binId}
                    className={`bin-cell ${status} ${selectedBin === binId ? "selected" : ""}`}
                    onClick={() => setSelectedBin(binId)}
                  >
                    <div className="bin-id">{binId}</div>
                    <div className="bin-count">
                      {binItems.length} item{binItems.length !== 1 ? "s" : ""}
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
            Low stock or near expiry
          </span>
          <span>
            <span className="legend-dot" style={{ background: "#B23A32" }} />
            Contains expired item
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">{selectedBin ? `Bin ${selectedBin}` : "Select a bin"}</span>
        </div>
        {!selectedBin && <div className="empty-state">Click a bin on the left to see what's stored there.</div>}
        {selectedBin &&
          bins[selectedBin]?.map((it) => (
            <div key={it.id} className="feed-item" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>{it.name}</span>
                <span className="mono">
                  {it.quantity} {it.unit}
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusPills item={it} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
