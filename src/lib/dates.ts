// All "today" logic follows the centre's timezone, not the visitor's or UTC.
export const TIME_ZONE = 'Africa/Nairobi';

const isoFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Today's date in Nairobi as YYYY-MM-DD. */
export const todayISO = (): string => isoFormatter.format(new Date());

/** Adds whole days to a YYYY-MM-DD string. */
export const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const isPastDate = (iso: string): boolean => iso < todayISO();

/** Formats a YYYY-MM-DD date without timezone drift. */
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });

export const formatDateTime = (ts: string): string =>
  new Date(ts).toLocaleString('en-GB', { timeZone: TIME_ZONE, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** "09:30:00" -> "9:30 AM" */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};
