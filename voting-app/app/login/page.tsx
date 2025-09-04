"use client";

import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* App Icon */}
        <img src="/appiconexample.png" alt="App Icon" style={styles.icon} />

        <h2 style={styles.title}>Sign In</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.rememberForgot}>
            <input type="checkbox" id="rememberMe" />
            <label htmlFor="rememberMe"> Remember me</label>
            <a href="/resetpsw" style={styles.link}>Forgot password?</a>
          </div>

          <button type="submit" style={styles.button}>Sign In</button>
        </form>

        <p style={styles.text}>
          Not a member? <a href="/register" style={styles.link}>Register</a>
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
  rememberForgot: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
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

export default LoginPage;