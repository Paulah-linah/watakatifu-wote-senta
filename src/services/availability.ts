import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Enums } from '@/lib/database.types';

export type TimeSlot = Enums<'time_slot'>;
export type BookingStatus = Enums<'availability_status'>;
export type AvailabilityRow = { facility_id: string; booking_date: string; time_slot: TimeSlot; status: BookingStatus };

/** Overall state of one hall on one day, derived from its slot bookings. */
export type DayStatus = 'AVAILABLE' | 'PARTIAL' | BookingStatus;

export const PART_SLOTS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING'];

export function useAvailability(from: string, to: string) {
  return useQuery({
    queryKey: ['public', 'availability', from, to],
    refetchInterval: 60_000,
    queryFn: async (): Promise<AvailabilityRow[]> => {
      const { data, error } = await supabase.rpc('get_facility_availability', { p_from: from, p_to: to });
      if (error) throw error;
      return data;
    },
  });
}

const severity: Record<BookingStatus, number> = { PENDING: 1, BLOCKED: 2, BOOKED: 3 };

export function dayStatus(rows: AvailabilityRow[], facilityId: string, date: string) {
  const entries = rows.filter((r) => r.facility_id === facilityId && r.booking_date === date);
  const fullDay = entries.find((r) => r.time_slot === 'FULL_DAY');
  const slots = Object.fromEntries(
    PART_SLOTS.map((s) => [s, fullDay?.status ?? entries.find((r) => r.time_slot === s)?.status ?? null])
  ) as Record<Exclude<TimeSlot, 'FULL_DAY'>, BookingStatus | null>;

  let status: DayStatus = 'AVAILABLE';
  if (fullDay) status = fullDay.status;
  else if (entries.length === PART_SLOTS.length)
    status = entries.reduce((a, b) => (severity[b.status] > severity[a.status] ? b : a)).status;
  else if (entries.length > 0) status = 'PARTIAL';

  return { status, slots };
}

/** Whether a requested slot collides with existing bookings (FULL_DAY collides with everything). */
export function slotTaken(rows: AvailabilityRow[], facilityId: string, date: string, slot: TimeSlot): BookingStatus | null {
  const hit = rows.find(
    (r) =>
      r.facility_id === facilityId &&
      r.booking_date === date &&
      (r.time_slot === slot || r.time_slot === 'FULL_DAY' || slot === 'FULL_DAY')
  );
  return hit?.status ?? null;
}
