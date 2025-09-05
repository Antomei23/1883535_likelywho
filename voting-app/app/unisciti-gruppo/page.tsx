"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinGroupByCode } from "@/lib/api";

function getCurrentUserIdLocal(): string {
  if (typeof window === "undefined") return "u7";
  return localStorage.getItem("userId") || "u7";
}
function getCurrentUserNameLocal(): string | undefined {
  if (typeof window === "undefined") return "Riccardo";
  return localStorage.getItem("username") || localStorage.getItem("name") || "Player";
}

const UniscitiGruppoPage = () => {
  const router = useRouter();
  const [codice, setCodice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await joinGroupByCode(codice.trim(), getCurrentUserIdLocal(), getCurrentUserNameLocal());
      if ("ok" in res && res.ok) {
        // opzionale: potresti passare groupId in query alla success page
        router.push("/unisciti-gruppo/success");
      } else {
        setError((res as any).error ?? "Unable to join group");
      }
    } catch (err: any) {
      setError(err?.message ?? "Unable to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Join a new group</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Insert invitation code:</label>
          <input
            type="text"
            value={codice}
            onChange={(e) => setCodice(e.target.value)}
            required
            style={styles.input}
            placeholder="e.g. 9K4XQZ"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "20px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  error: { color: "#c0392b", fontSize: 13, margin: 0 },
  button: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default UniscitiGruppoPage;
