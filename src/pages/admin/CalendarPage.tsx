import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useFacilities } from '@/services/content';
import type { BookingStatus, TimeSlot } from '@/services/availability';
import { addDays, formatDate, todayISO } from '@/lib/dates';
import { shortHallName, TIME_SLOT_LABELS } from '@/lib/format';
import { Modal } from '@/components/common/Modal';
import { Badge, BOOKING_TONES, Button, Card, errorMessage, FieldLabel, inputCls, PageHeader, Spinner, useConfirm, useToast } from './ui';
import { useRealtimeInvalidation, type Booking } from './data';

const SLOT_ORDER: TimeSlot[] = ['FULL_DAY', 'MORNING', 'AFTERNOON', 'EVENING'];
const STATUS_LABEL: Record<BookingStatus, string> = { PENDING: 'Pending', BOOKED: 'Booked', BLOCKED: 'Blocked' };

const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const shiftMonth = (iso: string, delta: number) => {
  const d = new Date(`${monthStart(iso)}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return d.toISOString().slice(0, 10);
};

type Draft = Partial<Booking> & { facility_id: string; booking_date: string; time_slot: TimeSlot; status: BookingStatus };

function BookingDialog({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { profile } = useAuth();
  const facilities = useFacilities();
  const [form, setForm] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        facility_id: form.facility_id,
        booking_date: form.booking_date,
        time_slot: form.time_slot,
        status: form.status,
        client_name: form.client_name || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        public_note: form.public_note || null,
        internal_note: form.internal_note || null,
      };
      const { error } = form.id
        ? await supabase.from('facility_bookings').update(payload).eq('id', form.id)
        : await supabase.from('facility_bookings').insert({ ...payload, created_by: profile?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(form.id ? 'Booking updated.' : 'Booking added.');
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      qc.invalidateQueries({ queryKey: ['public', 'availability'] });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Modal isOpen onClose={onClose} title={form.id ? 'Edit booking' : 'Set hall availability'} maxWidth="lg">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldLabel label="Hall" htmlFor="bk-hall" required>
            <select id="bk-hall" required className={inputCls} value={form.facility_id} onChange={(e) => set('facility_id', e.target.value)}>
              {facilities.data?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Date" htmlFor="bk-date" required>
            <input id="bk-date" type="date" required className={inputCls} value={form.booking_date} onChange={(e) => set('booking_date', e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Session" htmlFor="bk-slot">
            <select id="bk-slot" className={inputCls} value={form.time_slot} onChange={(e) => set('time_slot', e.target.value as TimeSlot)}>
              {SLOT_ORDER.map((s) => (
                <option key={s} value={s}>
                  {TIME_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Status" htmlFor="bk-status" hint="Blocked = maintenance or closed.">
            <select id="bk-status" className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value as BookingStatus)}>
              <option value="PENDING">Pending (tentative hold)</option>
              <option value="BOOKED">Booked (confirmed)</option>
              <option value="BLOCKED">Blocked (unavailable)</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Client / group" htmlFor="bk-client">
            <input id="bk-client" className={inputCls} value={form.client_name ?? ''} onChange={(e) => set('client_name', e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Contact phone" htmlFor="bk-phone">
            <input id="bk-phone" type="tel" className={inputCls} value={form.contact_phone ?? ''} onChange={(e) => set('contact_phone', e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Contact email" htmlFor="bk-email" className="sm:col-span-2">
            <input id="bk-email" type="email" className={inputCls} value={form.contact_email ?? ''} onChange={(e) => set('contact_email', e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Internal note (staff only)" htmlFor="bk-internal" className="sm:col-span-2">
            <textarea id="bk-internal" rows={2} className={inputCls} value={form.internal_note ?? ''} onChange={(e) => set('internal_note', e.target.value)} />
          </FieldLabel>
        </div>
        <p className="text-[11px] text-stone-500">The public website only shows the hall, date, session and status. Client details and notes stay private.</p>
        {form.inquiry_id && (
          <Link to={`/admin/inquiries/${form.inquiry_id}`} className="text-xs font-semibold text-sky-700">
            Open the linked inquiry →
          </Link>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            Save booking
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CalendarPage() {
  const { can } = useAuth();
  const editable = can('bookings');
  const toast = useToast();
  const qc = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const facilities = useFacilities();
  const [params, setParams] = useSearchParams();
  const today = todayISO();
  const month = monthStart(params.get('month') ? `${params.get('month')}-01` : today);
  const hall = params.get('hall') ?? 'all';
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [draft, setDraft] = useState<Draft | null>(null);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };

  // Grid starts on the Monday on/before the 1st and covers 6 weeks.
  const gridStart = useMemo(() => {
    const dow = (new Date(`${month}T00:00:00Z`).getUTCDay() + 6) % 7;
    return addDays(month, -dow);
  }, [month]);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const bookings = useQuery({
    queryKey: ['admin', 'bookings', gridStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facility_bookings')
        .select('*')
        .gte('booking_date', gridStart)
        .lte('booking_date', days[41])
        .order('booking_date');
      if (error) throw error;
      return data;
    },
  });
  useRealtimeInvalidation('facility_bookings', [['admin', 'bookings']]);

  const visible = (bookings.data ?? []).filter((b) => hall === 'all' || b.facility_id === hall);
  const byDay = (d: string) => visible.filter((b) => b.booking_date === d);
  const hallName = (id: string) => shortHallName(facilities.data?.find((f) => f.id === id)?.name ?? '');

  const remove = async (b: Booking) => {
    if (!(await confirm(`Remove the ${STATUS_LABEL[b.status].toLowerCase()} ${TIME_SLOT_LABELS[b.time_slot].toLowerCase()} booking for ${hallName(b.facility_id)} on ${formatDate(b.booking_date)}? The slot will show as available.`, 'Remove booking')))
      return;
    const { error } = await supabase.from('facility_bookings').delete().eq('id', b.id);
    if (error) return toast.error(errorMessage(error));
    toast.success('Booking removed.');
    qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
  };

  const newDraft = (date: string): Draft => ({
    facility_id: hall !== 'all' ? hall : facilities.data?.[0]?.id ?? '',
    booking_date: date,
    time_slot: 'FULL_DAY',
    status: 'BOOKED',
  });

  const dayList = byDay(selectedDay).sort((a, b) => hallName(a.facility_id).localeCompare(hallName(b.facility_id)) || SLOT_ORDER.indexOf(a.time_slot) - SLOT_ORDER.indexOf(b.time_slot));

  return (
    <div>
      {dialog}
      <PageHeader
        title="Hall availability"
        subtitle={editable ? 'Mark sessions as booked, pending or unavailable. Changes show on the public website immediately.' : 'Read-only view of hall bookings.'}
        actions={
          editable && (
            <Button onClick={() => setDraft(newDraft(selectedDay >= today ? selectedDay : today))}>
              <Plus className="w-4 h-4" /> Book or block a session
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" aria-label="Previous month" onClick={() => setParam('month', shiftMonth(month, -1).slice(0, 7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-serif text-xl font-bold w-44 text-center">{formatDate(month, { month: 'long', year: 'numeric' })}</h2>
          <Button variant="secondary" size="sm" aria-label="Next month" onClick={() => setParam('month', shiftMonth(month, 1).slice(0, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setParams({}, { replace: true })}>
            Today
          </Button>
        </div>
        <select aria-label="Hall" className={`${inputCls} w-auto`} value={hall} onChange={(e) => setParam('hall', e.target.value)}>
          <option value="all">All halls</option>
          {facilities.data?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {bookings.isPending ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_22rem] gap-6 items-start">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200 bg-stone-50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((d) => {
                const entries = byDay(d);
                const inMonth = d.slice(0, 7) === month.slice(0, 7);
                const selected = d === selectedDay;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    aria-pressed={selected}
                    aria-label={`${formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${entries.length} booking${entries.length === 1 ? '' : 's'}`}
                    className={`min-h-20 sm:min-h-24 p-1.5 text-left border-b border-r border-stone-100 align-top transition-colors ${
                      selected ? 'bg-sky-50 ring-2 ring-inset ring-sky-500' : 'hover:bg-stone-50'
                    } ${inMonth ? '' : 'bg-stone-50/60 text-stone-400'}`}
                  >
                    <div className={`text-xs font-semibold mb-1 ${d === today ? 'inline-flex w-6 h-6 items-center justify-center rounded-full bg-sky-700 text-white' : ''}`}>
                      {Number(d.slice(8))}
                    </div>
                    <div className="space-y-0.5">
                      {entries.slice(0, 3).map((b) => (
                        <div key={b.id} className={`text-[10px] leading-tight px-1 py-0.5 rounded border truncate ${BOOKING_TONES[b.status]}`}>
                          <span className="hidden sm:inline">{hallName(b.facility_id)} · </span>
                          {b.time_slot === 'FULL_DAY' ? 'Day' : TIME_SLOT_LABELS[b.time_slot].slice(0, 3)}
                        </div>
                      ))}
                      {entries.length > 3 && <div className="text-[10px] text-stone-500">+{entries.length - 3} more</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg font-bold">{formatDate(selectedDay, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
              {editable && (
                <Button size="sm" variant="secondary" onClick={() => setDraft(newDraft(selectedDay))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              )}
            </div>
            {dayList.length === 0 ? (
              <p className="text-sm text-stone-500">No bookings. All halls show as available.</p>
            ) : (
              <ul className="space-y-2">
                {dayList.map((b) => (
                  <li key={b.id} className="p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{hallName(b.facility_id)}</div>
                      <Badge className={BOOKING_TONES[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                    </div>
                    <div className="text-xs text-stone-600">{TIME_SLOT_LABELS[b.time_slot]}</div>
                    {b.client_name && <div className="text-xs text-stone-800 mt-1">{b.client_name}</div>}
                    {b.contact_phone && <div className="text-[11px] text-stone-500">{b.contact_phone}</div>}
                    {b.internal_note && <div className="text-[11px] text-stone-500 italic mt-1">{b.internal_note}</div>}
                    {editable && (
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="ghost" onClick={() => setDraft({ ...b })}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-700" onClick={() => remove(b)}>
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {draft && <BookingDialog draft={draft} onClose={() => setDraft(null)} />}
    </div>
  );
}
