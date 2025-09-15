'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const groupId  = sp.get("groupId")  ?? "";
  const joinCode = sp.get("joinCode") ?? "";

  const copy = useCallback(async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      alert("Codice copiato!");
    } catch {
      alert("Impossibile copiare il codice 😅");
    }
  }, [joinCode]);

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
    message: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '14px',
    },
    code: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: 4,
      margin: '4px 0 18px',
    },
    row: { display: "flex", gap: 10, flexWrap: 'wrap', justifyContent:'center' },
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
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.message}>Gruppo creato con successo!</p>

      <div style={{color:'#555', marginBottom: 6}}>Condividi questo codice per far entrare i membri:</div>
      <div style={styles.code}>{joinCode || '— — — — — —'}</div>

      <div style={styles.row}>
        <button style={styles.secondary} onClick={copy}>Copia codice</button>
        <button style={styles.secondary} onClick={() => router.push('/unisciti-gruppo')}>
          Vai a “Unisciti al gruppo”
        </button>
        <button style={styles.button} onClick={() => router.push('/home')}>
          Vai alla Home
        </button>
        {groupId && (
          <button style={styles.secondary} onClick={() => router.push(`/gruppo/${groupId}`)}>
            Apri il gruppo
          </button>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: '#777' }}>ID gruppo: {groupId}</p>
    </div>
  );
}
