"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isStrongPassword = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOkMsg("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError(
        "Password must be at least 8 characters, include an uppercase letter, a number and a special character."
      );
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, newPassword);
    setLoading(false);

    if ("ok" in res && res.ok) {
      setOkMsg("If the email exists, the reset has been processed.");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError((res as any).error ?? "Unable to reset password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/appiconexample.png" alt="App Icon" style={styles.icon} />
        <h2 style={styles.title}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <p style={styles.note}>
            Password must be at least 8 characters, include an uppercase letter,
            a number, and a special character.
          </p>

          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          {okMsg && <p style={styles.ok}>{okMsg}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Processing..." : "Send Reset"}
          </button>
        </form>

        <p style={styles.text}>
          Remembered your password? <a href="/login" style={styles.link}>Sign In</a>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  },
  icon: { width: 60, height: 60, marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: 350,
    transition: "transform 0.3s",
  },
  title: { marginBottom: 25, fontSize: 24, fontWeight: "bold", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: {
    padding: 10,
    fontSize: 15,
    borderRadius: 6,
    border: "1px solid #ddd",
  },
  note: { fontSize: 12, color: "#555", marginTop: -8, marginBottom: 10 },
  link: { color: "#007bff", textDecoration: "none" },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: 12,
    fontSize: 17,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 15,
  },
  text: { marginTop: 20, fontSize: 15, color: "#555" },
  error: { color: "red", fontSize: 12 },
  ok: { color: "green", fontSize: 12 },
};
