import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthHashRedirect } from './auth-redirect';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });

const siteName = 'Dépôt Vente de Drancy';
const description =
  'Dépôt-vente à Drancy. Mobilier, décoration, vaisselle, vêtements… des trouvailles uniques à découvrir en boutique.';

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s — ${siteName}`,
  },
  description,
  applicationName: siteName,
  authors: [{ name: siteName }],
  generator: undefined, // évite "Next.js" comme generator dans le HTML
  keywords: [
    'dépôt-vente',
    'brocante',
    'Drancy',
    'Seine-Saint-Denis',
    'mobilier',
    'décoration',
    'vintage',
    'occasion',
  ],
  openGraph: {
    title: siteName,
    description,
    type: 'website',
    locale: 'fr_FR',
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
  themeColor: '#F4ECD8',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-parchment text-navy font-sans antialiased" suppressHydrationWarning>
        <AuthHashRedirect />
        {children}
      </body>
    </html>
  );
}
