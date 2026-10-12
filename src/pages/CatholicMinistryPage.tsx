import React from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock, GraduationCap, MapPin, Sparkles, TreePine } from 'lucide-react';
import { useFormation, useMassSchedules, useRetreats, useSiteSettings } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TabNav } from '@/components/common/TabNav';
import { EmptyState, QueryState } from '@/components/common/States';
import { formatDate } from '@/lib/dates';
import { formatKes } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

const TABS = [
  { key: 'mass', label: 'Mass Schedule', icon: Clock },
  { key: 'retreats', label: 'Retreats', icon: BookOpen },
  { key: 'formation', label: 'Formation & Seminars', icon: GraduationCap },
  { key: 'prayer', label: 'Chapel & Prayer Grounds', icon: Sparkles },
];

const Intro: React.FC<{ badge: string; badgeTone: string; title: string; text: string }> = ({ badge, badgeTone, title, text }) => (
  <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E3DAC9] space-y-4">
    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded ${badgeTone}`}>{badge}</span>
    <h2 className="font-serif text-3xl font-bold text-stone-900">{title}</h2>
    <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">{text}</p>
  </div>
);

const Requirements: React.FC<{ title: string; items: string[] }> = ({ title, items }) =>
  items.length ? (
    <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
      <span className="font-bold text-[11px] text-stone-400 uppercase">{title}</span>
      <ul className="space-y-1.5">
        {items.map((req) => (
          <li key={req} className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
            <span>{req}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

const Fee: React.FC<{ amount: number | null; note: string | null; label: string }> = ({ amount, note, label }) =>
  amount != null ? (
    <div className="mt-4 p-2.5 rounded-lg bg-sky-50 text-sky-950 text-xs font-semibold">
      {label}: {formatKes(amount)} {note && <span className="font-normal text-stone-600">({note})</span>}
    </div>
  ) : null;

function MassTab() {
  const { openInquiry } = useInquiryModal();
  const masses = useMassSchedules();
  return (
    <div className="space-y-8">
      <Intro
        badge="Liturgical heart of the centre"
        badgeTone="text-amber-800 bg-amber-100"
        title="The Daily Celebration of the Eucharist"
        text="The Eucharist is the source and summit of our life at Watakatifu Wote Senta. Morning Mass is celebrated every day, bringing together retreatants, visiting priests, conference guests and local parishioners."
      />
      <QueryState query={masses}>
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((mass) => (
              <article key={mass.id} className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-1 rounded">{mass.celebration_type}</span>
                    {mass.is_special && <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Annual feast</span>}
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">{mass.day_label}</div>
                    <div className="font-serif text-4xl font-bold mt-1 text-sky-950">{mass.time_label}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{mass.description}</p>
                  {mass.location && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <MapPin className="w-3.5 h-3.5 text-sky-700" />
                      <span>
                        Location: <strong>{mass.location}</strong>
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openInquiry('general', { subject: `Mass intention / concelebration: ${mass.celebration_type}` })}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold"
                >
                  Ask about Mass intentions or concelebration
                </button>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

function RetreatsTab() {
  const { openInquiry } = useInquiryModal();
  const retreats = useRetreats();
  return (
    <div className="space-y-8">
      <Intro
        badge="Spiritual accompaniment"
        badgeTone="text-sky-800 bg-sky-100"
        title="Individual & Group Retreats in Ngong"
        text="Silent retreats, guided Ignatian exercises, parish council retreats and clergy recollections. Groups can bring their own programme or join one of ours."
      />
      <QueryState query={retreats}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState title="No retreats published right now" message="Contact us to plan a group retreat on your own dates." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {items.map((r) => (
                <article key={r.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-48 w-full overflow-hidden bg-stone-100 relative">
                      {r.image_url && <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" loading="lazy" />}
                      <div className="absolute top-3 left-3 bg-stone-950/80 text-sky-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded">{r.category}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{r.title}</h3>
                      <dl className="text-xs text-stone-500 mb-3 space-y-1">
                        {r.start_date && (
                          <div>
                            <dt className="inline font-bold">Dates: </dt>
                            <dd className="inline">
                              {formatDate(r.start_date)}
                              {r.end_date && r.end_date !== r.start_date ? ` – ${formatDate(r.end_date)}` : ''}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="inline font-bold">Duration: </dt>
                          <dd className="inline">{r.duration}</dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">For: </dt>
                          <dd className="inline">{r.target_audience}</dd>
                        </div>
                      </dl>
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">{r.description}</p>
                      <Requirements title="What to bring" items={r.requirements} />
                      <Fee amount={r.fee_kes} note={r.fee_note} label="Fee" />
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => openInquiry('retreat', { retreatId: r.id, date: r.start_date ?? undefined })}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold"
                    >
                      Register / inquire
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        }
      </QueryState>
    </div>
  );
}

function FormationTab() {
  const { openInquiry } = useInquiryModal();
  const programmes = useFormation();
  return (
    <div className="space-y-8">
      <Intro
        badge="Church leadership"
        badgeTone="text-sky-800 bg-sky-100"
        title="Formation Programmes & Pastoral Seminars"
        text="Run with the Diocese of Ngong Pastoral Office to equip lay leaders, catechists, youth animators and family life coordinators."
      />
      <QueryState query={programmes}>
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((p) => (
              <article key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full overflow-hidden bg-stone-100">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">{p.title}</h3>
                    <dl className="text-xs text-stone-500 mb-3 space-y-1">
                      <div>
                        <dt className="inline font-bold">Format & duration: </dt>
                        <dd className="inline">{p.duration}</dd>
                      </div>
                      {p.schedule && (
                        <div>
                          <dt className="inline font-bold">Schedule: </dt>
                          <dd className="inline">{p.schedule}</dd>
                        </div>
                      )}
                    </dl>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">{p.description}</p>
                    <Requirements title="Prerequisites" items={p.requirements} />
                    <Fee amount={p.fee_kes} note={p.fee_note} label="Cost" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => openInquiry('formation', { formationId: p.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold"
                  >
                    Register for this programme
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

function PrayerTab() {
  const { settings } = useSiteSettings();
  return (
    <div className="space-y-8">
      <Intro
        badge="A place of quiet"
        badgeTone="text-emerald-800 bg-emerald-100"
        title="Chapel, Adoration & Prayer Grounds"
        text="A peaceful setting on Kahara Road in Ngong, with clean air, native trees and quiet walking paths for adoration, meditation and spiritual renewal."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">The Chapel</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            The heart of Watakatifu Wote Senta. The Blessed Sacrament is reserved in the tabernacle for private adoration and prayer throughout the day.
          </p>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <strong>Schedule:</strong> Daily Mass at {settings.daily_mass_time}; open for quiet prayer during the day.
          </div>
        </article>
        <article className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TreePine className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Prayer Grounds & Amphitheatre</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Lawns, shaded benches and an outdoor amphitheatre for Stations of the Cross, group Rosaries and open-air discussions.
          </p>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <strong>Philosophy:</strong> &ldquo;Integrity of Creation&rdquo;, caring for God&apos;s natural environment in Ngong.
          </div>
        </article>
      </div>
    </div>
  );
}

const PANELS: Record<string, React.FC> = { mass: MassTab, retreats: RetreatsTab, formation: FormationTab, prayer: PrayerTab };

export const CatholicMinistryPage: React.FC = () => {
  const { section = 'mass' } = useParams();
  const current = TABS.find((t) => t.key === section);
  usePageMeta({
    title: current ? `${current.label} | Catholic Ministry` : 'Catholic Ministry',
    description: 'Daily Mass, spiritual retreats, formation programmes and prayer grounds at Watakatifu Wote Senta, Ngong.',
  });
  if (!current) return <NotFoundPage />;
  const Panel = PANELS[section];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <SectionHeader
        level={1}
        badge="Catholic Ministry"
        title="Spiritual Renewal, Formation & Daily Prayer"
        subtitle="Under the pastoral care of the Catholic Diocese of Ngong: Holy Mass, retreats, catechist formation and quiet space for prayer."
      />
      <TabNav basePath="/ministry" items={TABS} active={section} label="Ministry sections" />
      <div key={section} className="animate-in fade-in duration-200">
        <Panel />
      </div>
    </div>
  );
};
