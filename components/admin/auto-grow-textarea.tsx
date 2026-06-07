'use client';
import { useEffect, useRef, type TextareaHTMLAttributes } from 'react';

/**
 * Zone de texte dont la hauteur s'ajuste au contenu (pas de barre de défilement) :
 * on voit tout ce qu'on écrit d'un coup d'œil. À la saisie et au montage (pour
 * defaultValue), on cale la hauteur sur scrollHeight.
 */
export function AutoGrowTextarea({
  className = '',
  onInput,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, []);

  return (
    <textarea
      ref={ref}
      {...props}
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
      className={`${className} resize-none overflow-hidden`}
    />
  );
}
