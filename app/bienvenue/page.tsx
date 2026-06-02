import { WelcomeForm } from './welcome-form';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default function BienvenuePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <WelcomeForm />
    </div>
  );
}
