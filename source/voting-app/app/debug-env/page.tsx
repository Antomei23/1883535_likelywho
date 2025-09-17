// app/debug-env/page.tsx
'use client';
import { useEffect } from 'react';

export default function DebugEnv() {
  useEffect(() => {
    console.log('API_BASE', process.env.NEXT_PUBLIC_API_BASE);
    console.log('API_PREFIX', process.env.NEXT_PUBLIC_API_PREFIX);
  }, []);

  return (
    <pre>
      {JSON.stringify(
        {
          API_BASE: process.env.NEXT_PUBLIC_API_BASE,
          API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
        },
        null,
        2
      )}
    </pre>
  );
}
