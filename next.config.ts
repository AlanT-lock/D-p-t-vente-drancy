import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseHost = new URL(supabaseUrl).hostname;

const nextConfig: NextConfig = {
  // Autorise le dev server à servir les bundles aux origines LAN.
  // Syntaxe glob — pas CIDR. Couvre les plages d'IP les plus communes
  // pour le WiFi domestique.
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
