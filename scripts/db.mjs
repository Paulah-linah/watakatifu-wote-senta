// Runs SQL against the linked Supabase project through the Management API.
// Usage:
//   node scripts/db.mjs apply                 apply pending supabase/migrations/*.sql (recorded in schema_migrations)
//   node scripts/db.mjs file <path.sql>       run one SQL file (e.g. supabase/seed.sql)
//   node scripts/db.mjs query "<sql>"         run an ad-hoc query and print the rows
// Credentials: SUPABASE_ACCESS_TOKEN env var, or scripts/.secrets/access_token (git-ignored).
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'lzphdqkpswzhxlwqwxbp';
const tokenFile = path.join('scripts', '.secrets', 'access_token');
const TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN ||
  (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');

if (!TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

async function run(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

const literal = (s) => `'${s.replace(/'/g, "''")}'`;

async function applyMigrations() {
  await run(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key, statements text[], name text
    );`);
  const applied = new Set(
    (await run('select version from supabase_migrations.schema_migrations')).map((r) => r.version)
  );
  const dir = path.join('supabase', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const [version, ...rest] = file.replace(/\.sql$/, '').split('_');
    if (applied.has(version)) {
      console.log(`skip   ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    // Migration body and its bookkeeping row run in one transaction.
    await run(
      `begin;\n${sql}\n;insert into supabase_migrations.schema_migrations(version, name, statements) values (${literal(
        version
      )}, ${literal(rest.join('_'))}, array[${literal(sql)}]);\ncommit;`
    );
    console.log(`apply  ${file}`);
  }
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'apply') await applyMigrations();
  else if (cmd === 'file') console.log(JSON.stringify(await run(fs.readFileSync(arg, 'utf8')), null, 2));
  else if (cmd === 'query') console.log(JSON.stringify(await run(arg), null, 2));
  else console.log('Usage: node scripts/db.mjs apply | file <path> | query "<sql>"');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
