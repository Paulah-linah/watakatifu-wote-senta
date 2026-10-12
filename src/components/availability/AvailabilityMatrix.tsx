import React, { useState } from 'react';
import { ArrowRight, Calendar, CalendarDays, Filter, Info, Users } from 'lucide-react';
import { useFacilities } from '@/services/content';
import { dayStatus, PART_SLOTS, useAvailability, type BookingStatus, type DayStatus } from '@/services/availability';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { addDays, formatDate, todayISO } from '@/lib/dates';
import { formatKes, shortHallName, TIME_SLOT_LABELS } from '@/lib/format';
import { ErrorState, LoadingGrid } from '@/components/common/States';

const STATUS_STYLE: Record<DayStatus, { label: string; badge: string; dot: string }> = {
  AVAILABLE: { label: 'Available', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  PARTIAL: { label: 'Partly booked', badge: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  PENDING: { label: 'Pending', badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  BOOKED: { label: 'Booked', badge: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
  BLOCKED: { label: 'Unavailable', badge: 'bg-stone-200 text-stone-700 border-stone-300', dot: 'bg-stone-400' },
};

const slotStyle = (s: BookingStatus | null) => (s ? STATUS_STYLE[s] : STATUS_STYLE.AVAILABLE);

export const AvailabilityMatrix: React.FC = () => {
  const { openInquiry } = useInquiryModal();
  const facilities = useFacilities();
  const today = todayISO();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const stripDates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const rangeEnd = selectedDate > stripDates[6] ? selectedDate : stripDates[6];
  const availability = useAvailability(today, rangeEnd);

  const halls = (facilities.data ?? []).filter((f) => selectedFacilityId === 'all' || f.id === selectedFacilityId);

  return (
    <section aria-labelledby="availability-heading" className="card p-5 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <p className="eyebrow">
            <CalendarDays className="w-3.5 h-3.5" /> Live availability
          </p>
          <h2 id="availability-heading" className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-sky-950">
            Conference hall availability
          </h2>
          <p className="text-sm text-stone-600 mt-1">Check morning, afternoon and evening sessions across our three halls.</p>
        </div>

        <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap rounded-2xl bg-parchment px-4 py-2.5 text-xs text-stone-600">
          <span className="font-medium text-stone-800 mr-1">Key:</span>
          {(['AVAILABLE', 'PARTIAL', 'PENDING', 'BOOKED', 'BLOCKED'] as DayStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1 font-medium">
              <span className={`w-2 h-2 rounded-full ${STATUS_STYLE[s].dot}`} /> {STATUS_STYLE[s].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filter by hall">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Hall:
          </span>
          {[{ id: 'all', name: 'All halls' }, ...(facilities.data ?? [])].map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={selectedFacilityId === f.id}
              onClick={() => setSelectedFacilityId(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                selectedFacilityId === f.id ? 'bg-sky-900 text-white' : 'bg-white text-stone-700 hover:border-sky-300 border border-sand'
              }`}
            >
              {shortHallName(f.name)}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 w-full sm:w-auto sm:justify-end text-xs font-semibold text-stone-600">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span className="shrink-0">Pick a date:</span>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-full border border-sand bg-white text-stone-800 font-medium shadow-2xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-4 xs:grid-cols-7 gap-1.5 sm:gap-2 mb-5" role="group" aria-label="Next 7 days">
        {stripDates.map((iso, i) => {
          const isSelected = selectedDate === iso;
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedDate(iso)}
              className={`p-2.5 rounded-2xl border text-center transition-all ${i > 3 ? 'hidden xs:block' : ''} ${
                isSelected ? 'bg-sky-900 text-white border-sky-900 shadow-soft' : 'bg-parchment hover:bg-white border-sand/70 text-stone-700'
              }`}
            >
              <div className={`text-[11px] font-medium uppercase ${isSelected ? 'text-gold-300' : 'text-stone-400'}`}>
                {i === 0 ? 'Today' : formatDate(iso, { weekday: 'short' })}
              </div>
              <div className="text-sm font-bold mt-0.5">{formatDate(iso, { day: 'numeric', month: 'short' })}</div>
            </button>
          );
        })}
      </div>

      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
        Status for <strong className="text-stone-800">{formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
      </div>

      {facilities.isPending || availability.isPending ? (
        <LoadingGrid itemClassName="h-56" />
      ) : facilities.isError || availability.isError ? (
        <ErrorState
          onRetry={() => {
            facilities.refetch();
            availability.refetch();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-live="polite">
          {halls.map((facility) => {
            const { status, slots } = dayStatus(availability.data ?? [], facility.id, selectedDate);
            const style = STATUS_STYLE[status];
            const canRequest = status === 'AVAILABLE' || status === 'PARTIAL';
            return (
              <article key={facility.id} className="rounded-2xl border border-sand/70 bg-parchment/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-semibold text-sky-950 text-xl leading-tight">{facility.name}</h3>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600 mb-3 pb-2 border-b border-stone-100">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {facility.capacity_min}–{facility.capacity_max} people
                    </span>
                    <span aria-hidden>•</span>
                    <span className="font-bold text-sky-800">{formatKes(facility.price_kes)}</span>
                  </div>
                  <ul className="grid grid-cols-3 gap-1.5 mb-3" aria-label="Sessions">
                    {PART_SLOTS.map((slot) => {
                      const s = slotStyle(slots[slot as keyof typeof slots]);
                      return (
                        <li key={slot} className={`text-center rounded-xl border px-1 py-2 ${s.badge}`}>
                          <div className="text-[10px] font-bold uppercase">{TIME_SLOT_LABELS[slot]}</div>
                          <div className="text-[10px]">{s.label}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => openInquiry('conference', { facilityId: facility.id, date: selectedDate })}
                  className={`btn w-full ${canRequest ? 'btn-primary' : 'btn-outline'}`}
                >
                  <span>{canRequest ? 'Request this hall' : 'Ask about other dates'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-stone-200/80 text-xs text-stone-500 flex items-start gap-1.5">
        <Info className="w-4 h-4 text-sky-700 shrink-0" />
        <span>Availability updates automatically. Requests are confirmed by the hospitality office after review.</span>
      </div>
    </section>
  );
};
