"use client";

import React, { use as usePromise, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getGroupMembers, inviteMembers, Member } from "@/lib/api";

type Params = { id: string };

type Friend = { id: string; name: string };
// quick-pick locale (in futuro potrai sostituirlo con /api/users/suggestions)
const FRIENDS: Friend[] = [
  { id: "u2", name: "Sara" },
  { id: "u3", name: "Mario" },
  { id: "u4", name: "Enzo" },
  { id: "u5", name: "Luca" },
];

export default function InvitePlayersPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);

  const inviteLink = useMemo(() => `https://likelywho.app.link/invite?group=${id}`, [id]);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [emails, setEmails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const m = await getGroupMembers(id);
        if (live) setGroupMembers(m);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { live = false; };
  }, [id]);

  const toggleAdd = (f: Friend) =>
    setAddedIds((prev) => ({ ...prev, [f.id]: !prev[f.id] }));

  const handleInvite = async () => {
    try {
      setSubmitting(true);
      const payload = {
        userIds: Object.entries(addedIds).filter(([, v]) => v).map(([k]) => k),
        emails: emails.split(/[,\s;]+/).map((e) => e.trim()).filter(Boolean),
      };
      await inviteMembers(id, payload);
      alert("Inviti inviati!");
      setAddedIds({});
      setEmails("");
    } catch (e) {
      console.error(e);
      alert("Errore durante l'invio degli inviti");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href={`/gruppo/${id}`} style={styles.menuButton}>←</Link>
        <div />
        <div style={styles.userButton}>👤</div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Invite players</h2>

        {/* QR + Link di invito */}
        <div style={styles.card}>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "center" }}>
            <div style={styles.qrBox}><div style={{ opacity: .6, fontSize: 12 }}>QR Code</div></div>
            <div>
              <div style={styles.label}>Share link</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <code style={styles.linkCode}>{inviteLink}</code>
                <button style={styles.copyBtn} onClick={() => navigator.clipboard?.writeText(inviteLink)}>📋 Copy</button>
              </div>
            </div>
          </div>
        </div>

        {/* Add by quick-pick */}
        <div style={styles.card}>
          <div style={styles.label}>Quick add</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {FRIENDS.map((f) => {
              const isAdded = !!addedIds[f.id];
              const alreadyIn = groupMembers.some((m) => m.id === f.id);
              return (
                <button
                  key={f.id}
                  disabled={alreadyIn}
                  onClick={() => toggleAdd(f)}
                  style={{
                    ...styles.friendChip,
                    ...(isAdded ? styles.friendChipAdded : {}),
                    ...(alreadyIn ? styles.friendChipDisabled : {}),
                  }}
                  title={alreadyIn ? "Già nel gruppo" : undefined}
                >
                  {f.name} {alreadyIn ? "🟢" : isAdded ? "✔" : "👤"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add by email */}
        <div style={styles.card}>
          <div style={styles.label}>Invite by email</div>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            style={{ width: "100%", height: 90, marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
          />
          <button
            onClick={handleInvite}
            disabled={submitting}
            style={{ ...styles.btnPrimary, width: "100%", marginTop: 10, opacity: submitting ? .6 : 1 }}
          >
            {submitting ? "Sending…" : "Send invites"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/gruppo/${id}`} style={styles.btnSecondary}>Done</Link>
          <Link href={`/gruppo/${id}/stats`} style={styles.btnSecondary}>View stats</Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.1)" },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, color: "#333" },
  content: { padding: 24, maxWidth: 420, margin: "0 auto", display: "grid", gap: 14 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: .4, color: "#6b7280" },
  qrBox: { width: 120, height: 120, borderRadius: 12, border: "1px dashed #cbd5e1", display: "grid", placeItems: "center", background: "#f8fafc" },
  linkCode: { background: "#f3f4f6", padding: "8px 10px", borderRadius: 8, fontSize: 12 },
  copyBtn: { background: "#e5e7eb", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer" },
  friendChip: { background: "#fff7d6", border: "1px solid #f4e4a1", borderRadius: 10, padding: "8px 12px", fontWeight: 600, cursor: "pointer" },
  friendChipAdded: { background: "#dcfce7", borderColor: "#86efac" },
  friendChipDisabled: { background: "#eef2f7", borderColor: "#e5e7eb", color: "#9aa0a6", cursor: "not-allowed" },
  btnPrimary: { backgroundColor: "#4CAF50", color: "#fff", padding: "12px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 700 },
  btnSecondary: { backgroundColor: "#007bff", color: "#fff", padding: "12px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 700 },
};
