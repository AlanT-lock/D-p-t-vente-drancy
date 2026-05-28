import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseHost = new URL(supabaseUrl).hostname;

const nextConfig: NextConfig = {
  // Autorise l'accès depuis le réseau local (192.168.x.x, 10.x.x.x, *.local)
  // Sans ça, Next 16 bloque silencieusement le bundle JS en dev → pas d'hydration mobile.
  allowedDevOrigins: [
    '192.168.0.0/16',
    '192.168.1.1',
    '192.168.1.2',
    '192.168.1.3',
    '192.168.1.4',
    '192.168.1.5',
    '*.local',
    '*',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
