'use client';
import { useEffect, useState } from 'react';

export function HydrationCheck() {
  const [hydrated, setHydrated] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    const onError = (e: ErrorEvent) => {
      setErr(`${e.message} @ ${e.filename}:${e.lineno}`);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      setErr(`Promise rejected: ${String(e.reason)}`);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: err ? '#b91c1c' : hydrated ? '#15803d' : '#6b7280',
        color: 'white',
        padding: '6px 10px',
        fontSize: 11,
        fontFamily: 'monospace',
        textAlign: 'center',
      }}
    >
      {err
        ? `❌ ERREUR JS : ${err}`
        : hydrated
          ? '✅ JS hydraté — le tap doit fonctionner'
          : '⏳ En attente hydration…'}
    </div>
  );
}
