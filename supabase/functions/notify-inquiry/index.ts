// Sends inquiry emails through Resend: an alert to the responsible department and a confirmation to the visitor.
// Called by the database trigger notify_new_inquiry() with a shared secret header.
// Does nothing (but succeeds) until RESEND_API_KEY and RESEND_FROM are configured.
import { createClient } from 'npm:@supabase/supabase-js@2';

const DEPARTMENT: Record<string, string[]> = {
  conference: ['hospitality_editor'],
  accommodation: ['hospitality_editor'],
  catering: ['hospitality_editor'],
  retreat: ['ministry_editor'],
  formation: ['ministry_editor'],
  event: ['ministry_editor'],
  product: ['products_editor'],
  general: [],
};

const TYPE_LABEL: Record<string, string> = {
  conference: 'Conference hall',
  accommodation: 'Accommodation',
  catering: 'Catering',
  retreat: 'Retreat',
  formation: 'Formation / seminar',
  event: 'Event registration',
  product: 'Product',
  general: 'General inquiry',
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function send(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('NOTIFY_SECRET');
  if (!secret || req.headers.get('x-notify-secret') !== secret) return new Response('Forbidden', { status: 403 });

  const { inquiry_id } = await req.json().catch(() => ({}));
  if (!inquiry_id) return new Response('Missing inquiry_id', { status: 400 });

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM');
  if (!apiKey || !from) return Response.json({ skipped: 'email not configured' });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: i, error } = await db
    .from('inquiries')
    .select('*, facility:facilities(name), accommodation:accommodation_options(name), catering:catering_services(title), retreat:retreats(title), formation:formation_programs(title), event:events(title), product:products(name)')
    .eq('id', inquiry_id)
    .single();
  if (error || !i) return new Response('Inquiry not found', { status: 404 });

  const [{ data: settings }, { data: staff }] = await Promise.all([
    db.from('site_settings').select('email, phone_display, short_name').eq('id', 1).single(),
    db.from('staff_profiles').select('email, role').eq('is_active', true),
  ]);

  const roles = ['primary_admin', ...(DEPARTMENT[i.type] ?? [])];
  const staffEmails = [...new Set([settings?.email, ...(staff ?? []).filter((s) => roles.includes(s.role)).map((s) => s.email)].filter(Boolean))] as string[];

  const topic = i.facility?.name ?? i.accommodation?.name ?? i.catering?.title ?? i.retreat?.title ?? i.formation?.title ?? i.event?.title ?? i.product?.name ?? i.subject ?? '';
  const date = i.event_date ?? i.check_in_date ?? i.preferred_date ?? '';
  const portal = Deno.env.get('SITE_URL') ? `${Deno.env.get('SITE_URL')}/admin/inquiries/${i.id}` : '';
  const rows = [
    ['Reference', i.reference_code],
    ['Type', TYPE_LABEL[i.type]],
    ['About', topic],
    ['Date', date],
    ['Check-out', i.check_out_date],
    ['People', i.attendees_count ?? i.guests_count ?? i.participants_count ?? i.product_quantity],
    ['Name', i.full_name],
    ['Organisation', i.organization],
    ['Phone', i.phone],
    ['Email', i.email],
    ['Message', i.message],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  const table = `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#78716c;vertical-align:top">${esc(k)}</td><td style="color:#1c1917">${esc(v)}</td></tr>`)
    .join('')}</table>`;

  const results: string[] = [];
  try {
    await send(apiKey, {
      from,
      to: staffEmails,
      reply_to: i.email,
      subject: `New ${TYPE_LABEL[i.type].toLowerCase()} inquiry ${i.reference_code}: ${i.full_name}`,
      html: `<p>A new inquiry has arrived on the website.</p>${table}${portal ? `<p><a href="${portal}">Open in the staff portal</a></p>` : ''}`,
    });
    results.push('staff');
  } catch (e) {
    console.error('staff email failed', e);
  }

  try {
    await send(apiKey, {
      from,
      to: [i.email],
      reply_to: settings?.email,
      subject: `We received your inquiry (${i.reference_code}): ${settings?.short_name ?? 'Watakatifu Wote Senta'}`,
      html: `<p>Dear ${esc(i.full_name)},</p>
<p>Thank you for contacting Watakatifu Wote Senta. We have received your inquiry and our team will get back to you by phone or email.</p>
<p>Your reference is <strong>${esc(i.reference_code)}</strong>. Please quote it if you contact us.</p>
${table}
<p>If you need us sooner, call ${esc(settings?.phone_display)} or reply to this email.</p>
<p>God bless,<br/>Watakatifu Wote Senta (All Saints Conference Centre), Ngong</p>`,
    });
    results.push('visitor');
  } catch (e) {
    console.error('visitor email failed', e);
  }

  return Response.json({ sent: results });
});
