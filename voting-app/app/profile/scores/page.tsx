"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId, getUserScores, UserScores } from "@/lib/api";

export default function ScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState<UserScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getUserScores(getCurrentUserId());
      if ("ok" in res && res.ok) {
        setScores({ totalPoints: res.totalPoints, groupPoints: res.groupPoints });
      }
      setLoading(false);
    })();
  }, []);

  const total = scores?.totalPoints ?? 0;

  // donut numbers
  const pct = useMemo(() => {
    // purely visual: cap at 100, assuming 2000 as "max demo"
    const maxDemo = Math.max(1, 2000);
    return Math.min(100, Math.round((total / maxDemo) * 100));
  }, [total]);

  const radius = 60;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  if (loading) return <div style={styles.page}>Loading...</div>;

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

      <div style={styles.donutWrap}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
          <circle
            cx="80" cy="80" r={radius}
            stroke="#999" strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="700">
            {total} PX
          </text>
        </svg>
      </div>

      <div style={styles.tableBox}>
        <div style={styles.tableHeader}>
          <span>Group Name</span>
          <span>Scores</span>
        </div>
        {(scores?.groupPoints ?? []).map((r) => (
          <div key={r.groupId} style={styles.tableRow}>
            <span>{r.groupName}</span>
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
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: "32px",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#ddd",
    border: "2px solid #000",
  },
  titleRow: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-start",
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
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 700,
    marginBottom: 8,
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderTop: "1px solid #eee",
  },
  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTop: "2px solid #ddd",
    fontWeight: 800,
  },
};
