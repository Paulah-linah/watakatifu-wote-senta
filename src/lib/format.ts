import type { SiteSettings } from '@/services/content';

export const formatKes = (amount: number | null | undefined, fallback = 'Price on inquiry'): string =>
  amount == null ? fallback : `KES ${Number(amount).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export const telHref = (phone: string): string => `tel:${phone.replace(/[^+0-9]/g, '')}`;

export const whatsappHref = (settings: Pick<SiteSettings, 'whatsapp_number' | 'whatsapp_message'>, message?: string): string =>
  `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message ?? settings.whatsapp_message)}`;

/** WhatsApp link for an arbitrary visitor phone number, assuming Kenyan numbers when no country code is given. */
export const whatsappForPhone = (phone: string): string => {
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
};

export const TIME_SLOT_LABELS = {
  FULL_DAY: 'Full day',
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
} as const;

export const shortHallName = (name: string): string => name.replace(/ (Conference|Main) Hall$/, '');
