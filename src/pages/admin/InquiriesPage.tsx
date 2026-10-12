import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INQUIRY_STATUSES, INQUIRY_TYPE_LABELS, INQUIRY_TYPES } from '@/services/inquiries';
import { formatDateTime } from '@/lib/dates';
import { useAuth } from '@/context/AuthContext';
import { Badge, Button, Card, inputCls, PageHeader, Spinner, STATUS_TONES, useToast, errorMessage } from './ui';
import { downloadFile, INQUIRY_LINKS, inquiryTopic, toCsv, useRealtimeInvalidation, useStaffDirectory, type InquiryWithLinks } from './data';

const PAGE_SIZE = 25;

export function InquiriesPage() {
  const toast = useToast();
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const staff = useStaffDirectory();

  const filters = {
    status: params.get('status') ?? 'open',
    type: params.get('type') ?? 'all',
    assignee: params.get('assignee') ?? 'all',
    q: params.get('q') ?? '',
    page: Math.max(1, Number(params.get('page') ?? 1)),
  };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'status' && value === 'open')) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const buildQuery = (forExport = false) => {
    let q = supabase.from('inquiries').select(INQUIRY_LINKS, { count: 'exact' }).order('created_at', { ascending: false });
    if (filters.status === 'open') q = q.in('status', ['New', 'In Progress', 'Responded']);
    else if (filters.status !== 'all') q = q.eq('status', filters.status as never);
    if (filters.type !== 'all') q = q.eq('type', filters.type as never);
    if (filters.assignee === 'me' && profile) q = q.eq('assigned_to', profile.id);
    else if (filters.assignee === 'none') q = q.is('assigned_to', null);
    else if (filters.assignee !== 'all') q = q.eq('assigned_to', filters.assignee);
    const term = filters.q.trim().replace(/[%,()]/g, ' ');
    if (term) q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,reference_code.ilike.%${term}%,organization.ilike.%${term}%`);
    if (!forExport) q = q.range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1);
    return q;
  };

  const queryKey = ['admin', 'inquiries', filters];
  const list = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error, count } = await buildQuery();
      if (error) throw error;
      return { rows: data as unknown as InquiryWithLinks[], count: count ?? 0 };
    },
  });
  useRealtimeInvalidation('inquiries', [['admin', 'inquiries'], ['admin', 'dashboard']]);

  const pages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE_SIZE));

  const exportCsv = async () => {
    const { data, error } = await buildQuery(true).limit(5000);
    if (error) return toast.error(errorMessage(error));
    const rows = (data as unknown as InquiryWithLinks[]).map((i) => ({
      reference: i.reference_code,
      received: formatDateTime(i.created_at),
      type: INQUIRY_TYPE_LABELS[i.type],
      status: i.status,
      name: i.full_name,
      organisation: i.organization ?? '',
      phone: i.phone,
      email: i.email,
      about: inquiryTopic(i),
      date: i.event_date ?? i.check_in_date ?? i.preferred_date ?? '',
      people: i.attendees_count ?? i.guests_count ?? i.participants_count ?? i.product_quantity ?? '',
      assigned_to: i.assignee?.full_name ?? '',
      message: i.message,
    }));
    downloadFile(`wws-inquiries-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  };

  const staffOptions = useMemo(() => (staff.data ?? []).filter((s) => s.is_active), [staff.data]);

  return (
    <div>
      <PageHeader
        title="Inquiries"
        subtitle="Requests from the website. You see the departments your role covers."
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <Card className="p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="relative block lg:col-span-1">
            <span className="sr-only">Search</span>
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              defaultValue={filters.q}
              placeholder="Name, phone, email or reference"
              className={`${inputCls} pl-9`}
              onKeyDown={(e) => e.key === 'Enter' && set('q', (e.target as HTMLInputElement).value)}
              onBlur={(e) => e.target.value !== filters.q && set('q', e.target.value)}
            />
          </label>
          <select aria-label="Status" className={inputCls} value={filters.status} onChange={(e) => set('status', e.target.value)}>
            <option value="open">Open (new, in progress, responded)</option>
            <option value="all">All statuses</option>
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select aria-label="Type" className={inputCls} value={filters.type} onChange={(e) => set('type', e.target.value)}>
            <option value="all">All types</option>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {INQUIRY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select aria-label="Assigned to" className={inputCls} value={filters.assignee} onChange={(e) => set('assignee', e.target.value)}>
            <option value="all">Anyone</option>
            <option value="me">Assigned to me</option>
            <option value="none">Unassigned</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {list.isPending ? (
        <Spinner />
      ) : list.isError ? (
        <Card className="p-6 text-sm text-rose-700">{errorMessage(list.error)}</Card>
      ) : list.data.rows.length === 0 ? (
        <Card className="p-12 text-center text-sm text-stone-500">No inquiries match these filters.</Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {list.data.rows.map((i) => (
                <li key={i.id}>
                  <Link
                    to={`/admin/inquiries/${i.id}`}
                    className={`block p-4 hover:bg-stone-50 transition-colors ${i.status === 'New' ? 'bg-amber-50/40' : ''}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={STATUS_TONES[i.status]}>{i.status}</Badge>
                      <Badge>{INQUIRY_TYPE_LABELS[i.type]}</Badge>
                      <span className="font-mono text-[11px] text-stone-400">{i.reference_code}</span>
                      <span className="text-xs text-stone-400 ml-auto">{formatDateTime(i.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold text-stone-900">{i.full_name}</span>
                      {i.organization && <span className="text-xs text-stone-500">({i.organization})</span>}
                    </div>
                    <div className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                      {[inquiryTopic(i), i.event_date ?? i.check_in_date ?? i.preferred_date, i.message].filter(Boolean).join(' · ')}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">{i.assignee ? `Assigned to ${i.assignee.full_name}` : 'Unassigned'}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <div className="mt-4 flex items-center justify-between text-xs text-stone-600">
            <span>
              {list.data.count} inquir{list.data.count === 1 ? 'y' : 'ies'}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" disabled={filters.page <= 1} onClick={() => set('page', String(filters.page - 1))} aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>
                Page {filters.page} of {pages}
              </span>
              <Button size="sm" variant="secondary" disabled={filters.page >= pages} onClick={() => set('page', String(filters.page + 1))} aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
