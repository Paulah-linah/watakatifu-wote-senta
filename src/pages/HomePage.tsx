import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Quote, Users } from 'lucide-react';
import { isCurrentRetreat, useEvents, useFacilities, useGallery, useRetreats, useSiteSettings } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { AvailabilityMatrix } from '@/components/availability/AvailabilityMatrix';
import { SectionHeader } from '@/components/common/SectionHeader';
import { LoadingGrid, QueryState } from '@/components/common/States';
import { formatDate, todayISO } from '@/lib/dates';
import { HALL_RATES_PHONE, HALL_RATES_PHONE_DISPLAY, telHref } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';

const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// The six services named in the client questionnaire.
const SERVICES = [
  {
    to: '/hospitality/conference',
    title: 'Conference facilities',
    text: 'Three halls for 8 to 100 people, with projector, sound system and Wi-Fi.',
    image: img('photo-1431540015161-0bf868a2d407', 900),
  },
  {
    to: '/hospitality/accommodation',
    title: 'Accommodation',
    text: '62 beds and a guest house with six self-contained apartments.',
    image: 'https://lzphdqkpswzhxlwqwxbp.supabase.co/storage/v1/object/public/media/accommodation/bedroom-1.webp',
  },
  {
    to: '/ministry/retreats',
    title: 'Retreats',
    text: 'Individual and group retreats, planned around your request.',
    image: img('photo-1479648230934-2ab6525f4847', 900),
  },
  {
    to: '/ministry/prayer',
    title: 'Spiritual counselling',
    text: 'Quiet time and spiritual guidance in our chapel.',
    image: img('photo-1430747562296-5556d17a15a5', 900),
  },
  {
    to: '/hospitality/catering',
    title: 'Outside catering',
    text: 'Meals for conferences, retreats, events and private functions.',
    image: img('photo-1555244162-803834f70033', 900),
  },
  {
    to: '/products',
    title: 'Catholic bookshop',
    text: 'Bibles, missals, prayer materials and devotional gifts.',
    image: img('photo-1544716278-ca5e3f4abd8c', 900),
  },
];

