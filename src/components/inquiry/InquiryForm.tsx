import React, { useMemo, useState } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Bed,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle,
  GraduationCap,
  HelpCircle,
  Info,
  Loader2,
  Mail,
  Phone,
  Send,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import {
  useAccommodation,
  useCatering,
  useEvents,
  useFacilities,
  useFormation,
  useProducts,
  useRetreats,
  useSiteSettings,
} from '@/services/content';
import { slotTaken, useAvailability } from '@/services/availability';
import { INQUIRY_TYPE_LABELS, submitInquiry, type InquiryPrefill, type InquiryType } from '@/services/inquiries';
import { formatDate, todayISO } from '@/lib/dates';
import { PaymentDetails } from '@/components/payment/PaymentDetails';
import { formatKes, shortHallName, telHref, TIME_SLOT_LABELS } from '@/lib/format';

// ---------------------------------------------------------------------------
// Validation (mirrors the checks in the submit_inquiry database function)
// ---------------------------------------------------------------------------
const CUSTOM_RETREAT = 'custom';
const text = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);
const intText = z.string().trim().refine((v) => v === '' || /^\d{1,5}$/.test(v), 'Please enter a whole number.');

const schema = z
  .object({
    type: z.enum(['conference', 'accommodation', 'catering', 'retreat', 'formation', 'event', 'product', 'general']),
    full_name: text(120).min(2, 'Please enter your full name.'),
    phone: z
      .string()
      .trim()
      .refine((v) => /^[0-9]{9,15}$/.test(v.replace(/[^0-9]/g, '')), 'Please enter a valid phone number.'),
    email: z.string().trim().email('Please enter a valid email address.'),
    organization: text(160),
    message: text(4000),
    website: z.string(), // honeypot
    subject: text(200),
    facility_id: z.string(),
    event_date: z.string(),
    time_slot: z.enum(['FULL_DAY', 'MORNING', 'AFTERNOON', 'EVENING']),
    start_time: z.string(),
    end_time: z.string(),
    attendees_count: intText,
    seating_arrangement: z.string(),
    additional_requirements: text(1000),
    accommodation_id: z.string(),
    check_in_date: z.string(),
    check_out_date: z.string(),
    guests_count: intText,
    catering_service_id: z.string(),
    event_nature: text(200),
    retreat_id: z.string(),
    retreat_format: z.enum(['Individual', 'Group']),
    preferred_date: z.string(),
    participants_count: intText,
    formation_id: z.string(),
    event_id: z.string(),
    product_id: z.string(),
    product_quantity: intText,
  })
  .superRefine((v, ctx) => {
    const req = (path: keyof typeof v, message: string) => {
      if (!String(v[path] ?? '').trim()) ctx.addIssue({ code: 'custom', path: [path], message });
    };
    const notPast = (path: keyof typeof v) => {
      const val = String(v[path] ?? '');
      if (val && val < todayISO()) ctx.addIssue({ code: 'custom', path: [path], message: 'Date cannot be in the past.' });
    };
    switch (v.type) {
      case 'conference':
        req('facility_id', 'Please choose a hall.');
        req('event_date', 'Please choose a date.');
        if (v.start_time && v.end_time && v.end_time <= v.start_time)
          ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'End time must be after start time.' });
        break;
      case 'accommodation':
        req('check_in_date', 'Please choose a check-in date.');
        req('check_out_date', 'Please choose a check-out date.');
        if (v.check_in_date && v.check_out_date && v.check_out_date < v.check_in_date)
          ctx.addIssue({ code: 'custom', path: ['check_out_date'], message: 'Check-out must be on or after check-in.' });
        break;
      case 'retreat':
        req('retreat_id', 'Please choose a retreat.');
        break;
      case 'formation':
        req('formation_id', 'Please choose a programme.');
        break;
      case 'event':
        req('event_id', 'Please choose an event.');
        break;
      case 'product':
        req('product_id', 'Please choose a product.');
        break;
      case 'general':
        req('subject', 'Please enter a subject.');
        break;
    }
    notPast('event_date');
    notPast('check_in_date');
    notPast('preferred_date');
  });

