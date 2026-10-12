// Staff account management for the primary administrator.
// The service-role key never leaves this function; the caller must be an active primary_admin.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const ROLES = ['primary_admin', 'hospitality_editor', 'ministry_editor', 'products_editor'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Identify the caller from their JWT.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Please sign in again.' }, 401);

  const { data: caller } = await admin.from('staff_profiles').select('role, is_active').eq('id', userData.user.id).maybeSingle();
  if (!caller?.is_active || caller.role !== 'primary_admin') return json({ error: 'Only the primary administrator can manage staff accounts.' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const password = String(body.password ?? '');
  if (password.length < 10) return json({ error: 'Password must be at least 10 characters.' }, 400);

  if (body.action === 'create') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.full_name ?? '').trim();
    const role = String(body.role ?? '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
    if (fullName.length < 2) return json({ error: 'Please enter the full name.' }, 400);
    if (!ROLES.includes(role)) return json({ error: 'Please choose a valid role.' }, 400);

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error || !created.user) {
      const msg = /already been registered|already exists/i.test(error?.message ?? '') ? 'An account with this email already exists.' : error?.message;
      return json({ error: msg ?? 'Could not create the account.' }, 400);
    }

    const { error: profileError } = await admin.from('staff_profiles').insert({
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      title: body.title ? String(body.title) : null,
      phone: body.phone ? String(body.phone) : null,
      is_active: true,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }
    return json({ id: created.user.id });
  }

  if (body.action === 'set_password') {
    const userId = String(body.user_id ?? '');
    const { data: target } = await admin.from('staff_profiles').select('id').eq('id', userId).maybeSingle();
    if (!target) return json({ error: 'Staff member not found.' }, 404);
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action.' }, 400);
});
