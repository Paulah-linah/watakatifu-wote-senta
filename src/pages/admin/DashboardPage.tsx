import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, CalendarRange, Inbox, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { INQUIRY_TYPE_LABELS } from '@/services/inquiries';
import { addDays, formatDate, formatDateTime, todayISO } from '@/lib/dates';
import { TIME_SLOT_LABELS } from '@/lib/format';
import { Badge, BOOKING_TONES, Card, PageHeader, Spinner, STATUS_TONES } from './ui';
import { INQUIRY_LINKS, inquiryTopic, useRealtimeInvalidation, type InquiryWithLinks } from './data';

const Stat: React.FC<{ to: string; label: string; value: number | undefined; icon: React.ComponentType<{ className?: string }>; tone: string }> = ({
  to,
  label,
  value,
  icon: Icon,
  tone,
}) => (
  <Link to={to} className="block">
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="text-2xl font-bold text-stone-900">{value ?? '–'}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </Card>
  </Link>
);

export function DashboardPage() {
  const { profile, can } = useAuth();
  const today = todayISO();
  const weekEnd = addDays(today, 6);

  const stats = useQuery({
    queryKey: ['admin', 'dashboard', profile?.id],
    queryFn: async () => {
      const count = async (q: PromiseLike<{ count: number | null; error: unknown }>) => {
        const { count: c, error } = await q;
        if (error) throw error;
        return c ?? 0;
      };
      const head = { count: 'exact' as const, head: true };
      const [newCount, openCount, mine, upcomingEvents] = await Promise.all([
        count(supabase.from('inquiries').select('id', head).eq('status', 'New')),
        count(supabase.from('inquiries').select('id', head).in('status', ['New', 'In Progress', 'Responded'])),
        count(supabase.from('inquiries').select('id', head).eq('assigned_to', profile!.id).in('status', ['New', 'In Progress', 'Responded'])),
        count(supabase.from('events').select('id', head).gte('event_date', today)),
      ]);
      const { data: recent, error } = await supabase.from('inquiries').select(INQUIRY_LINKS).order('created_at', { ascending: false }).limit(6);
      if (error) throw error;
      return { newCount, openCount, mine, upcomingEvents, recent: recent as unknown as InquiryWithLinks[] };
    },
  });

  const bookings = useQuery({
    queryKey: ['admin', 'bookings', 'week', today],
    enabled: can('bookings_read'),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facility_bookings')
        .select('*, facility:facilities(name)')
        .gte('booking_date', today)
        .lte('booking_date', weekEnd)
        .order('booking_date');
      if (error) throw error;
      return data;
    },
  });

  useRealtimeInvalidation('inquiries', [['admin', 'dashboard']]);

  return (
    <div>
      <PageHeader title={`Welcome, ${profile?.full_name.split(' ')[0] ?? ''}`} subtitle="Here is what needs attention today." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat to="/admin/inquiries?status=New" label="New inquiries" value={stats.data?.newCount} icon={Inbox} tone="bg-amber-100 text-amber-800" />
        <Stat to="/admin/inquiries" label="Open inquiries" value={stats.data?.openCount} icon={Inbox} tone="bg-sky-100 text-sky-800" />
        <Stat to="/admin/inquiries?assignee=me" label="Assigned to me" value={stats.data?.mine} icon={UserCheck} tone="bg-purple-100 text-purple-800" />
        <Stat
          to={can('events') ? '/admin/content/events' : '/admin'}
          label="Upcoming events"
          value={stats.data?.upcomingEvents}
          icon={CalendarDays}
          tone="bg-emerald-100 text-emerald-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold">Latest inquiries</h2>
            <Link to="/admin/inquiries" className="text-xs font-semibold text-sky-700 inline-flex items-center gap-1">
              All inquiries <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats.isPending ? (
            <Spinner />
          ) : !stats.data?.recent.length ? (
            <p className="text-sm text-stone-500">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {stats.data.recent.map((i) => (
                <li key={i.id}>
                  <Link to={`/admin/inquiries/${i.id}`} className="block py-2.5 hover:bg-stone-50 -mx-2 px-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_TONES[i.status]}>{i.status}</Badge>
                      <span className="text-sm font-semibold truncate">{i.full_name}</span>
                      <span className="ml-auto text-[11px] text-stone-400 shrink-0">{formatDateTime(i.created_at)}</span>
                    </div>
                    <div className="text-xs text-stone-500 truncate">
                      {INQUIRY_TYPE_LABELS[i.type]} · {inquiryTopic(i)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {can('bookings_read') && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg font-bold">Hall bookings this week</h2>
              <Link to="/admin/calendar" className="text-xs font-semibold text-sky-700 inline-flex items-center gap-1">
                Calendar <CalendarRange className="w-3.5 h-3.5" />
              </Link>
            </div>
            {bookings.isPending ? (
              <Spinner />
            ) : !bookings.data?.length ? (
              <p className="text-sm text-stone-500">No bookings in the next 7 days.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {bookings.data.map((b) => (
                  <li key={b.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 text-xs text-stone-500">{formatDate(b.booking_date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="flex-1 min-w-0 truncate">
                      <strong>{(b.facility as { name: string } | null)?.name}</strong> · {TIME_SLOT_LABELS[b.time_slot]}
                      {b.client_name && <span className="text-stone-500"> · {b.client_name}</span>}
                    </span>
                    <Badge className={BOOKING_TONES[b.status]}>{b.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
