'use client';
import { useActionState } from 'react';
import { inviteEmployee, deleteEmployee } from './actions';

type ActionResult = { error: string } | { ok: true };
type InviteState = { error?: string; success?: boolean } | null;

async function inviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const result: ActionResult = await inviteEmployee(formData);
  if ('error' in result) return { error: result.error };
  return { success: true };
}

export function InviteForm() {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteAction, null);
  return (
    <form action={formAction} className="bg-parchment-light border border-navy/10 rounded-lg p-4 space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Email de l'employé</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="off"
        />
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Invitation envoyée par email.</p>}
      <button
        disabled={pending}
        className="rounded-full bg-navy text-parchment px-5 py-2 font-semibold disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Inviter'}
      </button>
    </form>
  );
}

type DeleteState = { error: string } | null;

async function deleteActionFn(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const result: ActionResult = await deleteEmployee(formData);
  if ('error' in result) return { error: result.error };
  return null;
}

export function DeleteEmployeeButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(deleteActionFn, null);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className="text-sm text-red-700 underline disabled:opacity-60"
      >
        {pending ? 'Suppression…' : 'Supprimer'}
      </button>
      {state?.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
