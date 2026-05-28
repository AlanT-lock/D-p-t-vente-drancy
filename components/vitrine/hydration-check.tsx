'use client';
import { useEffect, useState } from 'react';

export function HydrationCheck() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: hydrated ? '#15803d' : '#6b7280',
        color: 'white',
        padding: '6px 10px',
        fontSize: 11,
        fontFamily: 'monospace',
        textAlign: 'center',
      }}
    >
      {hydrated ? '✅ JS hydraté' : '⏳ En attente JS…'}
    </div>
  );
}
