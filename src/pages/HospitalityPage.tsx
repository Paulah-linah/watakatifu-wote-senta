import React from 'react';
import { useParams } from 'react-router-dom';
import { Bed, Building2, CalendarCheck, CheckCircle2, Droplet, Info, Shirt, Users, Utensils } from 'lucide-react';
import { useAccommodation, useCatering, useFacilities, useLaundry } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { PageHero } from '@/components/common/PageHero';
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
  <div className="max-w-3xl" data-tone={badgeTone}>
    <p className="eyebrow">{badge}</p>
    <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-sky-950 leading-tight text-balance">{title}</h2>
    <div className="mt-4 text-base text-stone-600 leading-relaxed space-y-4">{children}</div>
  </div>
);

const Checklist: React.FC<{ title: string; items: string[]; tone: string }> = ({ title, items, tone }) =>
  items.length ? (
    <div className="space-y-1.5 pt-2">
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-stone-400 block">{title}</span>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
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
      <dl className="card grid grid-cols-2 sm:grid-cols-4 divide-x divide-sand/60 overflow-hidden">
        {[
          ['155', 'Chairs & tables on campus'],
          ['Projector', 'Shared across the halls'],
          ['Sound system', 'PA with microphones'],
          ['Purified water', 'Dispensers in every hall'],
        ].map(([value, label]) => (
          <div key={label} className="p-5 sm:p-6 text-center">
            <dd className="font-serif text-2xl sm:text-3xl font-semibold text-sky-900">{value}</dd>
            <dt className="text-xs text-stone-600 mt-0.5">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-sky-950">Our three conference spaces</h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">Rates, capacities and seating layouts as confirmed by the centre.</p>
        </div>
        <QueryState query={facilities}>
          {(halls) => (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {halls.map((f) => (
                <article key={f.id} className="group card card-hover overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                      {f.image_url && <img src={f.image_url} alt={f.name} className="w-full h-full object-cover img-zoom" loading="lazy" />}
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
                      <h3 className="font-serif text-2xl font-semibold text-sky-950 mb-2">{f.name}</h3>
                      {f.price_note && <p className="text-xs font-semibold text-sky-800 mb-2">{f.price_note}</p>}
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">{f.description}</p>
                      <Checklist title="Included" items={f.features} tone="text-emerald-600" />
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => openInquiry('conference', { facilityId: f.id })}
                      className="btn btn-primary w-full"
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
              <article key={item.id} className="group card card-hover overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full overflow-hidden bg-stone-100">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover img-zoom" loading="lazy" />}
                  </div>
                  <div className="p-5">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{item.category}</span>
                    )}
                    <h3 className="font-serif text-xl font-semibold text-sky-950 mt-2 mb-1">{item.name}</h3>
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
                    className="btn btn-primary w-full"
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
          Our kitchen prepares fresh meals for conference delegates, retreatants, events and private functions, at the centre or as outside
          catering at your venue. Kenyan dishes, tea and coffee breaks, and special diets on prior arrangement.
        </p>
      </Intro>
      <QueryState query={services}>
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((s) => (
              <article key={s.id} className="group card card-hover overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-52 w-full overflow-hidden bg-stone-100">
                    {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-full object-cover img-zoom" loading="lazy" />}
                  </div>
                  <div className="p-6">
                    {s.ideal_for && <div className="text-xs text-orange-700 font-semibold mb-1">Ideal for: {s.ideal_for}</div>}
                    <h3 className="font-serif text-2xl font-semibold text-sky-950 mb-2">{s.title}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-2">{s.description}</p>
                    <Checklist title="Includes" items={s.includes} tone="text-orange-600" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => openInquiry('catering', { cateringId: s.id })}
                    className="btn btn-primary w-full"
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
        <p>A well-equipped laundry is available to guests staying at the centre. Please ask at the office when you book.</p>
      </Intro>
      <QueryState query={services}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState title="Laundry details coming soon" message="Please contact the office for laundry arrangements." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((item) => (
                <article key={item.id} className="card p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-sky-950">{item.title}</h3>
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
                    className="mt-6 btn btn-outline w-full"
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
          <article key={title} className="card p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-sky-950">{title}</h3>
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
    <div>
      <PageHero
        eyebrow="Hospitality & services"
        title="Meet, stay and dine in a place of peace"
        subtitle="Conference halls, quiet accommodation and wholesome catering for parishes, organisations and families in Ngong."
        image="https://images.unsplash.com/photo-1697059361461-b81d0e98c3af?auto=format&fit=crop&w=1800&q=70"
        crumbs={[{ label: 'Hospitality', to: '/hospitality' }, { label: current.label }]}
      />
      <TabNav basePath="/hospitality" items={TABS} active={section} label="Hospitality sections" />
      <div key={section} className="container-page animate-in fade-in duration-300">
        <Panel />
      </div>
    </div>
  );
};
