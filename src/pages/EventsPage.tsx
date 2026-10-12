import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CalendarCheck, Clock, MapPin } from 'lucide-react';
import { useEvents } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState, QueryState } from '@/components/common/States';
import { formatDate, formatTime, todayISO } from '@/lib/dates';
import { usePageMeta } from '@/lib/usePageMeta';

type Filter = 'upcoming' | 'past' | 'all';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All events' },
];

export const EventsPage: React.FC = () => {
  usePageMeta({ title: 'Events', description: 'Celebrations, youth days, jubilees and pastoral symposiums at Watakatifu Wote Senta, Ngong.' });
  const { openInquiry } = useInquiryModal();
  const events = useEvents();
  const [params, setParams] = useSearchParams();
  const raw = params.get('filter');
  const filter: Filter = raw === 'past' || raw === 'all' ? raw : 'upcoming';
  const today = todayISO();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <SectionHeader
        level={1}
        badge="Liturgical & Institutional Calendar"
        title="Events & Diocesan Gatherings"
        subtitle="Celebrations, youth formation days, jubilees and pastoral symposiums hosted at Watakatifu Wote Senta."
      />

      <div className="flex items-center justify-center">
        <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-1" role="group" aria-label="Show events">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setParams(f.key === 'upcoming' ? {} : { filter: f.key }, { replace: true, preventScrollReset: true })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filter === f.key ? 'bg-sky-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <QueryState query={events}>
        {(all) => {
          const list = all
            .filter((e) => (filter === 'all' ? true : filter === 'past' ? e.event_date < today : e.event_date >= today))
            .sort((a, b) => (filter === 'past' ? b.event_date.localeCompare(a.event_date) : a.event_date.localeCompare(b.event_date)));
          if (list.length === 0)
            return (
              <EmptyState
                title={filter === 'past' ? 'No past events yet' : 'Upcoming events will be published here'}
                message="Check back soon, or contact the office about parish dates and diocesan programmes."
              />
            );
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {list.map((event) => {
                const past = event.event_date < today;
                const time = event.time_label || [formatTime(event.start_time), formatTime(event.end_time)].filter(Boolean).join(' – ');
                return (
                  <article key={event.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="h-56 w-full overflow-hidden bg-stone-100 relative">
                        {event.image_url && <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />}
                        <div className="absolute top-4 left-4 bg-stone-900/90 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <time dateTime={event.event_date}>{formatDate(event.event_date)}</time>
                        </div>
                        {past && <div className="absolute top-4 right-4 bg-stone-800 text-stone-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Completed</div>}
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mb-3">
                          {time && (
                            <span className="flex items-center gap-1 font-medium text-stone-700">
                              <Clock className="w-3.5 h-3.5 text-sky-700" />
                              {time}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3 leading-snug">{event.title}</h2>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      {!past && event.registration_open ? (
                        <button
                          type="button"
                          onClick={() => openInquiry('event', { eventId: event.id })}
                          className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Register for this event</span>
                        </button>
                      ) : (
                        <p className="text-xs text-stone-500 italic text-center py-2">
                          {past ? 'This event has taken place.' : 'Registration is not open online. Please contact the office.'}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          );
        }}
      </QueryState>
    </div>
  );
};
