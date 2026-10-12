import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Pencil, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ROLE_LABELS, useAuth, type StaffRole } from '@/context/AuthContext';
import { Modal } from '@/components/common/Modal';
import { Badge, Button, Card, errorMessage, FieldLabel, inputCls, PageHeader, Spinner, useToast } from './ui';
import { useStaffDirectory } from './data';

const ROLES = Object.keys(ROLE_LABELS) as StaffRole[];
const ROLE_SCOPE: Record<StaffRole, string> = {
  primary_admin: 'Everything, including staff accounts and site settings. Sees all inquiries.',
  hospitality_editor: 'Halls, bookings calendar, accommodation, catering, laundry, events. Conference, accommodation, catering and general inquiries.',
  ministry_editor: 'Mass schedule, retreats, formation, events. Retreat, formation, event and general inquiries.',
  products_editor: 'Products and categories. Product and general inquiries.',
};

type StaffRow = NonNullable<ReturnType<typeof useStaffDirectory>['data']>[number];

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

/** Calls the admin-users Edge Function, which holds the service-role key server-side. */
async function adminUsers(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const detail = ctx ? await ctx.json().catch(() => null) : null;
    throw new Error(detail?.error ?? error.message);
  }
  return data;
}

function StaffDialog({ row, onClose }: { row: StaffRow | null; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: row?.full_name ?? '',
    email: row?.email ?? '',
    title: row?.title ?? '',
    phone: row?.phone ?? '',
    role: (row?.role ?? 'hospitality_editor') as StaffRole,
    is_active: row?.is_active ?? true,
    password: row ? '' : generatePassword(),
  });
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      if (row) {
        const { error } = await supabase
          .from('staff_profiles')
          .update({ full_name: form.full_name, title: form.title || null, phone: form.phone || null, role: form.role, is_active: form.is_active })
          .eq('id', row.id);
        if (error) throw error;
      } else {
        await adminUsers({ action: 'create', ...form });
      }
    },
    onSuccess: () => {
      toast.success(row ? 'Staff member updated.' : `Account created. Share the temporary password with ${form.full_name} privately.`);
      qc.invalidateQueries({ queryKey: ['admin', 'staff-directory'] });
      if (row) onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const created = !row && save.isSuccess;

  return (
    <Modal isOpen onClose={onClose} title={row ? `Edit ${row.full_name}` : 'Add a staff member'} maxWidth="lg">
      {created ? (
        <div className="space-y-4 text-sm">
          <p>
            <strong>{form.full_name}</strong> can now sign in at <code className="bg-stone-100 px-1 rounded">/admin/login</code> with:
          </p>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-sm space-y-1">
            <div>Email: {form.email}</div>
            <div>Temporary password: {form.password}</div>
          </div>
          <p className="text-xs text-stone-600">
            Give this password to them in person or by phone, not by email. They should change it straight away from &ldquo;Change password&rdquo; in the portal menu. It will not
            be shown again.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldLabel label="Full name" htmlFor="st-name" required>
              <input id="st-name" required className={inputCls} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Email (login)" htmlFor="st-email" required hint={row ? 'Login email cannot be changed here.' : undefined}>
              <input id="st-email" type="email" required disabled={!!row} className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Job title" htmlFor="st-title">
              <input id="st-title" className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Phone" htmlFor="st-phone">
              <input id="st-phone" type="tel" className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Role" htmlFor="st-role" className="sm:col-span-2" hint={ROLE_SCOPE[form.role]}>
              <select id="st-role" className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value as StaffRole)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </FieldLabel>
            {!row && (
              <FieldLabel label="Temporary password" htmlFor="st-pw" className="sm:col-span-2" hint="At least 10 characters. You will see it once more after saving.">
                <div className="flex gap-2">
                  <input id="st-pw" required minLength={10} className={`${inputCls} font-mono`} value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <Button variant="secondary" onClick={() => set('password', generatePassword())}>
                    Generate
                  </Button>
                </div>
              </FieldLabel>
            )}
            {row && (
              <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
                Account active (unticking blocks portal access immediately)
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending}>
              {row ? 'Save changes' : 'Create account'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ResetPasswordDialog({ row, onClose }: { row: StaffRow; onClose: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState(generatePassword);
  const reset = useMutation({
    mutationFn: () => adminUsers({ action: 'set_password', user_id: row.id, password }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal isOpen onClose={onClose} title={`Reset password for ${row.full_name}`} maxWidth="md">
      {reset.isSuccess ? (
        <div className="space-y-4 text-sm">
          <p>The new temporary password is:</p>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono">{password}</div>
          <p className="text-xs text-stone-600">Share it privately. They should change it after signing in.</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FieldLabel label="New temporary password" htmlFor="rp-pw">
            <div className="flex gap-2">
              <input id="rp-pw" minLength={10} className={`${inputCls} font-mono`} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button variant="secondary" onClick={() => setPassword(generatePassword())}>
                Generate
              </Button>
            </div>
          </FieldLabel>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={reset.isPending} disabled={password.length < 10} onClick={() => reset.mutate()}>
              Set password
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function StaffPage() {
  const { can, profile } = useAuth();
  const staff = useStaffDirectory();
  const [editing, setEditing] = useState<StaffRow | 'new' | null>(null);
  const [resetting, setResetting] = useState<StaffRow | null>(null);

  if (!can('staff')) return <Card className="p-8 text-center text-sm text-stone-600">Only the primary administrator can manage staff accounts.</Card>;

  return (
    <div>
      <PageHeader
        title="Staff accounts"
        subtitle="Who can sign in to the portal and what each person can manage."
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus className="w-4 h-4" /> Add staff member
          </Button>
        }
      />
      {staff.isPending ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.data?.map((s) => (
            <Card key={s.id} className={`p-5 ${s.is_active ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-serif text-lg font-bold truncate">{s.full_name}</div>
                  <div className="text-xs text-stone-500 truncate">{s.title}</div>
                </div>
                <Badge className={s.is_active ? 'bg-sky-100 text-sky-800' : 'bg-stone-200 text-stone-600'}>{s.is_active ? ROLE_LABELS[s.role] : 'Inactive'}</Badge>
              </div>
              <div className="mt-3 text-xs text-stone-600 space-y-0.5">
                <div className="truncate">{s.email}</div>
                {s.phone && <div>{s.phone}</div>}
              </div>
              <div className="mt-4 flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                {s.id !== profile?.id && (
                  <Button size="sm" variant="ghost" onClick={() => setResetting(s)}>
                    <KeyRound className="w-3.5 h-3.5" /> Reset password
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {editing && <StaffDialog row={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {resetting && <ResetPasswordDialog row={resetting} onClose={() => setResetting(null)} />}
    </div>
  );
}
