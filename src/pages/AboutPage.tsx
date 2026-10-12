import React from 'react';
import { useParams } from 'react-router-dom';
import { BedDouble, Building, Church, Compass, Heart, History, Home, Landmark, ShieldCheck, Shirt, Theater, Utensils } from 'lucide-react';
import { PageHero } from '@/components/common/PageHero';
import { TabNav } from '@/components/common/TabNav';
import { Logo } from '@/components/common/Logo';
import { coreValuesOf, useSiteSettings } from '@/services/content';
import { usePageMeta } from '@/lib/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

const TABS = [
  { key: 'story', label: 'Our Story', icon: History },
  { key: 'mission-vision', label: 'Mission & Vision', icon: Compass },
  { key: 'philosophy', label: 'Philosophy', icon: Heart },
  { key: 'values', label: 'Core Values', icon: ShieldCheck },
];

// From the centre's own history (client questionnaire, 2026).
const FACILITIES_HISTORY = [
  {
    icon: BedDouble,
    title: 'Rooms for 62 guests',
    text: 'The centre opened with twenty rooms of two beds each. A later block increased the total capacity to 62 beds.',
  },
  {
    icon: Building,
    title: 'Administration & conference block',
    text: 'Offices, a large conference room and three rooms for small group meetings.',
  },
  {
    icon: Utensils,
    title: 'Dining & sitting hall',
    text: 'Serves groups of 150 for meals, and larger numbers for celebrations such as ordinations and wedding receptions.',
  },
  {
    icon: Church,
    title: 'Chapel for about 70',
    text: 'Used for staff Masses, retreats and courses with a religious orientation.',
  },
  {
    icon: Home,
    title: 'Guest House',
    text: 'Six self-contained apartments for priests and important visitors to the Diocese, especially from abroad.',
  },
  {
    icon: Shirt,
    title: 'Laundry',
    text: 'A well-equipped laundry, also available to guests.',
  },
  {
    icon: Theater,
    title: 'Natural amphitheatre',
    text: 'A raised platform for well-attended religious and other celebrations, outdoor cinema, theatre and public meetings.',
  },
];

const DIOCESE_STATS = [
  { value: '44', label: 'Parishes' },
  { value: '7', label: 'Deaneries' },
  { value: '39,619 km²', label: 'Narok & Kajiado Counties' },
  { value: '356,693', label: 'Catholics (Census 2019)' },
];

const DIOCESE_PEOPLE = [
  { value: '70+', label: 'Diocesan priests' },
  { value: '60+', label: 'Religious priests & brothers' },
  { value: '200+', label: 'Women religious' },
  { value: '700+', label: 'Catechists' },
];

