import { supabase } from '@/lib/supabase';
import type { Enums, Json } from '@/lib/database.types';
import type { TimeSlot } from './availability';

export type InquiryType = Enums<'inquiry_type'>;
export type InquiryStatus = Enums<'inquiry_status'>;

export const INQUIRY_TYPES: InquiryType[] = ['conference', 'accommodation', 'catering', 'retreat', 'formation', 'event', 'product', 'general'];

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  conference: 'Conference Hall',
  accommodation: 'Accommodation',
  catering: 'Catering',
  retreat: 'Retreat',
  formation: 'Formation / Seminar',
  event: 'Event Registration',
  product: 'Product',
  general: 'General Inquiry',
};

export const INQUIRY_STATUSES: InquiryStatus[] = ['New', 'In Progress', 'Responded', 'Completed', 'Cancelled'];

export const isInquiryType = (v: unknown): v is InquiryType => INQUIRY_TYPES.includes(v as InquiryType);

/** Values any page can pass when opening the inquiry form. */
export interface InquiryPrefill {
  facilityId?: string;
  date?: string;
  timeSlot?: TimeSlot;
  attendees?: number;
  accommodationId?: string;
  cateringId?: string;
  retreatId?: string;
  formationId?: string;
  eventId?: string;
  productId?: string;
  quantity?: number;
  subject?: string;
}

export interface SubmitResult {
  reference_code: string;
  id: string;
}

export async function submitInquiry(payload: Record<string, unknown>): Promise<SubmitResult> {
  const { data, error } = await supabase.rpc('submit_inquiry', { payload: payload as Json });
  if (error) throw new Error(error.message || 'Could not send your inquiry. Please try again.');
  return data as unknown as SubmitResult;
}