type FormValues = z.infer<typeof schema>;

const TYPE_TABS: { type: InquiryType; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'conference', label: 'Conference hall', hint: 'Meetings & seminars', icon: Building2 },
  { type: 'accommodation', label: 'Accommodation', hint: 'Rooms & apartments', icon: Bed },
  { type: 'catering', label: 'Catering', hint: 'Meals & events', icon: Utensils },
  { type: 'retreat', label: 'Retreat', hint: 'Individual or group', icon: BookOpen },
  { type: 'formation', label: 'Formation', hint: 'Seminars & courses', icon: GraduationCap },
  { type: 'event', label: 'Event', hint: 'Register to attend', icon: CalendarDays },
  { type: 'product', label: 'Bookshop', hint: 'Books & gifts', icon: ShoppingBag },
  { type: 'general', label: 'Other', hint: 'Any question', icon: HelpCircle },
];

/** Numbered step heading used to break the form into clear parts. */
const StepHeading: React.FC<{ n: number; title: string; description?: string }> = ({ n, title, description }) => (
  <div className="flex items-start gap-3.5">
    <span className="mt-0.5 inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-sky-800 text-white text-sm font-bold">{n}</span>
    <div>
      <h3 className="font-serif text-2xl font-semibold text-sky-950 leading-tight">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Small field helpers
// ---------------------------------------------------------------------------
const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-sand bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-hidden focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 aria-[invalid=true]:border-rose-400';

const Field: React.FC<{ label: string; name: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }> = ({
  label,
  name,
  required,
  error,
  hint,
  children,
}) => (
  <div>
    <label htmlFor={`inq-${name}`} className="block font-semibold text-stone-700 mb-1.5 text-sm">
      {label} {required && <span className="text-rose-500" aria-hidden>*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
    {error && (
      <p id={`inq-${name}-error`} className="mt-1 text-[11px] text-rose-600" role="alert">
        {error}
      </p>
    )}
  </div>
);

const fieldProps = (name: string, reg: UseFormRegisterReturn, error?: string) => ({
  id: `inq-${name}`,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `inq-${name}-error` : undefined,
  className: inputClass,
  ...reg,
});

const Section: React.FC<{ step: number; tone?: string; title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; note?: string }> = ({
  step,
  title,
  children,
  note,
}) => (
  <fieldset className="space-y-5">
    <legend className="sr-only">{title}</legend>
    <StepHeading n={step} title={title} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 sm:pl-11">{children}</div>
    {note && (
      <p className="sm:ml-11 flex items-start gap-2 rounded-xl bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
        <Info className="w-4 h-4 shrink-0 mt-px" />
        {note}
      </p>
    )}
  </fieldset>
);

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
interface InquiryFormProps {
  initialType?: InquiryType;
  prefill?: InquiryPrefill;
  source?: 'web' | 'modal' | 'contact';
  onClose?: () => void;
  /** Hide the type selector (e.g. Contact page fixed to general). */
  lockType?: boolean;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ initialType = 'conference', prefill = {}, source = 'web', onClose, lockType }) => {
  const { settings } = useSiteSettings();
  const facilities = useFacilities();
  const accommodation = useAccommodation();
  const catering = useCatering();
  const retreats = useRetreats();
  const formation = useFormation();
  const events = useEvents();
  const products = useProducts();

  const [result, setResult] = useState<{ reference: string; name: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const today = todayISO();

  const defaultValues: FormValues = {
    type: initialType,
    full_name: '',
    phone: '',
    email: '',
    organization: '',
    message: '',
    website: '',
    subject: prefill.subject ?? '',
    facility_id: prefill.facilityId ?? '',
    event_date: prefill.date ?? '',
    time_slot: prefill.timeSlot ?? 'FULL_DAY',
    start_time: '08:30',
    end_time: '16:30',
    attendees_count: prefill.attendees ? String(prefill.attendees) : '',
    seating_arrangement: 'Classroom',
    additional_requirements: '',
    accommodation_id: prefill.accommodationId ?? '',
    check_in_date: prefill.date ?? '',
    check_out_date: '',
    guests_count: '1',
    catering_service_id: prefill.cateringId ?? '',
    event_nature: '',
    retreat_id: prefill.retreatId ?? '',
    retreat_format: 'Individual',
    preferred_date: prefill.date ?? '',
    participants_count: '1',
    formation_id: prefill.formationId ?? '',
    event_id: prefill.eventId ?? '',
    product_id: prefill.productId ?? '',
    product_quantity: prefill.quantity ? String(prefill.quantity) : '1',
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched' });

  const type = useWatch({ control, name: 'type' });
  const facilityId = useWatch({ control, name: 'facility_id' });
  const eventDate = useWatch({ control, name: 'event_date' });
  const timeSlot = useWatch({ control, name: 'time_slot' });
  const checkIn = useWatch({ control, name: 'check_in_date' });

  // Live slot check for conference requests.
  const availability = useAvailability(eventDate || today, eventDate || today);
  const takenStatus =
    type === 'conference' && facilityId && eventDate && availability.data ? slotTaken(availability.data, facilityId, eventDate, timeSlot) : null;
  const selectedFacility = facilities.data?.find((f) => f.id === facilityId);

  const upcomingEvents = useMemo(
    () => (events.data ?? []).filter((e) => e.event_date >= today && e.registration_open),
    [events.data, today]
  );

  const detailStep = lockType ? 1 : 2;
  const inModal = source === 'modal';
  const err = (name: keyof FormValues) => errors[name]?.message;
  const reg = (name: keyof FormValues) => fieldProps(name, register(name), err(name));

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    const int = (s: string) => (s.trim() === '' ? null : Number(s));
    const byType: Record<InquiryType, Record<string, unknown>> = {
      conference: {
        facility_id: v.facility_id,
        event_date: v.event_date,
        time_slot: v.time_slot,
        start_time: v.start_time || null,
        end_time: v.end_time || null,
        attendees_count: int(v.attendees_count),
        seating_arrangement: v.seating_arrangement,
        additional_requirements: v.additional_requirements,
      },
      accommodation: {
        accommodation_id: v.accommodation_id || null,
        check_in_date: v.check_in_date,
        check_out_date: v.check_out_date,
        guests_count: int(v.guests_count),
      },
      catering: {
        catering_service_id: v.catering_service_id || null,
        event_date: v.event_date || null,
        attendees_count: int(v.attendees_count),
        event_nature: v.event_nature,
      },
      retreat: {
        retreat_id: v.retreat_id === CUSTOM_RETREAT ? null : v.retreat_id,
        subject: v.retreat_id === CUSTOM_RETREAT ? 'Custom group retreat' : undefined,
        retreat_format: v.retreat_format,
        preferred_date: v.preferred_date || null,
        participants_count: int(v.participants_count),
      },
      formation: {
        formation_id: v.formation_id,
        preferred_date: v.preferred_date || null,
        participants_count: int(v.participants_count),
      },
      event: { event_id: v.event_id, participants_count: int(v.participants_count) },
      product: { product_id: v.product_id, product_quantity: int(v.product_quantity) },
      general: { subject: v.subject },
    };

    try {
      const res = await submitInquiry({
        type: v.type,
        full_name: v.full_name,
        phone: v.phone,
        email: v.email,
        organization: v.organization,
        message: v.message,
        website: v.website,
        subject: v.subject || undefined,
        ...byType[v.type],
        source,
        user_agent: navigator.userAgent,
      });
      setResult({ reference: res.reference_code, name: v.full_name });
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  // -------------------------------------------------------------------------
  if (result) {
    return (
      <div className={inModal ? '' : 'card p-5 sm:p-8'} role="status">
        <div className="text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="font-serif text-3xl font-semibold text-sky-950">Thank you, {result.name.split(' ')[0]}</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            We have received your inquiry. Our office will contact you by phone or email to confirm availability and the amount due.
          </p>
          <div className="mt-5 inline-flex flex-col items-center rounded-2xl bg-parchment border border-gold-300 px-6 py-3">
            <span className="text-[0.7rem] uppercase tracking-[0.16em] font-bold text-gold-600">Your reference</span>
            <span className="font-mono text-xl font-bold text-sky-950">{result.reference}</span>
          </div>
        </div>

        <PaymentDetails reference={result.reference} compact={inModal} className="mt-10 pt-8 border-t border-sand/70" />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-parchment px-5 py-4">
          <div className="text-sm text-stone-600 text-center sm:text-left">
            Need help sooner?{' '}
            <a href={telHref(settings.phone)} className="font-semibold text-sky-800 hover:underline">
              <Phone className="inline w-3.5 h-3.5 mr-1" />
              {settings.phone_display}
            </a>{' '}
            ·{' '}
            <a href={`mailto:${settings.email}`} className="font-semibold text-sky-800 hover:underline">
              <Mail className="inline w-3.5 h-3.5 mr-1" />
              Email us
            </a>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ ...defaultValues, type });
                setResult(null);
              }}
              className="btn btn-outline"
            >
              New inquiry
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-primary">
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={inModal ? '' : 'card p-5 sm:p-8'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
        {!lockType && (
          <fieldset className="space-y-5">
            <legend className="sr-only">What would you like to book or ask about?</legend>
            <StepHeading n={1} title="What do you need?" description="Choose one. You can send another inquiry afterwards." />
            <div role="radiogroup" aria-label="Inquiry type" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:pl-11">
              {TYPE_TABS.map(({ type: t, label, hint, icon: Icon }) => {
                const selected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setValue('type', t, { shouldValidate: false })}
                    className={`relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all ${
                      selected ? 'border-sky-700 bg-sky-50 ring-2 ring-sky-700/15' : 'border-sand bg-white hover:border-sky-300 hover:bg-parchment/60'
                    }`}
                  >
                    <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl ${selected ? 'bg-sky-800 text-white' : 'bg-parchment text-sky-800'}`}>
                      <Icon className="w-[1.1rem] h-[1.1rem]" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-sky-950 leading-tight">{label}</span>
                      <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>
                    </span>
                    {selected && <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-sky-700" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
        <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <label htmlFor="inq-website">Website</label>
          <input id="inq-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>

        {type === 'conference' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="Conference hall details" icon={Building2}>
            <Field label="Conference hall" name="facility_id" required error={err('facility_id')}>
              <select {...reg('facility_id')} disabled={facilities.isPending}>
                <option value="">{facilities.isPending ? 'Loading halls…' : 'Choose a hall'}</option>
                {facilities.data?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {shortHallName(f.name)} ({f.capacity_min}–{f.capacity_max} people, {formatKes(f.price_kes)})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Event date" name="event_date" required error={err('event_date')}>
              <input type="date" min={today} {...reg('event_date')} />
            </Field>
            <Field label="Session" name="time_slot" error={err('time_slot')}>
              <select {...reg('time_slot')}>
                {Object.entries(TIME_SLOT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Expected attendees"
              name="attendees_count"
              error={err('attendees_count')}
              hint={selectedFacility ? `${shortHallName(selectedFacility.name)} holds up to ${selectedFacility.capacity_max} people.` : undefined}
            >
              <input type="number" inputMode="numeric" min={1} max={selectedFacility?.capacity_max} placeholder="e.g. 45" {...reg('attendees_count')} />
            </Field>
            {takenStatus && (
              <div className="sm:col-span-2 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900" role="status">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This hall is already <strong>{takenStatus.toLowerCase()}</strong> for that session on {formatDate(eventDate)}. You can still send
                  the inquiry and we will suggest alternatives, or pick another hall, session or date.
                </span>
              </div>
            )}
            <Field label="Start time" name="start_time" error={err('start_time')}>
              <input type="time" {...reg('start_time')} />
            </Field>
            <Field label="End time" name="end_time" error={err('end_time')}>
              <input type="time" {...reg('end_time')} />
            </Field>
            <Field label="Seating arrangement" name="seating_arrangement">
              <select {...reg('seating_arrangement')}>
                {(selectedFacility?.seating_styles.length ? selectedFacility.seating_styles : ['Classroom', 'Boardroom']).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipment / additional needs" name="additional_requirements" error={err('additional_requirements')}>
              <input type="text" placeholder="Projector, PA system, tea breaks…" {...reg('additional_requirements')} />
            </Field>
          </Section>
        )}

        {type === 'accommodation' && (
          <Section step={detailStep}
            tone="bg-parchment border-sand/70"
            title="Accommodation details"
            icon={Bed}
            note="Accommodation is booked on inquiry. Room allocation and rates are confirmed by the hospitality office."
          >
            <Field label="Check-in date" name="check_in_date" required error={err('check_in_date')}>
              <input type="date" min={today} {...reg('check_in_date')} />
            </Field>
            <Field label="Check-out date" name="check_out_date" required error={err('check_out_date')}>
              <input type="date" min={checkIn || today} {...reg('check_out_date')} />
            </Field>
            <Field label="Number of guests" name="guests_count" error={err('guests_count')}>
              <input type="number" inputMode="numeric" min={1} {...reg('guests_count')} />
            </Field>
            <Field label="Accommodation preference" name="accommodation_id">
              <select {...reg('accommodation_id')}>
                <option value="">Not sure / please advise</option>
                {accommodation.data?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </Section>
        )}

        {type === 'catering' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="Catering details" icon={Utensils}>
            <Field label="Service" name="catering_service_id">
              <select {...reg('catering_service_id')}>
                <option value="">Not sure / please advise</option>
                {catering.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Event date" name="event_date" error={err('event_date')}>
              <input type="date" min={today} {...reg('event_date')} />
            </Field>
            <Field label="Estimated number of people" name="attendees_count" error={err('attendees_count')}>
              <input type="number" inputMode="numeric" min={1} placeholder="e.g. 50" {...reg('attendees_count')} />
            </Field>
            <Field label="Type of event" name="event_nature" error={err('event_nature')}>
              <input type="text" placeholder="e.g. diocesan meeting, reception, seminar" {...reg('event_nature')} />
            </Field>
          </Section>
        )}

        {type === 'retreat' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="Retreat details" icon={BookOpen}>
            <Field label="Retreat" name="retreat_id" required error={err('retreat_id')}>
              <select {...reg('retreat_id')}>
                <option value="">Choose a retreat</option>
                {retreats.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
                <option value={CUSTOM_RETREAT}>Our own group retreat (custom programme)</option>
              </select>
            </Field>
            <Field label="Format" name="retreat_format">
              <select {...reg('retreat_format')}>
                <option value="Individual">Individual retreatant</option>
                <option value="Group">Parish / group retreat</option>
              </select>
            </Field>
            <Field label="Preferred date" name="preferred_date" error={err('preferred_date')}>
              <input type="date" min={today} {...reg('preferred_date')} />
            </Field>
            <Field label="Number of participants" name="participants_count" error={err('participants_count')}>
              <input type="number" inputMode="numeric" min={1} {...reg('participants_count')} />
            </Field>
          </Section>
        )}

        {type === 'formation' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="Formation registration" icon={GraduationCap}>
            <Field label="Programme" name="formation_id" required error={err('formation_id')}>
              <select {...reg('formation_id')}>
                <option value="">Choose a programme</option>
                {formation.data?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Number of participants" name="participants_count" error={err('participants_count')}>
              <input type="number" inputMode="numeric" min={1} {...reg('participants_count')} />
            </Field>
            <Field label="Preferred start date (optional)" name="preferred_date" error={err('preferred_date')}>
              <input type="date" min={today} {...reg('preferred_date')} />
            </Field>
          </Section>
        )}

        {type === 'event' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="Event registration" icon={CalendarDays}>
            <Field label="Event" name="event_id" required error={err('event_id')}>
              <select {...reg('event_id')}>
                <option value="">{upcomingEvents.length ? 'Choose an event' : 'No events open for registration'}</option>
                {upcomingEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({formatDate(e.event_date)})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Number of people attending" name="participants_count" error={err('participants_count')}>
              <input type="number" inputMode="numeric" min={1} {...reg('participants_count')} />
            </Field>
          </Section>
        )}

        {type === 'product' && (
          <Section step={detailStep}
            tone="bg-parchment border-sand/70"
            title="Product inquiry"
            icon={ShoppingBag}
            note="Purchases are completed at our office in Ngong or arranged by phone or email."
          >
            <Field label="Product" name="product_id" required error={err('product_id')}>
              <select {...reg('product_id')}>
                <option value="">Choose a product</option>
                {products.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity" name="product_quantity" error={err('product_quantity')}>
              <input type="number" inputMode="numeric" min={1} {...reg('product_quantity')} />
            </Field>
          </Section>
        )}

        {type === 'general' && (
          <Section step={detailStep} tone="bg-parchment border-sand/70" title="General inquiry" icon={HelpCircle}>
            <div className="sm:col-span-2">
              <Field label="Subject" name="subject" required error={err('subject')}>
                <input type="text" placeholder="What would you like to ask about?" {...reg('subject')} />
              </Field>
            </div>
          </Section>
        )}

        {/* Contact details */}
        <fieldset className="space-y-5">
          <legend className="sr-only">Your contact details</legend>
          <StepHeading n={detailStep + 1} title="Your contact details" description="So our office can reply with availability and rates." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 sm:pl-11">
            <Field label="Full name" name="full_name" required error={err('full_name')}>
              <input type="text" autoComplete="name" placeholder="e.g. John Mwangi or Sr. Mary" {...reg('full_name')} />
            </Field>
            <Field label="Phone number" name="phone" required error={err('phone')}>
              <input type="tel" autoComplete="tel" placeholder="07XX XXX XXX" {...reg('phone')} />
            </Field>
            <Field label="Email address" name="email" required error={err('email')}>
              <input type="email" autoComplete="email" placeholder="you@example.com" {...reg('email')} />
            </Field>
            <Field label="Organisation / parish (optional)" name="organization" error={err('organization')}>
              <input type="text" autoComplete="organization" placeholder="e.g. St. Joseph Parish" {...reg('organization')} />
            </Field>
          </div>
          <div className="sm:pl-11">
            <Field label="Message or additional notes" name="message" error={err('message')}>
              <textarea rows={3} placeholder="Anything else we should know about your visit or request…" {...reg('message')} />
            </Field>
          </div>
        </fieldset>

        {serverError && (
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${
            inModal
              ? 'sticky -bottom-4 sm:-bottom-6 z-10 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-4 bg-white/95 backdrop-blur border-t border-sand/70'
              : 'pt-6 border-t border-sand/70'
          }`}
        >
          <p className="text-xs text-stone-500 text-center sm:text-left">
            We only use your details to reply to you. <span className="text-rose-500">*</span> Required
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline w-1/2 sm:w-auto whitespace-nowrap"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full sm:w-auto whitespace-nowrap disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Sending…' : 'Send inquiry'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
