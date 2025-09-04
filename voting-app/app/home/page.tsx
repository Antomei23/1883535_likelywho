"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Group = {
  id: string;
  name: string;
  hasNewQuestion?: boolean;
};

export default function HomePage() {
  const router = useRouter();

  // Per ora mock; poi sostituiremo con fetch al backend
  const groups: Group[] = useMemo(
    () => [
      { id: "1", name: "Group 1", hasNewQuestion: true },
      { id: "2", name: "Group 2" },
    ],
    []
  );

  const goToGroup = (id: string) => router.push(`/gruppo/${id}`);
  const goCreate = () => router.push("/crea-gruppo");
  const goJoin = () => router.push("/unisciti-gruppo");
  const goProfile = () => router.push("/profile");

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>logo</div>
        <button type="button" onClick={goProfile} style={styles.profileBtn} aria-label="Open profile" />
      </div>

      {/* Title */}
      <h1 style={styles.heading}>My groups</h1>

      {/* Groups list */}
      <div style={styles.groupList}>
        {groups.map((g) => (
          <button
            key={g.id}
            style={styles.groupItem}
            onClick={() => goToGroup(g.id)}
            aria-label={`Open ${g.name}`}
          >
            <span style={styles.groupName}>{g.name}</span>
            {g.hasNewQuestion && (
              <span style={styles.badge}>New</span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button type="button" onClick={goCreate} style={styles.primaryBtn}>
          <span style={styles.plus}>+</span> Create new group
        </button>
        <button type="button" onClick={goJoin} style={styles.secondaryBtn}>
          Join a group
        </button>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    maxWidth: "100%",
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "22px",
    userSelect: "none",
  },
  profileBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid #000",
    background:
      "radial-gradient(circle at 50% 35%, #000 18%, transparent 19%), radial-gradient(circle at 50% 85%, #000 18%, transparent 19%), linear-gradient(#000 0 0) center/60% 18% no-repeat",
    cursor: "pointer",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: "4px",
  },
  groupList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 10px",
  },
  groupItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #7fa7e6",
    background: "#a8c7ff",
    color: "#21406e",
    fontWeight: 700,
    cursor: "pointer",
  },
  groupName: {
    fontSize: "16px",
  },
  badge: {
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#fff16b",
    color: "#333",
    border: "1px solid #c9be42",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "28px",
  },
  primaryBtn: {
    width: "100%",
    maxWidth: "320px",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #c9be42",
    backgroundColor: "#fff16b",
    color: "#333",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  plus: {
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: 1,
  },
  secondaryBtn: {
    width: "100%",
    maxWidth: "320px",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #bdbdbd",
    backgroundColor: "#d9d9d9",
    color: "#333",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
