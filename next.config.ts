import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseHost = new URL(supabaseUrl).hostname;

const nextConfig: NextConfig = {
  // Permet l'accès dev depuis le LAN
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.0.*',
    '192.168.1.*',
    '192.168.2.*',
    '192.168.3.*',
    '192.168.10.*',
    '10.0.0.*',
    '10.0.1.*',
    '*.local',
  ],
  experimental: {
    // Photos uploadées en data URL base64 → dépasse vite 1 MB.
    serverActions: { bodySizeLimit: '10mb' },
  },
  images: {
    remotePatterns: [
      // Couvre tout chemin sur le host Supabase courant (pas que /storage/v1/...)
      { protocol: 'https', hostname: supabaseHost },
      // Wildcard explicite si l'env var n'est pas dispo au build
      { protocol: 'https', hostname: '*.supabase.co' },
      // Photos de profil Google (pour les avis)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
