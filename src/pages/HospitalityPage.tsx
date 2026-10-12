import React from 'react';
import { useParams } from 'react-router-dom';
import { Bed, Building2, CalendarCheck, CheckCircle2, Droplet, Info, Shirt, Users, Utensils } from 'lucide-react';
import { useAccommodation, useCatering, useFacilities, useLaundry } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TabNav } from '@/components/common/TabNav';
import { EmptyState, QueryState } from '@/components/common/States';
import { AvailabilityMatrix } from '@/components/availability/AvailabilityMatrix';
import { formatKes, shortHallName } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

const TABS = [
  { key: 'conference', label: 'Conference Facilities', icon: Building2 },
  { key: 'accommodation', label: 'Accommodation', icon: Bed },
  { key: 'catering', label: 'Catering & Dining', icon: Utensils },
  { key: 'laundry', label: 'Laundry', icon: Shirt },
  { key: 'water', label: 'Water Services', icon: Droplet },
];

const Intro: React.FC<{ badge: string; badgeTone: string; title: string; children: React.ReactNode }> = ({ badge, badgeTone, title, children }) => (
  <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E3DAC9] space-y-4">
    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded ${badgeTone}`}>{badge}</span>
    <h2 className="font-serif text-3xl font-bold text-stone-900">{title}</h2>
    <div className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl space-y-3">{children}</div>
  </div>
);

const Checklist: React.FC<{ title: string; items: string[]; tone: string }> = ({ title, items, tone }) =>
  items.length ? (
    <div className="space-y-1.5 pt-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">{title}</span>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-stone-600">
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tone}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

function ConferenceTab() {
  const { openInquiry } = useInquiryModal();
  const facilities = useFacilities();
  return (
    <div className="space-y-12">
      <dl className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E3DAC9] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          ['155', 'Chairs & tables on campus'],
          ['Projector', 'Shared across the halls'],
          ['Sound system', 'PA with microphones'],
          ['Purified water', 'Dispensers in every hall'],
        ].map(([value, label]) => (
          <div key={label} className="p-2">
            <dd className="font-serif text-2xl font-bold text-sky-900">{value}</dd>
            <dt className="text-xs text-stone-600 mt-0.5">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Our three conference spaces</h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">Rates, capacities and seating layouts as confirmed by the centre.</p>
        </div>
        <QueryState query={facilities}>
          {(halls) => (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {halls.map((f) => (
                <article key={f.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                      {f.image_url && <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />}
                      <div className="absolute top-4 right-4 bg-stone-900/90 text-amber-200 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md">
                        {formatKes(f.price_kes)}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
                          <Users className="w-3.5 h-3.5 text-sky-700" />
                          {f.capacity_min}–{f.capacity_max} attendees
                        </span>
                        <span className="text-[11px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-medium">{f.seating_styles.join(' • ')}</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">{f.name}</h3>
                      {f.price_note && <p className="text-xs font-semibold text-sky-800 mb-2">{f.price_note}</p>}
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">{f.description}</p>
                      <Checklist title="Included" items={f.features} tone="text-emerald-600" />
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => openInquiry('conference', { facilityId: f.id })}
                      className="w-full py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Request {shortHallName(f.name)}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </QueryState>
      </div>

      <AvailabilityMatrix />
    </div>
  );
}

function AccommodationTab() {
  const { openInquiry } = useInquiryModal();
  const options = useAccommodation();
  return (
    <div className="space-y-8">
      <Intro badge="Rest & reflection in Ngong" badgeTone="text-amber-800 bg-amber-100" title="Campus Accommodation & Guest House">
        <p>
          Restful, secure rooms for retreatants, visiting clergy, conference groups and researchers. Our residential wings hold up to{' '}
          <strong>62 beds</strong>, alongside <strong>six self-contained apartments</strong> in the All Saints Guest House.
        </p>
        <p className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Booked on inquiry:</strong> room allocation and rates depend on group size, length of stay and meal requirements.
          </span>
        </p>
      </Intro>
      <QueryState query={options}>
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full overflow-hidden bg-stone-100">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="p-5">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{item.category}</span>
                    )}
                    <h3 className="font-serif text-xl font-bold text-stone-900 mt-2 mb-1">{item.name}</h3>
                    <div className="text-xs font-semibold text-sky-800 mb-3">{item.capacity_desc}</div>
                    <p className="text-xs text-stone-600 leading-relaxed mb-2">{item.description}</p>
                    {item.price_estimate && <p className="text-xs text-stone-500 italic mb-2">{item.price_estimate}</p>}
                    <Checklist title="Features" items={item.amenities} tone="text-amber-600" />
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => openInquiry('accommodation', { accommodationId: item.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                  >
                    Request a quote
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

function CateringTab() {
  const { openInquiry } = useInquiryModal();
  const services = useCatering();
  return (
    <div className="space-y-8">
      <Intro badge="Wholesome dining" badgeTone="text-orange-800 bg-orange-100" title="Hospitality Catering Services">
        <p>
          Our kitchen prepares fresh meals for conference delegates, retreatants, parish celebrations and private committees: Kenyan dishes, tea
          and coffee breaks, and special diets on prior arrangement.
        </p>
      </Intro>
      <QueryState query={services}>
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((s) => (
              <article key={s.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-52 w-full overflow-hidden bg-stone-100">
                    {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="p-6">
                    {s.ideal_for && <div className="text-xs text-orange-700 font-semibold mb-1">Ideal for: {s.ideal_for}</div>}
                    <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">{s.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-2">{s.description}</p>
                    <Checklist title="Includes" items={s.includes} tone="text-orange-600" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => openInquiry('catering', { cateringId: s.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold"
                  >
                    Make a catering inquiry
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

function LaundryTab() {
  const { openInquiry } = useInquiryModal();
  const services = useLaundry();
  return (
    <div className="space-y-8">
      <Intro badge="Care & comfort" badgeTone="text-sky-800 bg-sky-100" title="Campus Laundry Services">
        <p>Dedicated laundry facilities for overnight retreatants, long-stay guests, visiting priests and conference linen.</p>
      </Intro>
      <QueryState query={services}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState title="Laundry details coming soon" message="Please contact the office for laundry arrangements." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((item) => (
                <article key={item.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{item.description}</p>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                      {item.turnaround_time && (
                        <div>
                          <strong>Turnaround:</strong> {item.turnaround_time}
                        </div>
                      )}
                      {item.notes && <div className="text-stone-500 italic">{item.notes}</div>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openInquiry('general', { subject: `Laundry: ${item.title}` })}
                    className="mt-6 w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold"
                  >
                    Ask about this service
                  </button>
                </article>
              ))}
            </div>
          )
        }
      </QueryState>
    </div>
  );
}

function WaterTab() {
  return (
    <div className="space-y-8">
      <Intro badge="Hospitality support" badgeTone="text-sky-800 bg-sky-100" title="Clean Water Services">
        <p>
          Clean, safe drinking water and dispensers are provided across conference halls, meeting rooms, dining areas and residential lounges.
        </p>
      </Intro>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          {
            icon: Droplet,
            title: 'Conference hall water dispensers',
            text: 'Purified water dispensers with cups are placed in St. Bakhita, St. Julian and St. Bernard halls.',
            note: 'Included with every hall booking',
            tone: 'text-emerald-700',
          },
          {
            icon: Users,
            title: 'Retreat & residential provision',
            text: 'Drinking water points and refreshments at meals for residential retreat participants throughout their stay.',
            note: 'Managed by the hospitality and kitchen team',
            tone: 'text-sky-700',
          },
        ].map(({ icon: Icon, title, text, note, tone }) => (
          <article key={title} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">{title}</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{text}</p>
            <div className={`flex items-center gap-2 text-xs font-semibold pt-2 ${tone}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{note}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const PANELS: Record<string, React.FC> = {
  conference: ConferenceTab,
  accommodation: AccommodationTab,
  catering: CateringTab,
  laundry: LaundryTab,
  water: WaterTab,
};

export const HospitalityPage: React.FC = () => {
  const { section = 'conference' } = useParams();
  const current = TABS.find((t) => t.key === section);
  usePageMeta({
    title: current ? `${current.label} | Hospitality` : 'Hospitality',
    description: 'Conference halls, accommodation, catering, laundry and water services at Watakatifu Wote Senta, Ngong.',
  });
  if (!current) return <NotFoundPage />;
  const Panel = PANELS[section];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <SectionHeader
        level={1}
        badge="Hospitality & Business Services"
        title="Conference, Accommodation & Campus Services"
        subtitle="Space for productive workshops, retreats, church assemblies and restful stays in Ngong."
      />
      <TabNav basePath="/hospitality" items={TABS} active={section} label="Hospitality sections" />
      <div key={section} className="animate-in fade-in duration-200">
        <Panel />
      </div>
    </div>
  );
};
