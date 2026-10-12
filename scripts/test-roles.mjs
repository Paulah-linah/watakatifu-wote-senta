// Role-based access tests: creates one temporary staff account per role, checks what each can
// read and change, then deletes everything it created.
// Usage: node --experimental-websocket scripts/test-roles.mjs   (needs .env.local + scripts/.secrets/service_role)
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')])
);
const URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const admin = createClient(URL, fs.readFileSync('scripts/.secrets/service_role', 'utf8').trim(), { auth: { persistSession: false } });

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

const run = Date.now();
const ROLES = ['primary_admin', 'hospitality_editor', 'ministry_editor', 'products_editor'];
const password = `Test-${run}-pw!`;
const users = {};
const createdInquiries = [];

try {
  // --- Fixtures
  for (const role of ROLES) {
    const email = `role-test-${role}-${run}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    await admin.from('staff_profiles').insert({ id: data.user.id, full_name: `Test ${role}`, email, role });
    const client = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    users[role] = { id: data.user.id, client };
  }

  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: hall } = await anon.from('facilities').select('id').order('capacity_max', { ascending: false }).limit(1).single();
  const { data: product } = await anon.from('products').select('id').limit(1).single();
  const future = new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10);
  const base = { full_name: 'Role Test', phone: '0711000000', message: 'role test' };
  for (const [type, extra] of [
    ['conference', { facility_id: hall.id, event_date: future, attendees_count: 20 }],
    ['product', { product_id: product.id, product_quantity: 2 }],
    ['general', { subject: 'role test' }],
  ]) {
    const { data, error } = await anon.rpc('submit_inquiry', { payload: { ...base, ...extra, type, email: `role-${type}-${run}@example.com` } });
    if (error) throw error;
    createdInquiries.push(data.id);
  }

  // --- Inquiry visibility by department
  const visibleTypes = async (role) => {
    const { data } = await users[role].client.from('inquiries').select('type').in('id', createdInquiries);
    return (data ?? []).map((r) => r.type).sort().join(',');
  };
  check('primary admin sees every inquiry type', (await visibleTypes('primary_admin')) === 'conference,general,product');
  check('hospitality editor sees conference + general only', (await visibleTypes('hospitality_editor')) === 'conference,general');
  check('ministry editor sees general only (no conference/product)', (await visibleTypes('ministry_editor')) === 'general');
  check('products editor sees product + general only', (await visibleTypes('products_editor')) === 'general,product');

  // --- Inquiry workflow
  {
    const conf = createdInquiries[0];
    const { error } = await users.hospitality_editor.client.from('inquiries').update({ status: 'In Progress', assigned_to: users.hospitality_editor.id }).eq('id', conf);
    const { data: act } = await admin.from('inquiry_activity').select('kind').eq('inquiry_id', conf);
    check('hospitality editor can update a conference inquiry; activity logged', !error && act.some((a) => a.kind === 'status_change') && act.some((a) => a.kind === 'assignment'), error?.message);
    const { data: changed } = await users.products_editor.client.from('inquiries').update({ status: 'Cancelled' }).eq('id', conf).select('id');
    check('products editor cannot update a conference inquiry', (changed ?? []).length === 0);
    const { error: noteError } = await users.hospitality_editor.client
      .from('inquiry_activity')
      .insert({ inquiry_id: conf, author_id: users.hospitality_editor.id, kind: 'note', body: 'Quote sent' });
    check('staff can add notes to visible inquiries', !noteError, noteError?.message);
    const { error: spoofError } = await users.hospitality_editor.client
      .from('inquiry_activity')
      .insert({ inquiry_id: conf, author_id: users.primary_admin.id, kind: 'note', body: 'spoofed' });
    check('staff cannot post notes as someone else', !!spoofError);
  }

  // --- Content editing areas
  const canEdit = async (role, table) => {
    const { data: row } = await admin.from(table).select('id, sort_order').limit(1).single();
    const { data } = await users[role].client.from(table).update({ sort_order: row.sort_order }).eq('id', row.id).select('id');
    return (data ?? []).length === 1;
  };
  check('hospitality editor can edit halls', await canEdit('hospitality_editor', 'facilities'));
  check('products editor cannot edit halls', !(await canEdit('products_editor', 'facilities')));
  check('ministry editor can edit retreats', await canEdit('ministry_editor', 'retreats'));
  check('hospitality editor cannot edit retreats', !(await canEdit('hospitality_editor', 'retreats')));
  check('products editor can edit products', await canEdit('products_editor', 'products'));
  check('ministry editor cannot edit products', !(await canEdit('ministry_editor', 'products')));
  check('every role can edit gallery', (await Promise.all(ROLES.map((r) => canEdit(r, 'gallery_images')))).every(Boolean));
  {
    const { data } = await users.hospitality_editor.client.from('site_settings').update({ office_hours: 'x' }).eq('id', 1).select('id');
    check('only primary admin can change site settings', (data ?? []).length === 0);
  }
  {
    const { data } = await users.hospitality_editor.client.from('staff_profiles').update({ role: 'primary_admin' }).eq('id', users.hospitality_editor.id).select('id');
    check('editors cannot promote themselves', (data ?? []).length === 0);
  }

  // --- Bookings
  {
    const date = new Date(Date.now() + 400 * 864e5).toISOString().slice(0, 10);
    const { data: b1, error: e1 } = await users.hospitality_editor.client
      .from('facility_bookings')
      .insert({ facility_id: hall.id, booking_date: date, time_slot: 'MORNING', status: 'BOOKED', client_name: 'Private Client' })
      .select('id')
      .single();
    check('hospitality editor can add a booking', !e1, e1?.message);
    const { error: e2 } = await users.hospitality_editor.client.from('facility_bookings').insert({ facility_id: hall.id, booking_date: date, time_slot: 'FULL_DAY', status: 'BOOKED' });
    check('overlapping full-day booking rejected', !!e2, e2?.message);
    const { error: e3 } = await users.ministry_editor.client.from('facility_bookings').insert({ facility_id: hall.id, booking_date: date, time_slot: 'EVENING', status: 'BOOKED' });
    check('ministry editor cannot add bookings', !!e3);
    const { data: seen } = await users.ministry_editor.client.from('facility_bookings').select('id').eq('booking_date', date);
    check('ministry editor can view bookings', (seen ?? []).length === 1);
    const { data: hidden } = await users.products_editor.client.from('facility_bookings').select('id').eq('booking_date', date);
    check('products editor cannot view bookings', (hidden ?? []).length === 0);
    const { data: pub } = await anon.rpc('get_facility_availability', { p_from: date, p_to: date });
    check('public availability shows the slot without client details', pub?.length === 1 && !JSON.stringify(pub).includes('Private Client'));
    if (b1) await admin.from('facility_bookings').delete().eq('id', b1.id);
  }

  // --- admin-users Edge Function
  {
    const { error } = await users.hospitality_editor.client.functions.invoke('admin-users', { body: { action: 'set_password', user_id: users.products_editor.id, password: 'whatever-long-1' } });
    check('editors cannot use the staff account function', !!error);
    const { error: ok } = await users.primary_admin.client.functions.invoke('admin-users', {
      body: { action: 'set_password', user_id: users.products_editor.id, password: `New-${run}-pw` },
    });
    check('primary admin can reset a staff password', !ok, ok?.message);
  }
} catch (e) {
  failures++;
  console.error('ERROR', e.message ?? e);
} finally {
  if (createdInquiries.length) await admin.from('inquiries').delete().in('id', createdInquiries);
  for (const { id } of Object.values(users)) await admin.auth.admin.deleteUser(id);
  console.log('cleanup: temporary staff and inquiries removed');
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll role checks passed');
process.exit(failures ? 1 : 0);
