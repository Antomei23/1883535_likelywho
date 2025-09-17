// voting-app/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res: any = await register({ email, username, password });
      if (!res?.ok) {
        setError(res?.error || "Registration failed");
        return;
      }
      const { user, token } = res;
      saveAuth(token, { id: user.id, email: user.email, username: user.name || username });
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h2>Register</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={styles.input}/>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" style={styles.input}/>
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" style={styles.input}/>
        {error && <div style={styles.err}>{error}</div>}
        <button type="submit" style={styles.btn}>Create account</button>
        <button type="button" style={{...styles.btn, background:"#888"}} onClick={()=>router.push("/login")}>Go to Login</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f6f7fb" },
  card: { width:360, background:"#fff", padding:20, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,.08)", display:"flex", flexDirection:"column", gap:10 },
  input: { padding:10, border:"1px solid #ccc", borderRadius:6, fontSize:14 },
  btn: { padding:"10px 12px", background:"#28a745", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" },
  err: { background:"#ffecec", color:"#7a0b0b", border:"1px solid #f7c2c2", padding:8, borderRadius:6 },
};
