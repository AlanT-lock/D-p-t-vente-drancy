import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth/role';
import { AdminNav } from '@/components/admin/admin-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  if (adminSlug !== process.env.ADMIN_SLUG) {
    redirect('/');
  }
  const member = await getCurrentMember();
  return (
    <div className="min-h-screen bg-parchment">
      {member && <AdminNav slug={adminSlug} role={member.role} />}
      <main className="px-4 py-6 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
