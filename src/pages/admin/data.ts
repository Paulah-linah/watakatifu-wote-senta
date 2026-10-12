import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type Inquiry = Tables<'inquiries'>;
export type InquiryActivity = Tables<'inquiry_activity'> & { author: { full_name: string } | null };
export type Booking = Tables<'facility_bookings'>;

export const INQUIRY_LINKS =
  '*, facility:facilities(id, name), accommodation:accommodation_options(name), catering:catering_services(title), retreat:retreats(title), formation:formation_programs(title), event:events(title, event_date), product:products(name, sku), assignee:staff_profiles!inquiries_assigned_to_fkey(id, full_name)';

export type InquiryWithLinks = Inquiry & {
  facility: { id: string; name: string } | null;
  accommodation: { name: string } | null;
  catering: { title: string } | null;
  retreat: { title: string } | null;
  formation: { title: string } | null;
  event: { title: string; event_date: string } | null;
  product: { name: string; sku: string } | null;
  assignee: { id: string; full_name: string } | null;
};

/** Short human description of what an inquiry is about. */
export const inquiryTopic = (i: InquiryWithLinks): string =>
  i.facility?.name ??
  i.accommodation?.name ??
  i.catering?.title ??
  i.retreat?.title ??
  i.formation?.title ??
  i.event?.title ??
  i.product?.name ??
  i.subject ??
  '';

export function useStaffDirectory() {
  return useQuery({
    queryKey: ['admin', 'staff-directory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('staff_profiles').select('id, full_name, role, is_active, email, title, phone').order('full_name');
      if (error) throw error;
      return data;
    },
  });
}

/** Keeps admin lists fresh when inquiries or bookings change anywhere. */
export function useRealtimeInvalidation(table: 'inquiries' | 'facility_bookings' | 'inquiry_activity', keys: unknown[][]) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`admin-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, qc]);
}

export const toCsv = (rows: Record<string, unknown>[]): string => {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
};

export const downloadFile = (name: string, content: string, type = 'text/csv') => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
