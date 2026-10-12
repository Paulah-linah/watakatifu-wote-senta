// Security regression tests: runs against the live project with the public anon key,
// exactly as a visitor's browser would. Test inquiries are tagged and cleaned up afterwards.
// Usage: node scripts/test-rls.mjs   (reads .env.local; cleanup needs scripts/.secrets/service_role)
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);
const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

const runId = Date.now();
const email = `rls-test-${runId}@example.com`;
const base = { full_name: 'RLS Test Visitor', phone: '0700 000 000', email, message: 'automated test', source: 'web' };

// --- Private tables are invisible to the public
for (const table of ['inquiries', 'inquiry_activity', 'facility_bookings', 'staff_profiles']) {
  const { data, error } = await anon.from(table).select('*').limit(1);
  check(`anon cannot read ${table}`, !!error || (data ?? []).length === 0, error?.code ?? `${data?.length} rows`);
}

// --- Published content is readable
for (const [table, min] of [['facilities', 3], ['products', 8], ['events', 1], ['site_settings', 1], ['gallery_images', 1]]) {
  const { data, error } = await anon.from(table).select('id');
  check(`anon reads ${table}`, !error && data.length >= min, error?.message ?? `${data.length} rows`);
}

// --- The public cannot write content
{
  const { error } = await anon.from('products').update({ name: 'hacked' }).neq('id', '00000000-0000-0000-0000-000000000000');
  const { data } = await anon.from('products').select('name').eq('name', 'hacked');
  check('anon cannot update products', (data ?? []).length === 0, error?.code ?? 'no rows changed');
}
{
  const { error } = await anon.from('inquiries').insert({ ...base, type: 'general', reference_code: 'x' });
  check('anon cannot insert inquiries directly', !!error, error?.code);
}

// --- Public availability exposes status only
{
  const { data, error } = await anon.rpc('get_facility_availability', { p_from: '2026-01-01', p_to: '2026-12-31' });
  const cols = data?.[0] ? Object.keys(data[0]) : ['facility_id', 'booking_date', 'time_slot', 'status'];
  check('availability RPC works and hides private columns', !error && !cols.some((c) => /client|note|contact/.test(c)), error?.message ?? cols.join(','));
}

// --- submit_inquiry
const { data: facilities } = await anon.from('facilities').select('id, name, capacity_max').order('capacity_max');
const smallest = facilities[0];
const nextMonth = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

{
  const { data, error } = await anon.rpc('submit_inquiry', { payload: { ...base, type: 'general', subject: 'Test subject' } });
  check('submit_inquiry returns a reference code', !error && /^WWS-\d{4}-\d{5}$/.test(data?.reference_code ?? ''), error?.message ?? data?.reference_code);
}
{
  const { error } = await anon.rpc('submit_inquiry', { payload: { ...base, type: 'general', subject: 'x', website: 'spam.example' } });
  check('honeypot submission rejected', !!error, error?.message);
}
{
  const { error } = await anon.rpc('submit_inquiry', {
    payload: { ...base, email: `cap-${email}`, type: 'conference', facility_id: smallest.id, event_date: nextMonth, attendees_count: smallest.capacity_max + 1 },
  });
  check('conference over hall capacity rejected', !!error && /holds up to/.test(error.message), error?.message);
}
{
  const { error } = await anon.rpc('submit_inquiry', {
    payload: { ...base, email: `past-${email}`, type: 'accommodation', check_in_date: '2020-01-01', check_out_date: '2020-01-02' },
  });
  check('past dates rejected', !!error && /past/.test(error.message), error?.message);
}
{
  const { error } = await anon.rpc('submit_inquiry', {
    payload: { ...base, email: `range-${email}`, type: 'accommodation', check_in_date: nextMonth, check_out_date: '2026-01-01' },
  });
  check('check-out before check-in rejected', !!error, error?.message);
}
{
  const { error } = await anon.rpc('submit_inquiry', { payload: { ...base, email: 'not-an-email', type: 'general', subject: 'x' } });
  check('invalid email rejected', !!error && /email/i.test(error.message), error?.message);
}
{
  // 1 accepted above; 4 more accepted, then the 6th within the hour is rejected
  let lastError = null;
  for (let i = 0; i < 5; i++) {
    const { error } = await anon.rpc('submit_inquiry', { payload: { ...base, type: 'general', subject: `rate ${i}` } });
    lastError = error;
  }
  check('rate limit blocks the 6th inquiry in an hour', !!lastError && /last hour/.test(lastError.message), lastError?.message);
}

// --- Cleanup (service role bypasses RLS)
const serviceKeyFile = 'scripts/.secrets/service_role';
if (fs.existsSync(serviceKeyFile)) {
  const admin = createClient(env.VITE_SUPABASE_URL, fs.readFileSync(serviceKeyFile, 'utf8').trim(), { auth: { persistSession: false } });
  const { error } = await admin.from('inquiries').delete().like('email', `%rls-test-${runId}@example.com`);
  console.log(error ? `cleanup failed: ${error.message}` : 'cleanup: test inquiries removed');
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
