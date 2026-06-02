import { WelcomeForm } from './welcome-form';

export const dynamic = 'force-dynamic';

export default async function BienvenuePage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <WelcomeForm adminSlug={adminSlug} />
    </div>
  );
}
