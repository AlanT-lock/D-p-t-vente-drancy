import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });

export const metadata: Metadata = {
  title: 'Dépôt Vente de Drancy',
  description: 'Brocante et dépôt-vente à Drancy. Trouvailles uniques en boutique.',
  // Empêche iOS Safari d'auto-wrap les téléphones / adresses / dates en liens
  // après le rendu serveur (sinon hydration mismatch).
  formatDetection: {
    telephone: false,
    address: false,
    date: false,
    email: false,
    url: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-parchment text-navy font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