function Story() {
  return (
    <div className="space-y-20">
      <section className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <p className="eyebrow">Opened 1 November 1986</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-sky-950 leading-tight text-balance">
            Watakatifu Wote Senta, the All Saints Conference Centre
          </h2>
          <div className="mt-6 space-y-5 text-base text-stone-700 leading-relaxed">
            <p>
              Watakatifu Wote Senta (WWS), otherwise known as All Saints Conference Centre, was officially opened on the Feast of All Saints,{' '}
              <strong>1 November 1986</strong>. It became available just when Ngong wanted to run training courses for various programmes using its
              own trained personnel.
            </p>
            <p>
              While Diocesan programmes had priority, the centre was available for any group: Diocesan or non-Diocesan, Catholic or non-Catholic,
              even Government.
            </p>
            <p>
              The centre has been a fantastic success. It has had a tremendous impact on the people of the Diocese, because education and training
              have been among the most important activities of the Diocese in religious and secular matters.
            </p>
          </div>
        </div>
        <aside className="lg:col-span-5 card p-8 text-center">
          <Logo className="mx-auto h-44 w-auto" />
          <p className="mt-6 font-serif text-2xl italic text-sky-900">&ldquo;Ipse enim est pax nostra&rdquo;</p>
          <p className="mt-1 text-sm text-stone-500">For he himself is our peace (Ephesians 2:14)</p>
        </aside>
      </section>

      <section>
        <p className="eyebrow">The centre</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-sky-950">What the centre offers</h2>
        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FACILITIES_HISTORY.map(({ icon: Icon, title, text }) => (
            <li key={title} className="card p-6">
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold text-sky-950">{title}</h3>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-sky-950 text-white p-8 sm:p-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <p className="eyebrow text-gold-300!">
              <Landmark className="w-3.5 h-3.5" /> Catholic Diocese of Ngong
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold leading-tight">Serving Narok and Kajiado Counties</h2>
            <div className="mt-5 space-y-4 text-sky-100/85 leading-relaxed">
              <p>
                The Catholic Diocese of Ngong operates in the southern part of the Rift Valley, serving Narok and Kajiado Counties over an area of
                about 39,619 km². Kajiado County has a population of 1,117,840 and Narok County 1,157,873 (Census 2019), of whom 356,693 are
                Catholics: 152,607 in Narok and 204,086 in Kajiado.
              </p>
              <p>
                The inhabitants are largely cosmopolitan, with the Maasai making up about 60% of the population. The current Bishop of the Diocese is{' '}
                <strong className="text-white">Rt. Rev. John Oballa Owaa</strong>.
              </p>
              <p>
                The Diocese has 44 parishes in seven deaneries: Kilgoris, Ololulunga, Narok, Ngong, Kiserian, Kajiado and Oloitokitok.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 content-start">
            {[...DIOCESE_STATS, ...DIOCESE_PEOPLE].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="font-serif text-3xl font-semibold text-gold-200">{s.value}</div>
                <div className="mt-1 text-sm text-sky-100/75">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MissionVision() {
  const { settings } = useSiteSettings();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[
        { label: 'Vision', text: settings.vision, icon: Compass },
        { label: 'Mission', text: settings.mission, icon: Heart },
      ].map(({ label, text, icon: Icon }) => (
        <article key={label} className="card p-8 sm:p-10">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Icon className="w-6 h-6" />
          </span>
          <p className="eyebrow mt-6">{label} statement</p>
          <blockquote className="mt-3 font-serif text-3xl sm:text-4xl italic leading-snug text-sky-950">&ldquo;{text}&rdquo;</blockquote>
        </article>
      ))}
    </div>
  );
}

function Philosophy() {
  const { settings } = useSiteSettings();
  return (
    <div className="rounded-3xl bg-parchment-deep p-8 sm:p-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Diocesan philosophy</p>
        <blockquote className="mt-4 font-serif text-3xl sm:text-4xl italic leading-snug text-sky-950">&ldquo;{settings.philosophy}&rdquo;</blockquote>
        <ul className="mt-10 grid sm:grid-cols-3 gap-4">
          {['The sanctity of life', 'Care for the planet, Mother Earth', 'Service to mankind is service to God'].map((point) => (
            <li key={point} className="rounded-2xl bg-white p-5 text-sm font-semibold text-sky-950 shadow-soft">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Values() {
  const { settings } = useSiteSettings();
  return (
    <div>
      <p className="max-w-2xl text-base text-stone-600 leading-relaxed">
        The values of the Catholic Diocese of Ngong are founded on Catholic Social Teaching and identity.
      </p>
      <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coreValuesOf(settings).map((v, i) => (
          <li key={v.title} className="card p-7">
            <span className="font-serif text-4xl font-semibold text-gold-400">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-serif text-2xl font-semibold text-sky-950">{v.title}</h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{v.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

const PANELS: Record<string, React.FC> = { story: Story, 'mission-vision': MissionVision, philosophy: Philosophy, values: Values };

export const AboutPage: React.FC = () => {
  const { tab = 'story' } = useParams();
  const current = TABS.find((t) => t.key === tab);
  usePageMeta({
    title: current ? `About: ${current.label}` : 'About',
    description:
      'Watakatifu Wote Senta (All Saints Conference Centre) was opened on 1 November 1986 by the Catholic Diocese of Ngong. Our history, mission, vision and values.',
  });
  if (!current) return <NotFoundPage />;
  const Panel = PANELS[tab];

  return (
    <div>
      <PageHero
        eyebrow="About us"
        title="Four decades of welcome in Ngong"
        subtitle="Watakatifu Wote Senta, the All Saints Conference Centre, opened on the Feast of All Saints in 1986 under the Catholic Diocese of Ngong."
        image="https://images.unsplash.com/photo-1535756736290-ec9480a7eaf0?auto=format&fit=crop&w=1800&q=70"
        crumbs={[{ label: 'About', to: '/about' }, { label: current.label }]}
      />
      <TabNav basePath="/about" items={TABS} active={tab} label="About sections" />
      <div key={tab} className="container-page animate-in fade-in duration-300">
        <Panel />
      </div>
    </div>
  );
};
