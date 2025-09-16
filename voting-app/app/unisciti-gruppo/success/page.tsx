'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const groupId = sp.get("groupId") || "";
  const code    = sp.get("code") || "";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Codice copiato!");
    } catch {
      alert("Impossibile copiare il codice 😅");
    }
  }, [code]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      textAlign: 'center',
    },
    message: { fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '12px' },
    code: { fontSize: 28, fontWeight: 800, letterSpacing: 4, marginBottom: 16 },
    row: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    secondary: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    light: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#e9ecef',
      color: '#222',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.message}>Ingresso nel gruppo riuscito! 🎉</p>
      {code && (
        <>
          <div style={{color:'#555', marginBottom: 6}}>Codice usato:</div>
          <div style={styles.code}>{code}</div>
        </>
      )}

      <div style={styles.row}>
        <button style={styles.secondary} onClick={copy} disabled={!code}>Copia codice</button>
        <button style={styles.button} onClick={() => router.push('/unisciti-gruppo')}>Unisciti a un altro gruppo</button>
        <button style={styles.button} onClick={() => router.push('/home')}>Home</button>
        {groupId && (
          <button style={styles.secondary} onClick={() => router.push(`/gruppo/${groupId}`)}>
            Apri il gruppo
          </button>
        )}
      </div>
    </div>
  );
}
