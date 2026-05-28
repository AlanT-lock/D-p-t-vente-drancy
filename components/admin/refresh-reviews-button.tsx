'use client';
import { useState, useTransition } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { refreshGoogleReviewsAction } from '@/app/[adminSlug]/actions';

export function RefreshReviewsButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const onClick = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await refreshGoogleReviewsAction();
      if (result.ok) {
        setMessage({
          ok: true,
          text: `${result.reviews} avis · ${result.rating?.toFixed(1) ?? '–'} / 5 · ${result.total ?? 0} avis Google au total`,
        });
      } else {
        setMessage({ ok: false, text: result.error ?? 'Erreur' });
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-parchment-light px-4 h-10 text-sm font-medium hover:border-brass disabled:opacity-50"
      >
        <RefreshCw className={`size-4 ${pending ? 'animate-spin' : ''}`} />
        {pending ? 'Mise à jour…' : 'Rafraîchir les avis Google'}
      </button>
      {message && (
        <p
          className={`mt-2 text-xs inline-flex items-center gap-1 ${
            message.ok ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {message.ok ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}
          {message.text}
        </p>
      )}
    </div>
  );
}
