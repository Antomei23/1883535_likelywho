"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  // Gruppi mock, aggiungi 'hasNewQuestion' per mostrare il pallino rosso
  const groups = [
    { id: 1, name: "Gruppo Voto Scuola", hasNewQuestion: true },
    { id: 2, name: "Team Progetto Blockchain", hasNewQuestion: false },
    { id: 3, name: "Associazione Studentesca", hasNewQuestion: true },
  ];

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      {isSidebarOpen && (
        <div style={styles.sidebar}>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>×</button>
          <Link href="/home" style={styles.sidebarLink}>My groups</Link>
          <Link href="/profile" style={styles.sidebarLink}>Profile</Link>
          <Link href="/settings" style={styles.sidebarLink}>Settings</Link>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => setSidebarOpen(true)} style={styles.menuButton}>☰</button>
        <div style={styles.userIconWrapper}>
          <button onClick={() => setUserMenuOpen(!isUserMenuOpen)} style={styles.userButton}>👤</button>
          {isUserMenuOpen && (
            <div style={styles.userMenu}>
              <Link href="/profile" style={styles.userMenuItem}>Profile</Link>
              <Link href="/settings" style={styles.userMenuItem}>Settings</Link>
              <Link href="/logout" style={styles.userMenuItem}>Logout</Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Your groups</h2>
        <div style={styles.groupList}>
          {groups.map(group => (
            <Link key={group.id} href={`/gruppo/${group.id}`} style={styles.groupCard}>
              <div style={styles.groupCardContent}>
                {group.name}
                {group.hasNewQuestion && <span style={styles.notificationDot} />}
              </div>
            </Link>
          ))}
        </div>

        <div style={styles.buttonContainer}>
          <Link href="/crea-gruppo" style={styles.actionButton}>Create a new group</Link>
          <Link href="/unisciti-gruppo" style={styles.actionButtonSecondary}>Join a group</Link>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
    overflowX: "hidden",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  menuButton: {
    fontSize: "28px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#333",
  },
  userIconWrapper: {
    position: "relative",
  },
  userButton: {
    fontSize: "24px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#333",
  },
  userMenu: {
    position: "absolute",
    right: 0,
    top: "40px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "8px",
    zIndex: 20,
  },
  userMenuItem: {
    padding: "12px",
    fontSize: "16px",
    color: "#333",
    textDecoration: "none",
    borderBottom: "1px solid #eee",
    display: "block",
    transition: "background-color 0.2s",
  },
  userMenuItemHover: {
    backgroundColor: "#f0f2f5",
  },
  content: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    marginBottom: "24px",
    textAlign: "center",
    fontWeight: "600",
  },
  groupList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "40px",
  },
  groupCard: {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#333",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  groupCardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  groupCardHover: {
    transform: "scale(1.03)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  },
  notificationDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#ff3b30",
    marginLeft: "10px",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "14px 28px",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "350px",
    textAlign: "center",
    textDecoration: "none",
    transition: "background-color 0.3s",
  },
  actionButtonSecondary: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "14px 28px",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "350px",
    textAlign: "center",
    textDecoration: "none",
    transition: "background-color 0.3s",
  },
  actionButtonHover: {
    backgroundColor: "#45a049",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "250px",
    backgroundColor: "#ffffff",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    zIndex: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
    fontSize: "28px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#333",
    marginBottom: "20px",
  },
  sidebarLink: {
    padding: "14px 0",
    fontSize: "18px",
    color: "#007bff",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  sidebarLinkHover: {
    color: "#0056b3",
  },
};

export default HomePage;
