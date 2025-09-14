"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getUserGroups, getPendingQuestion } from "@/lib/api";
import { getCurrentUserId, isAuthenticated } from "@/lib/auth";

type Group = {
  id: string;
  name: string;
  joinCode?: string;
  hasNewQuestion?: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      // se non autenticata → login
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        router.replace("/login");
        return;
      }

      try {
        setError(null);
        setLoading(true);

        // gruppi dell'utente (con Authorization già gestita in lib/api)
        const list = await getUserGroups(userId);

        // flag "hasNewQuestion" per ogni gruppo
        const withFlags = await Promise.all(
          list.map(async (g) => {
            try {
              const p = await getPendingQuestion(g.id, userId);
              return { ...g, hasNewQuestion: !!p?.hasPending };
            } catch {
              return g;
            }
          })
        );

        if (alive) setGroups(withFlags as Group[]);
      } catch (e: any) {
        // se il token non è valido o mancante → login
        const msg = e?.message || "";
        if (/Missing token|Invalid token|401|403/i.test(msg)) {
          router.replace("/login");
          return;
        }
        if (alive) setError("Impossibile caricare i gruppi.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  const goToGroup = (id: string) => router.push(`/gruppo/${id}`);
  const goCreate = () => router.push("/crea-gruppo");
  const goJoin = () => router.push("/unisciti-gruppo");
  const goProfile = () => router.push("/profile");

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <Image src="/appiconexample.png" alt="App Logo" width={42} height={42} />
        </div>

        <button
          type="button"
          onClick={goProfile}
          style={styles.profileBtn}
          aria-label="Open profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </button>
      </div>

      <h1 style={styles.heading}>My groups</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && !error && <div style={styles.loadingBox}>Loading groups…</div>}

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
