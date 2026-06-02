import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/role';
import { InviteForm, DeleteEmployeeButton } from './accounts-ui';

export const dynamic = 'force-dynamic';

export default async function ComptesPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const member = await requireAdmin();
  if (!member) {
    redirect(`/${adminSlug}`);
  }

  const admin = createAdminClient();
  const { data: members } = await admin
    .from('profiles')
    .select('id, email, role, created_at')
    .order('role', { ascending: true })
    .order('email', { ascending: true });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Comptes</h1>

      <section className="mb-8">
        <h2 className="font-serif text-lg mb-3">Inviter un employé</h2>
        <InviteForm />
      </section>

      <section>
        <h2 className="font-serif text-lg mb-3">Membres</h2>
        <ul className="space-y-2">
          {(members ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 bg-parchment-light border border-navy/10 rounded p-3"
            >
              <div>
                <div className="text-sm">{m.email}</div>
                <div className="text-xs text-bronze uppercase tracking-wider">
                  {m.role === 'admin' ? 'Administrateur' : 'Employé'}
                </div>
              </div>
              {m.role === 'employee' && m.id !== member.id && <DeleteEmployeeButton id={m.id} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