function Hero() {
  const { settings } = useSiteSettings();
  const { openInquiry } = useInquiryModal();
  return (
    <section className="relative isolate overflow-hidden bg-sky-950 text-white">
      <img
        src={img('photo-1698822079732-501a7e06860f', 2000)}
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover opacity-55 animate-in fade-in zoom-in-105 duration-[1500ms]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-sky-950 via-sky-950/80 to-sky-950/20" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-sky-950/80 to-transparent" aria-hidden />

      <div className="container-page pt-20 pb-36 sm:pt-28 sm:pb-44 lg:pt-36 lg:pb-52">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="eyebrow text-gold-300!">{settings.diocese} · Since 1986</p>
          <h1 className="mt-5 font-serif text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-semibold text-balance">
            A place of hospitality, <em className="text-gold-300 font-medium">prayer</em> and community
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sky-100/85 leading-relaxed text-pretty">
            Conference halls, peaceful accommodation, retreats and daily Mass on Kahara Road, Ngong. A Catholic centre that welcomes everyone.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => openInquiry('conference')} className="btn btn-gold text-base px-6 py-3">
              Plan your visit <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/hospitality" className="btn btn-ghost-light text-base px-6 py-3">
              Explore our services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsCard() {
  const { settings } = useSiteSettings();
  const stats = [
    { value: settings.daily_mass_time, label: 'Daily morning Mass' },
    { value: '3 halls', label: 'For 8 to 100 people' },
    { value: '62 beds', label: 'Plus 6 guest apartments' },
    { value: '1986', label: 'Opened on All Saints Day' },
  ];
  return (
    <div className="container-page relative z-10 -mt-20 sm:-mt-24">
      <dl className="card grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`p-5 sm:p-7 border-sand/70 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0 lg:border-l' : ''}`}
          >
            <dd className="font-serif text-3xl sm:text-4xl font-semibold text-sky-900">{s.value}</dd>
            <dt className="mt-1 text-xs sm:text-sm text-stone-500">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Welcome() {
  const { settings } = useSiteSettings();
  return (
    <section className="container-page grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
      <div className="relative order-2 lg:order-1">
        <div className="grid grid-cols-5 gap-4">
          <img
            src={img('photo-1720383857984-7e9a9b11eba4', 900)}
            alt="The chapel at Watakatifu Wote Senta"
            className="col-span-3 h-80 sm:h-[26rem] w-full object-cover rounded-3xl shadow-lift"
            loading="lazy"
          />
          <div className="col-span-2 flex flex-col gap-4 pt-10">
            <img src="https://lzphdqkpswzhxlwqwxbp.supabase.co/storage/v1/object/public/media/accommodation/st-desmond-block.webp" alt="The St. Desmond accommodation block" className="h-44 sm:h-52 w-full object-cover rounded-3xl" loading="lazy" />
            <div className="rounded-3xl bg-sky-900 text-white p-5">
              <p className="font-serif text-3xl font-semibold text-gold-300">{new Date().getFullYear() - 1986}</p>
              <p className="text-xs text-sky-100/80 mt-1">years of welcome since All Saints Day 1986</p>
            </div>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <p className="eyebrow">Welcome</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.1] text-balance">
          Serving the Diocese of Ngong and groups from across Kenya
        </h2>
        <p className="mt-5 text-stone-600 leading-relaxed text-pretty">
          Watakatifu Wote Senta, the All Saints Conference Centre, was opened on the Feast of All Saints, 1 November 1986. Diocesan programmes come
          first, but the centre welcomes any group: Diocesan or non-Diocesan, Catholic or non-Catholic, even Government.
        </p>
        {settings.mission && (
          <figure className="mt-8 border-l-2 border-gold-400 pl-5">
            <Quote className="w-5 h-5 text-gold-400 mb-2" aria-hidden />
            <blockquote className="font-serif text-xl sm:text-2xl italic text-sky-950 leading-snug">{settings.mission}</blockquote>
            <figcaption className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">Our mission</figcaption>
          </figure>
        )}
        <Link to="/about" className="mt-8 btn btn-outline">
          Our story <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="container-page">
      <SectionHeader badge="Our services" title="Everything your group needs, in one peaceful place" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s) => (
          <Link key={s.title} to={s.to} className="group relative isolate h-80 overflow-hidden rounded-3xl shadow-soft">
            <img src={s.image} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover img-zoom" loading="lazy" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-sky-950/95 via-sky-950/30 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="font-serif text-2xl font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-sky-100/85">{s.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
                Learn more <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Halls() {
  const facilities = useFacilities();
  const { openInquiry } = useInquiryModal();
  return (
    <section className="container-page">
      <SectionHeader
        badge="Conference facilities"
        title="Halls for meetings, seminars and assemblies"
        subtitle="Wi-Fi, projector, sound system and purified water, with 155 chairs and tables on campus."
        action={
          <Link to="/hospitality/conference" className="btn btn-outline">
            Full details <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
      <QueryState query={facilities} loading={<LoadingGrid itemClassName="h-[28rem]" />}>
        {(halls) => (
          <div className="grid md:grid-cols-3 gap-6">
            {halls.map((f) => (
              <article key={f.id} className="group card card-hover overflow-hidden flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  {f.image_url && <img src={f.image_url} alt={f.name} className="w-full h-full object-cover img-zoom" loading="lazy" />}
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-sky-950">
                    <Users className="w-3.5 h-3.5 text-gold-600" />
                    {f.capacity_min}–{f.capacity_max} people
                  </span>
                </div>
                <div className="p-6 flex flex-col grow">
                  <h3 className="font-serif text-2xl font-semibold text-sky-950">{f.name}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-3">{f.description}</p>
                  <div className="mt-auto pt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone-500">Hall rates</p>
                      <p className="font-serif text-xl font-semibold text-sky-900">On request</p>
                      <a href={telHref(HALL_RATES_PHONE)} className="text-xs font-semibold text-sky-800 hover:underline">
                        {HALL_RATES_PHONE_DISPLAY}
                      </a>
                    </div>
                    <button type="button" onClick={() => openInquiry('conference', { facilityId: f.id })} className="btn btn-primary">
                      Request details & rates
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </section>
  );
}

function Ministry() {
  const { settings } = useSiteSettings();
  const retreats = useRetreats();
  const { openInquiry } = useInquiryModal();
  return (
    <section className="relative bg-sky-950 text-white py-20 sm:py-28 overflow-hidden">
      <div className="absolute -right-32 -top-32 w-[32rem] h-[32rem] rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
      <div className="container-page relative">
        <SectionHeader
          inverted
          badge="Spiritual life"
          title="Daily Mass, retreats and formation"
          subtitle="A quiet place to pray, reflect and grow in faith, under the pastoral care of the Diocese of Ngong."
          action={
            <Link to="/ministry" className="btn btn-ghost-light">
              All ministry programmes <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
        <div className="grid lg:grid-cols-3 gap-6">
          <Link to="/ministry/mass" className="group rounded-3xl bg-linear-to-br from-gold-300 to-gold-400 text-ink p-8 flex flex-col justify-between min-h-80">
            <div>
              <Clock className="w-7 h-7" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em]">Every morning</p>
              <p className="font-serif text-6xl font-semibold mt-1">{settings.daily_mass_time}</p>
              <p className="mt-3 text-ink/75">Holy Mass in the centre&apos;s chapel. Everyone is welcome.</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">
              Mass schedule <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          {retreats.isPending ? (
            <LoadingGrid count={2} className="contents" itemClassName="h-80 bg-white/10!" />
          ) : (
            (retreats.data ?? []).filter((r) => isCurrentRetreat(r, todayISO())).slice(0, 2).map((r) => (
              <article key={r.id} className="group rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex flex-col">
                <div className="h-44 overflow-hidden">{r.image_url && <img src={r.image_url} alt="" className="w-full h-full object-cover img-zoom" loading="lazy" />}</div>
                <div className="p-6 flex flex-col grow">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">
                    {r.start_date ? formatDate(r.start_date, { day: 'numeric', month: 'long' }) : `${r.category} retreat`}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-2 text-sm text-sky-100/70 line-clamp-2">{r.description}</p>
                  <button
                    type="button"
                    onClick={() => openInquiry('retreat', { retreatId: r.id })}
                    className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200 self-start"
                  >
                    Register interest <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const events = useEvents();
  const { openInquiry } = useInquiryModal();
  const today = todayISO();
  const upcoming = (events.data ?? []).filter((e) => e.event_date >= today).slice(0, 3);
  if (!events.isPending && upcoming.length === 0) return null;
  return (
    <section className="container-page">
      <SectionHeader
        badge="Coming up"
        title="Upcoming events"
        action={
          <Link to="/events" className="btn btn-outline">
            All events <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
      <ul className="card divide-y divide-sand/70">
        {upcoming.map((e) => (
          <li key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 p-5 sm:p-7">
            <time dateTime={e.event_date} className="shrink-0 w-20 text-center rounded-2xl bg-parchment border border-sand/70 py-2.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gold-600">{formatDate(e.event_date, { month: 'short' })}</span>
              <span className="block font-serif text-3xl font-semibold text-sky-950 leading-none mt-0.5">{formatDate(e.event_date, { day: 'numeric' })}</span>
            </time>
            <div className="grow min-w-0">
              <h3 className="font-serif text-2xl font-semibold text-sky-950">{e.title}</h3>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                {e.time_label && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {e.time_label}
                  </span>
                )}
                {e.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {e.location}
                  </span>
                )}
              </p>
            </div>
            {e.registration_open && (
              <button type="button" onClick={() => openInquiry('event', { eventId: e.id })} className="btn btn-outline shrink-0">
                <CalendarDays className="w-4 h-4" /> Register
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GalleryMosaic() {
  const gallery = useGallery();
  return (
    <section className="container-page">
      <SectionHeader
        badge="Gallery"
        title="Our grounds and spaces"
        action={
          <Link to="/gallery" className="btn btn-outline">
            View the gallery <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
      <QueryState query={gallery} loading={<LoadingGrid count={4} className="grid grid-cols-2 lg:grid-cols-4 gap-4" itemClassName="h-56" />}>
        {(images) => (
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[11rem] sm:auto-rows-[13rem] gap-4">
            {images.slice(0, 5).map((g, i) => (
              <Link
                key={g.id}
                to={`/gallery?category=${encodeURIComponent(g.category)}`}
                className={`group relative overflow-hidden rounded-3xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
              >
                <img src={g.image_url} alt={g.title} className="w-full h-full object-cover img-zoom" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/70 to-transparent text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </QueryState>
    </section>
  );
}

export const HomePage: React.FC = () => {
  usePageMeta({});
  return (
    <div className="space-y-24 sm:space-y-32">
      <div>
        <Hero />
        <StatsCard />
      </div>
      <Welcome />
      <Services />
      <Halls />
      <div className="container-page">
        <AvailabilityMatrix />
      </div>
      <Ministry />
      <UpcomingEvents />
      <GalleryMosaic />
    </div>
  );
};
