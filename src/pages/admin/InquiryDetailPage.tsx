import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarPlus, Mail, MessageSquare, Phone, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useFacilities } from '@/services/content';
import { INQUIRY_STATUSES, INQUIRY_TYPE_LABELS, type InquiryStatus } from '@/services/inquiries';
import type { BookingStatus, TimeSlot } from '@/services/availability';
import { formatDate, formatDateTime, formatTime } from '@/lib/dates';
import { TIME_SLOT_LABELS, whatsappForPhone } from '@/lib/format';
import { Modal } from '@/components/common/Modal';
import { Badge, Button, Card, errorMessage, FieldLabel, inputCls, Spinner, STATUS_TONES, useConfirm, useToast } from './ui';
import { INQUIRY_LINKS, inquiryTopic, useRealtimeInvalidation, useStaffDirectory, type InquiryActivity, type InquiryWithLinks } from './data';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) =>
  value === null || value === undefined || value === '' ? null : (
    <div className="flex gap-3 py-1.5 text-sm">
      <dt className="w-40 shrink-0 text-stone-500">{label}</dt>
      <dd className="text-stone-900 font-medium min-w-0 break-words">{value}</dd>
    </div>
  );

function ConvertToBookingDialog({ inquiry, open, onClose }: { inquiry: InquiryWithLinks; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const facilities = useFacilities();
  const [facilityId, setFacilityId] = useState(inquiry.facility_id ?? '');
  const [date, setDate] = useState(inquiry.event_date ?? inquiry.preferred_date ?? '');
  const [slot, setSlot] = useState<TimeSlot>(inquiry.time_slot ?? 'FULL_DAY');
  const [status, setStatus] = useState<BookingStatus>('PENDING');

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('convert_inquiry_to_booking', {
        p_inquiry_id: inquiry.id,
        p_facility_id: facilityId,
        p_booking_date: date,
        p_time_slot: slot,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Booking added to the hall calendar.');
      qc.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Modal isOpen={open} onClose={onClose} title="Add to hall calendar" maxWidth="md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <FieldLabel label="Hall" htmlFor="cv-hall" required>
          <select id="cv-hall" required className={inputCls} value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
            <option value="">Choose a hall</option>
            {facilities.data?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Date" htmlFor="cv-date" required>
            <input id="cv-date" type="date" required className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </FieldLabel>
          <FieldLabel label="Session" htmlFor="cv-slot">
            <select id="cv-slot" className={inputCls} value={slot} onChange={(e) => setSlot(e.target.value as TimeSlot)}>
              {Object.entries(TIME_SLOT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
        <FieldLabel label="Calendar status" htmlFor="cv-status" hint="Pending = tentative hold. Booked = confirmed.">
          <select id="cv-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
            <option value="PENDING">Pending (tentative hold)</option>
            <option value="BOOKED">Booked (confirmed)</option>
          </select>
        </FieldLabel>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Add booking
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function InquiryDetailPage() {
  const { id = '' } = useParams();
  const { profile, can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const staff = useStaffDirectory();
  const { confirm, dialog } = useConfirm();
  const [note, setNote] = useState('');
  const [convertOpen, setConvertOpen] = useState(false);

  const inquiry = useQuery({
    queryKey: ['admin', 'inquiry', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('inquiries').select(INQUIRY_LINKS).eq('id', id).maybeSingle();
      if (error) throw error;
      return data as unknown as InquiryWithLinks | null;
    },
  });
  const activity = useQuery({
    queryKey: ['admin', 'inquiry-activity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiry_activity')
        .select('*, author:staff_profiles(full_name)')
        .eq('inquiry_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as InquiryActivity[];
    },
  });
  useRealtimeInvalidation('inquiry_activity', [['admin', 'inquiry-activity', id]]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'inquiry', id] });
    qc.invalidateQueries({ queryKey: ['admin', 'inquiry-activity', id] });
    qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  const update = useMutation({
    mutationFn: async (patch: { status?: InquiryStatus; assigned_to?: string | null }) => {
      const { error } = await supabase.from('inquiries').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inquiry updated.');
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('inquiry_activity').insert({ inquiry_id: id, author_id: profile!.id, kind: 'note', body: note.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote('');
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = async () => {
    if (!(await confirm('Permanently delete this inquiry and its notes? This cannot be undone.'))) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) return toast.error(errorMessage(error));
    toast.success('Inquiry deleted.');
    qc.invalidateQueries({ queryKey: ['admin'] });
    navigate('/admin/inquiries');
  };

  if (inquiry.isPending) return <Spinner />;
  if (inquiry.isError) return <Card className="p-6 text-sm text-rose-700">{errorMessage(inquiry.error)}</Card>;
  const i = inquiry.data;
  if (!i)
    return (
      <Card className="p-8 text-center text-sm text-stone-600">
        This inquiry doesn&apos;t exist or isn&apos;t in your department.{' '}
        <Link to="/admin/inquiries" className="text-sky-700 font-semibold">
          Back to inquiries
        </Link>
      </Card>
    );

  const emailSubject = encodeURIComponent(`Your inquiry ${i.reference_code}: Watakatifu Wote Senta`);

  return (
    <div>
      {dialog}
      <Link to="/admin/inquiries" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> All inquiries
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className={STATUS_TONES[i.status]}>{i.status}</Badge>
            <Badge>{INQUIRY_TYPE_LABELS[i.type]}</Badge>
            <span className="font-mono text-xs text-stone-500">{i.reference_code}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">{i.full_name}</h1>
          <p className="text-sm text-stone-500">
            {i.organization && `${i.organization} · `}Received {formatDateTime(i.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold">
            <Phone className="w-4 h-4" /> Call
          </a>
          <a
            href={whatsappForPhone(i.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>
          <a
            href={`mailto:${i.email}?subject=${emailSubject}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-sm font-semibold"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="font-serif text-lg font-bold mb-2">Request details</h2>
            <dl className="divide-y divide-stone-100">
              <Row label="About" value={inquiryTopic(i)} />
              <Row label="Subject" value={i.subject !== inquiryTopic(i) ? i.subject : null} />
              <Row label="Date" value={i.event_date && formatDate(i.event_date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} />
              <Row label="Session" value={i.time_slot && TIME_SLOT_LABELS[i.time_slot]} />
              <Row label="Time" value={i.start_time && `${formatTime(i.start_time)} – ${formatTime(i.end_time)}`} />
              <Row label="Attendees" value={i.attendees_count} />
              <Row label="Seating" value={i.seating_arrangement} />
              <Row label="Equipment / needs" value={i.additional_requirements} />
              <Row label="Check-in" value={i.check_in_date && formatDate(i.check_in_date)} />
              <Row label="Check-out" value={i.check_out_date && formatDate(i.check_out_date)} />
              <Row label="Guests" value={i.guests_count} />
              <Row label="Type of event" value={i.event_nature} />
              <Row label="Retreat format" value={i.retreat_format} />
              <Row label="Preferred date" value={i.preferred_date && formatDate(i.preferred_date)} />
              <Row label="Participants" value={i.participants_count} />
              <Row label="Product code" value={i.product?.sku} />
              <Row label="Quantity" value={i.product_quantity} />
              <Row label="Phone" value={i.phone} />
              <Row label="Email" value={i.email} />
            </dl>
            {i.message && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-stone-500 mb-1">Message</div>
                <p className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 whitespace-pre-wrap">{i.message}</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-lg font-bold mb-3">Notes & activity</h2>
            <form
              className="space-y-2 mb-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim()) addNote.mutate();
              }}
            >
              <label htmlFor="note" className="sr-only">
                Add a note
              </label>
              <textarea
                id="note"
                rows={3}
                className={inputCls}
                placeholder="Quote sent, deposit received, call back on Friday…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={addNote.isPending} disabled={!note.trim()}>
                  <Send className="w-3.5 h-3.5" /> Add note
                </Button>
              </div>
            </form>
            {activity.data?.length ? (
              <ol className="space-y-3">
                {activity.data.map((a) => (
                  <li key={a.id} className="text-sm border-l-2 border-stone-200 pl-3">
                    <div className="text-[11px] text-stone-400">
                      {formatDateTime(a.created_at)} · {a.author?.full_name ?? 'System'}
                    </div>
                    <div className="text-stone-800">
                      {a.kind === 'status_change' && (
                        <>
                          Status changed from <strong>{a.from_status}</strong> to <strong>{a.to_status}</strong>
                        </>
                      )}
                      {a.kind === 'assignment' && (
                        <>
                          Assigned to <strong>{a.body}</strong>
                        </>
                      )}
                      {a.kind === 'booking_created' && <>📅 {a.body}</>}
                      {a.kind === 'note' && <span className="whitespace-pre-wrap">{a.body}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-stone-500">No notes yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <FieldLabel label="Status" htmlFor="inq-status">
              <select
                id="inq-status"
                className={inputCls}
                value={i.status}
                disabled={update.isPending}
                onChange={(e) => update.mutate({ status: e.target.value as InquiryStatus })}
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label="Assigned to" htmlFor="inq-assignee">
              <select
                id="inq-assignee"
                className={inputCls}
                value={i.assigned_to ?? ''}
                disabled={update.isPending}
                onChange={(e) => update.mutate({ assigned_to: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {staff.data
                  ?.filter((s) => s.is_active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
              </select>
            </FieldLabel>
            {profile && i.assigned_to !== profile.id && (
              <Button variant="secondary" size="sm" className="w-full" onClick={() => update.mutate({ assigned_to: profile.id })}>
                Assign to me
              </Button>
            )}
            {i.responded_at && <p className="text-[11px] text-stone-500">First marked responded {formatDateTime(i.responded_at)}</p>}
          </Card>

          {can('bookings') && (i.type === 'conference' || i.facility_id) && (
            <Card className="p-5">
              <h2 className="font-serif text-base font-bold mb-1">Hall booking</h2>
              <p className="text-xs text-stone-500 mb-3">Place a pending hold or confirmed booking on the public availability calendar.</p>
              <Button className="w-full" onClick={() => setConvertOpen(true)}>
                <CalendarPlus className="w-4 h-4" /> Add to hall calendar
              </Button>
            </Card>
          )}

          {can('settings') && (
            <Button variant="ghost" size="sm" className="text-rose-700 w-full" onClick={remove}>
              <Trash2 className="w-3.5 h-3.5" /> Delete inquiry
            </Button>
          )}
        </div>
      </div>

      {convertOpen && <ConvertToBookingDialog inquiry={i} open={convertOpen} onClose={() => setConvertOpen(false)} />}
    </div>
  );
}
