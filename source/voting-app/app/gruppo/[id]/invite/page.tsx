"use client";

import React, { use as usePromise, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { getGroup } from "@/lib/api";

type Params = { id: string };

export default function InvitePlayersPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);

  const [joinCode, setJoinCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const g = await getGroup(id);
        if (!live) return;
        setJoinCode(g.joinCode ?? "");
      } catch (e) {
        console.error(e);
        if (live) setError("Impossibile recuperare il codice del gruppo.");
      }
    })();
    return () => { live = false; };
  }, [id]);

  const joinPageUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL("/unisciti-gruppo", window.location.origin);
    if (joinCode) u.searchParams.set("code", joinCode);   // precompila il codice nella pagina
    return u.toString();
  }, [joinCode]);

  const copyCode = useCallback(async () => {
    try { await navigator.clipboard.writeText(joinCode); alert("Codice copiato!"); }
    catch { alert("Non sono riuscito a copiare il codice 😅"); }
  }, [joinCode]);

  const copyLink = useCallback(async () => {
    try { await navigator.clipboard.writeText(joinPageUrl); alert("Link copiato!"); }
    catch { alert("Non sono riuscito a copiare il link 😅"); }
  }, [joinPageUrl]);

  const share = useCallback(async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: "Unisciti al mio gruppo",
          text: `Usa questo codice per entrare: ${joinCode}`,
          url: joinPageUrl,
        });
      } else {
        await copyLink();
      }
    } catch { /* annullato dall'utente */ }
  }, [joinCode, joinPageUrl, copyLink]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href={`/gruppo/${id}`} style={styles.menuButton}>←</Link>
      <div />
        <Link href={`/profile`} style={styles.userButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </Link>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Aggiungi giocatori</h2>

        <div style={styles.card}>
          <div style={styles.label}>Codice del gruppo</div>
          <div style={styles.code}>{joinCode || "— — — — — —"}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button style={styles.btnPrimary} onClick={copyCode} disabled={!joinCode}>📋 Copia codice</button>
            <button style={styles.btnSecondary} onClick={share} disabled={!joinCode}>Condividi</button>
            {/* <Link style={styles.btnSecondary} href={joinPageUrl || "/unisciti-gruppo"}>Apri “Unisciti al gruppo”</Link> */}
          </div>
          {error && <div style={{ marginTop: 10, color: "#b00020" }}>{error}</div>}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* <Link href={`/gruppo/${id}`} style={styles.btnSecondary}>Fine</Link> */}
          <Link href={`/gruppo/${id}/stats`} style={styles.btnSecondary}>Vedi statistiche</Link>
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
  content: { padding: 24, maxWidth: 480, margin: "0 auto", display: "grid", gap: 14 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)", textAlign: "center" },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: .4, color: "#6b7280" },
  code: { fontSize: 30, fontWeight: 800, letterSpacing: 4, margin: "8px 0 14px" },
  btnPrimary: { backgroundColor: "#4CAF50", color: "#fff", padding: "12px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 700, border: "none", cursor: "pointer" },
  btnSecondary: { backgroundColor: "#007bff", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 700, border: "none" },
};
