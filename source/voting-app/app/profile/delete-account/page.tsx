"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount, getCurrentUserId } from "@/lib/api";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cancel = () => router.back();
  const remove = async () => {
    if (!confirm("Are you sure you want to permanently delete your account?")) return;
    setLoading(true);
    const res = await deleteAccount(getCurrentUserId());
    setLoading(false);
    if ("ok" in res && res.ok) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
      router.push("/register"); // or /login
    } else {
      alert((res as any).error ?? "Unable to delete account");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <button aria-label="Back" onClick={() => router.back()} style={styles.backBtn}>‹</button>
        <div style={styles.avatar} />
      </div>

      <div style={styles.card}>
        <p style={styles.text}>
          Deleting your account will permanently remove all collected data,
          scores and achievements.
        </p>

        <div style={styles.actions}>
          <button onClick={cancel} style={styles.cancelBtn} disabled={loading}>Cancel</button>
          <span style={{ opacity: 0.5 }}>|</span>
          <button onClick={remove} style={styles.removeBtn} disabled={loading}>
            {loading ? "Removing..." : "Remove Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
  card: {
    marginTop: 10,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 18,
    width: "100%",
    maxWidth: 480,
  },
  text: { fontSize: 16, lineHeight: 1.5, color: "#333" },
  actions: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cancelBtn: {
    background: "#fff",
    border: "1px solid #bbb",
    borderRadius: 6,
    padding: "10px 14px",
    cursor: "pointer",
  },
  removeBtn: {
    background: "#fdecea",
    border: "1px solid #e74c3c",
    color: "#e74c3c",
    borderRadius: 6,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
};
