// voting-app/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res: any = await login(email, password);
      if (!res?.ok) {
        setError(res?.error || "Invalid credentials");
        return;
      }
      const { user, token } = res;
      saveAuth(token, { id: user.id, email: user.email, username: user.name || user.username });
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h2>Login</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={styles.input}/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" style={styles.input}/>
        {error && <div style={styles.err}>{error}</div>}
        <button type="submit" style={styles.btn}>Sign in</button>
        <button type="button" style={{...styles.btn, background:"#888"}} onClick={()=>router.push("/register")}>Go to Register</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f6f7fb" },
  card: { width:360, background:"#fff", padding:20, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,.08)", display:"flex", flexDirection:"column", gap:10 },
  input: { padding:10, border:"1px solid #ccc", borderRadius:6, fontSize:14 },
  btn: { padding:"10px 12px", background:"#1f74ff", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" },
  err: { background:"#ffecec", color:"#7a0b0b", border:"1px solid #f7c2c2", padding:8, borderRadius:6 },
};
