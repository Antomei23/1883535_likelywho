"use client";

import React, { useMemo, useState, use as usePromise } from "react";
import Link from "next/link";
import { colors, card, h2 } from "@/app/components/ui";

type Row = { name: string; pct: number };

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params); // ✅
  const [filter, setFilter] = useState<"week" | "month" | "topic" | "all">("all");

  const rows: Row[] = useMemo(
    () => [
      { name: "Sara", pct: 40 },
      { name: "Mattia", pct: 15 },
      { name: "Mario", pct: 9 },
      { name: "Antonio", pct: 6 },
      { name: "Simone", pct: 5 },
      { name: "Lucia", pct: 3 },
      { name: "Andrea", pct: 1 },
      { name: "Sandra", pct: 1 },
    ],
    []
  );

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Link href={`/gruppo/${id}`} style={{ textDecoration: "none", color: "#333" }}>← Back</Link>
        <div style={{ fontSize: 24 }}>🏆</div>
      </header>

      <div style={{ ...card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={h2}>Leaderboard</h2>
          <div>
            <label style={{ marginRight: 8, fontSize: 14 }}>Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
            >
              <option value="week">by week</option>
              <option value="month">by month</option>
              <option value="topic">by topic</option>
              <option value="all">not selected</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, border: "1px solid #eee", borderRadius: 10, background: "#fff" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f3f3", display: "grid", placeItems: "center" }}>🙂</div>
              <div style={{ flex: 1 }}>{r.name}</div>
              <div style={{ minWidth: 56, textAlign: "right", padding: "6px 10px", borderRadius: 10, background: "#ffe9f6", border: "1px solid #ffc7e8", fontWeight: 600 }}>
                {r.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
