import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { useFacilities } from '@/services/content';
import { dayStatus, PART_SLOTS, useAvailability, type BookingStatus } from '@/services/availability';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { addDays, formatDate, todayISO } from '@/lib/dates';
import { formatKes, shortHallName, TIME_SLOT_LABELS } from '@/lib/format';
import { ErrorState } from '@/components/common/States';

type SlotState = BookingStatus | 'AVAILABLE';

const SLOT_STYLE: Record<SlotState, { cell: string; label: string }> = {
  AVAILABLE: { cell: 'bg-emerald-100 text-emerald-800', label: 'Available' },
  PENDING: { cell: 'bg-amber-100 text-amber-800', label: 'Pending' },
  BOOKED: { cell: 'bg-rose-500 text-white', label: 'Booked' },
  BLOCKED: { cell: 'bg-stone-300 text-stone-600', label: 'Unavailable' },
};

const SLOT_LETTER = { MORNING: 'M', AFTERNOON: 'A', EVENING: 'E' } as const;

/**
 * Week planner of hall availability: halls down the side, seven days across, and each day's
 * morning / afternoon / evening sessions colour-coded. Clicking a day opens the booking form for that hall and date.
 */
export const AvailabilityMatrix: React.FC = () => {
  const { openInquiry } = useInquiryModal();
  const facilities = useFacilities();
  const today = todayISO();
  const [weekStart, setWeekStart] = useState(today);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const availability = useAvailability(weekStart, days[6]);
  const canGoBack = weekStart > today;

  const halls = facilities.data ?? [];
  const loading = facilities.isPending || availability.isPending;

  return (
    <section aria-labelledby="availability-heading" className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 p-5 sm:p-8 pb-5 sm:pb-6">
        <div>
          <p className="eyebrow">
            <CalendarDays className="w-3.5 h-3.5" /> Live availability
          </p>
          <h2 id="availability-heading" className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-sky-950">
            Conference hall availability
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">
            {formatDate(days[0], { day: 'numeric', month: 'long' })} – {formatDate(days[6], { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-sand bg-white p-1">
            <button
              type="button"
              onClick={() => setWeekStart((d) => (addDays(d, -7) < today ? today : addDays(d, -7)))}
              disabled={!canGoBack}
              className="inline-flex w-9 h-9 items-center justify-center rounded-full text-sky-900 hover:bg-parchment disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(today)}
              disabled={!canGoBack}
              className="px-3 h-9 rounded-full text-sm font-semibold text-sky-900 hover:bg-parchment disabled:opacity-40 disabled:hover:bg-transparent"
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="inline-flex w-9 h-9 items-center justify-center rounded-full text-sky-900 hover:bg-parchment"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-sand bg-white pl-3.5 pr-1.5 h-11 text-sm text-stone-600">
            <span className="sr-only sm:not-sr-only">Jump to</span>
            <input
              type="date"
              min={today}
              value={weekStart}
              onChange={(e) => e.target.value && setWeekStart(e.target.value)}
              className="h-8 rounded-full px-2 text-sm font-semibold text-sky-950 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
              aria-label="Jump to date"
            />
          </label>
        </div>
      </div>

      {/* Planner grid */}
      {facilities.isError || availability.isError ? (
        <div className="p-5 sm:p-8 pt-0">
          <ErrorState
            onRetry={() => {
              facilities.refetch();
              availability.refetch();
            }}
          />
        </div>
      ) : (
        <div className="relative border-y border-sand/70 bg-parchment/40">
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[46rem] table-fixed border-separate border-spacing-0 text-left">
              <caption className="sr-only">Availability of each hall for the selected week</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-parchment w-44 sm:w-60 px-4 sm:px-8 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                    Hall
                  </th>
                  {days.map((d) => {
                    const isToday = d === today;
                    return (
                      <th key={d} scope="col" className="bg-parchment px-1.5 py-3 text-center">
                        <span className={`text-[0.7rem] font-semibold uppercase tracking-wider ${isToday ? 'text-sky-700' : 'text-stone-500'}`}>
                          {isToday ? 'Today' : formatDate(d, { weekday: 'short' })}
                        </span>
                        <span
                          className={`mx-auto mt-1 flex w-9 h-9 items-center justify-center rounded-full font-sans text-base font-bold tabular-nums ${
                            isToday ? 'bg-sky-800 text-white' : 'text-sky-950'
                          }`}
                        >
                          {formatDate(d, { day: 'numeric' })}
                        </span>
                      </th>
                    );
                  })}
                  <th aria-hidden className="w-3 sm:w-6 bg-parchment" />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="sticky left-0 bg-white px-4 sm:px-8 py-4 border-t border-sand/70">
                          <div className="h-5 w-32 rounded bg-sand/60 animate-pulse" />
                        </td>
                        {days.map((d) => (
                          <td key={d} className="px-1.5 py-3 bg-white border-t border-sand/70">
                            <div className="h-14 rounded-xl bg-sand/40 animate-pulse" />
                          </td>
                        ))}
                        <td aria-hidden className="bg-white border-t border-sand/70" />
                      </tr>
                    ))
                  : halls.map((hall) => (
                      <tr key={hall.id} className="group/row">
                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 sm:px-8 py-4 border-t border-sand/70 align-middle">
                          <div className="font-serif text-lg sm:text-xl font-semibold text-sky-950 leading-tight">{shortHallName(hall.name)}</div>
                          <div className="mt-0.5 text-xs text-stone-500 whitespace-nowrap">
                            {hall.capacity_min}–{hall.capacity_max} people · <span className="font-semibold text-sky-800">{formatKes(hall.price_kes)}</span>
                          </div>
                        </th>
                        {days.map((d) => {
                          const { status, slots } = dayStatus(availability.data ?? [], hall.id, d);
                          const states = PART_SLOTS.map((s) => (slots[s as keyof typeof slots] ?? 'AVAILABLE') as SlotState);
                          const fullyTaken = states.every((s) => s !== 'AVAILABLE');
                          const freeCount = states.filter((s) => s === 'AVAILABLE').length;
                          const summary = PART_SLOTS.map((s, i) => `${TIME_SLOT_LABELS[s]} ${SLOT_STYLE[states[i]].label.toLowerCase()}`).join(', ');
                          return (
                            <td key={d} className="px-1.5 py-3 bg-white border-t border-sand/70">
                              <button
                                type="button"
                                onClick={() => openInquiry('conference', { facilityId: hall.id, date: d })}
                                aria-label={`${hall.name}, ${formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}: ${summary}. ${
                                  fullyTaken ? 'Ask about other dates.' : 'Request this hall.'
                                }`}
                                className={`w-full rounded-xl border p-1.5 transition-all focus-visible:outline-2 ${
                                  fullyTaken
                                    ? 'border-transparent bg-stone-50 hover:bg-stone-100'
                                    : 'border-sand/70 hover:border-sky-400 hover:shadow-soft hover:-translate-y-0.5'
                                }`}
                              >
                                <span className="flex gap-1" aria-hidden>
                                  {PART_SLOTS.map((s, i) => (
                                    <span
                                      key={s}
                                      title={`${TIME_SLOT_LABELS[s]}: ${SLOT_STYLE[states[i]].label}`}
                                      className={`flex-1 h-7 rounded-md grid place-items-center text-[0.65rem] font-bold ${SLOT_STYLE[states[i]].cell}`}
                                    >
                                      {SLOT_LETTER[s as keyof typeof SLOT_LETTER]}
                                    </span>
                                  ))}
                                </span>
                                <span
                                  className={`mt-1 block text-[0.68rem] font-semibold ${
                                    fullyTaken ? 'text-stone-500' : status === 'AVAILABLE' ? 'text-emerald-700' : 'text-sky-800'
                                  }`}
                                  aria-hidden
                                >
                                  {fullyTaken ? 'Full' : freeCount === 3 ? 'All free' : `${freeCount} of 3 free`}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                        <td aria-hidden className="bg-white border-t border-sand/70" />
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {/* Scroll hint on small screens */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white to-transparent md:hidden" aria-hidden />
        </div>
      )}

      {/* Footer: legend + hint */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 sm:px-8 py-5">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600" aria-label="Key">
          <li className="font-semibold text-stone-700">M · A · E = Morning, Afternoon, Evening</li>
          {(Object.keys(SLOT_STYLE) as SlotState[]).map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded ${SLOT_STYLE[k].cell}`} aria-hidden />
              {SLOT_STYLE[k].label}
            </li>
          ))}
        </ul>
        <p className="inline-flex items-center gap-2 text-sm text-sky-900 font-medium">
          <MousePointerClick className="w-4 h-4 text-gold-500" />
          Click a day to request that hall
        </p>
      </div>
    </section>
  );
};
