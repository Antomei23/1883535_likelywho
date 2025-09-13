"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Group = {
  id: string;
  name: string;
  hasNewQuestion?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const CURRENT_USER_ID = "11111111-1111-1111-1111-111111111111"; // TODO: prendi da auth quando disponibile --> questa è Alice

export default function HomePage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // carico gruppi dal gateway
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(CURRENT_USER_ID)}/groups`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());

        const raw = await res.json();
        // supporta sia [{...}] che {groups:[...]}
        const list: Group[] = Array.isArray(raw) ? raw : raw?.groups ?? [];

        // Se il gateway non fornisce "hasNewQuestion", possiamo calcolarlo
        // interrogando /pending-question per ciascun gruppo (ok in dev, pochi gruppi).
        const withFlags = await Promise.all(
          list.map(async (g) => {
            try {
              const r = await fetch(
                `${API_BASE}/api/groups/${g.id}/pending-question?userId=${encodeURIComponent(
                  CURRENT_USER_ID
                )}`,
                { cache: "no-store" }
              );
              if (!r.ok) return g;
              const data = await r.json();
              return { ...g, hasNewQuestion: !!data?.hasPending };
            } catch {
              return g;
            }
          })
        );

        if (active) setGroups(withFlags);
      } catch (e: any) {
        console.error("❌ Error fetching groups:", e);
        if (active) setError("Impossibile caricare i gruppi dal Gateway.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const goToGroup = (id: string) => router.push(`/gruppo/${id}`);
  const goCreate = () => router.push("/crea-gruppo");
  const goJoin = () => router.push("/unisciti-gruppo");
  const goProfile = () => router.push("/profile");

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <Image
            src="/appiconexample.png"
            alt="App Logo"
            width={42}
            height={42}
          />
        </div>

        <button
          type="button"
          onClick={goProfile}
          style={styles.profileBtn}
          aria-label="Open profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h1 style={styles.heading}>My groups</h1>

      {/* Error / Loading */}
      {error && (
        <div style={styles.errorBox}>{error}</div>
      )}
      {loading && !error && (
        <div style={styles.loadingBox}>Loading groups…</div>
      )}

      {/* Groups list */}
      {!loading && !error && (
        <div style={styles.groupList}>
          {groups.map((g) => (
            <button
              key={g.id}
              style={styles.groupItem}
              onClick={() => goToGroup(g.id)}
              aria-label={`Open ${g.name}`}
            >
              <span style={styles.groupName}>{g.name}</span>
              {g.hasNewQuestion && <span style={styles.badge}>New</span>}
            </button>
          ))}

          {!groups.length && (
            <div style={{ color: "#666", textAlign: "center", padding: "8px" }}>
              Nessun gruppo trovato.
            </div>
          )}
        </div>
      )}

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
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: "4px",
  },
  errorBox: {
    background: "#ffecec",
    color: "#7a0b0b",
    border: "1px solid #f7c2c2",
    padding: "10px",
    borderRadius: "8px",
    maxWidth: 600,
    margin: "0 auto",
  },
  loadingBox: {
    background: "#fff",
    color: "#333",
    border: "1px solid #eee",
    padding: "10px",
    borderRadius: "8px",
    maxWidth: 600,
    margin: "0 auto",
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
