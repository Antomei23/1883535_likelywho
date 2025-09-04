"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const goChangePassword = () => router.push("/resetpsw"); // <-- usa la tua pagina
  const goScores = () => router.push("/profile/scores");
  const goDeleteAccount = () => router.push("/profile/delete-account");
  const handleLogout = () => {
    console.log("User logged out");
    router.push("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.avatar} />

      <div style={styles.infoBox}>
        <div style={styles.row}>
          <span style={styles.label}>First Name</span>
          <span style={styles.value}>Mario</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Last Name</span>
          <span style={styles.value}>Rossi</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>Mariorossi@yahoo.it</span>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={goChangePassword}>
          🔑 Change Password
        </button>
        <button style={styles.actionBtn} onClick={goScores}>
          🏆 Scores
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
        <button style={styles.deleteBtn} onClick={goDeleteAccount}>
          🗑 Delete account
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    maxWidth: "100%",
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#ddd",
    border: "2px solid #000",
    margin: "20px 0",
  },
  infoBox: {
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "16px",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: { display: "flex", justifyContent: "space-between", fontSize: "16px" },
  label: { fontWeight: 600 },
  value: { color: "#333" },
  actions: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    maxWidth: "400px",
  },
  actionBtn: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },
  logoutBtn: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "1px solid #e67e22",
    background: "#fff5ec",
    color: "#e67e22",
    cursor: "pointer",
    textAlign: "left",
  },
  deleteBtn: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "1px solid #e74c3c",
    background: "#fdecea",
    color: "#e74c3c",
    cursor: "pointer",
    textAlign: "left",
  },
};
