"use client";

import { useState } from "react";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.");
      return;
    }
    console.log("Password reset request for:", email);
    // Add logic to handle password reset request
  };

  const isStrongPassword = (password: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* App Icon */}
        <img src="/appiconexample.jpg" alt="App Icon" style={styles.icon} />
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
            Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.
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

          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>

        <p style={styles.text}>
          Remembered your password? <a href="/login" style={styles.link}>Sign In</a>
        </p>
      </div>
    </div>
  );
};

// styles 
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  },
  icon: {
    width: "60px",
    height: "60px",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "350px",
    transition: "transform 0.3s",
  },
  title: {
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    transition: "border-color 0.3s",
  },
  note: {
    fontSize: "12px",
    color: "#555",
    marginTop: "-8px",
    marginBottom: "10px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    fontSize: "17px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
    transition: "background-color 0.3s, transform 0.3s",
  },
  text: {
    marginTop: "20px",
    fontSize: "15px",
    color: "#555",
  },
  error: {
    color: "red",
    fontSize: "12px",
  },
};

export default ResetPasswordPage;