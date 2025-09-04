"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

type Row = { group: string; points: number };

export default function ScoresPage() {
  const router = useRouter();

  // mock; poi sostituire con fetch dal backend
  const data: Row[] = useMemo(
    () => [
      { group: "Group 1", points: 1000 },
      { group: "Group 2", points: 500 },
      { group: "Group 3", points: 1700 },
      { group: "Group 4", points: 100 },
    ],
    []
  );
  const total = data.reduce((s, r) => s + r.points, 0);

  // percentuale anello (usiamo un semplice SVG donut)
  const pct = Math.min(100, Math.round((total / 4000) * 100)); // 4000 = max fittizio per demo
  const radius = 60;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <button aria-label="Back" onClick={() => router.back()} style={styles.backBtn}>‹</button>
        <div style={styles.avatar} />
      </div>

      <div style={styles.titleRow}>
        <h1 style={styles.title}>My scores</h1>
        <span style={styles.trophy}>🏆</span>
      </div>

      {/* donut */}
      <div style={styles.donutWrap}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            stroke="#eee" strokeWidth={stroke} fill="none"
          />
          <circle
            cx="80" cy="80" r={radius}
            stroke="#999" strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="700">
            Tot PX
          </text>
        </svg>
      </div>

      {/* tabella */}
      <div style={styles.tableBox}>
        <div style={styles.tableHeader}>
          <span>Group Name</span>
          <span>Scores</span>
        </div>
        {data.map((r) => (
          <div key={r.group} style={styles.tableRow}>
            <span>{r.group}</span>
            <span>{r.points} PX</span>
          </div>
        ))}
        <div style={styles.tableFooter}>
          <span>Total</span>
          <span>{total} PX</span>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    padding: 20,
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
  topbar: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: "50%", border: "1px solid #ccc",
    background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: "32px"
  },
  avatar: {
    width: 50, height: 50, borderRadius: "50%", background: "#ddd", border: "2px solid #000",
  },
  titleRow: {
    width: "100%", maxWidth: 480,
    display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start",
    marginTop: 4,
  },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  trophy: { fontSize: 24 },
  donutWrap: { marginTop: 4 },
  tableBox: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 16,
    width: "100%",
    maxWidth: 480,
  },
  tableHeader: {
    display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 8,
  },
  tableRow: {
    display: "flex", justifyContent: "space-between",
    padding: "10px 0", borderTop: "1px solid #eee",
  },
  tableFooter: {
    display: "flex", justifyContent: "space-between",
    paddingTop: 10, borderTop: "2px solid #ddd", fontWeight: 800,
  },
};
