// Creates the first primary administrator (later staff are added from the portal's Staff page).
// Usage: node --experimental-websocket scripts/create-admin.mjs "Full Name" email@example.org ["Job title"]
// Needs .env.local and scripts/.secrets/service_role (git-ignored). Prints a temporary password once.
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import fs from 'node:fs';

const [fullName, email, title] = process.argv.slice(2);
if (!fullName || !email) {
  console.error('Usage: node --experimental-websocket scripts/create-admin.mjs "Full Name" email@example.org ["Job title"]');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')])
);
const admin = createClient(env.VITE_SUPABASE_URL, fs.readFileSync('scripts/.secrets/service_role', 'utf8').trim(), {
  auth: { persistSession: false },
});

const password = crypto.randomBytes(12).toString('base64url');
const { data, error } = await admin.auth.admin.createUser({ email: email.toLowerCase(), password, email_confirm: true });
if (error) {
  console.error(error.message);
  process.exit(1);
}
const { error: profileError } = await admin.from('staff_profiles').insert({
  id: data.user.id,
  full_name: fullName,
  email: email.toLowerCase(),
  role: 'primary_admin',
  title: title ?? 'Primary Administrator',
});
if (profileError) {
  await admin.auth.admin.deleteUser(data.user.id);
  console.error(profileError.message);
  process.exit(1);
}

console.log(`Primary administrator created for ${fullName} <${email}>`);
console.log(`Temporary password (shown once): ${password}`);
console.log('Sign in at /admin/login and change it from "Change password" in the portal menu.');
