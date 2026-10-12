import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bed, BookOpen, Building2, CalendarCheck, CheckCircle2, ChevronDown, Clock, MessageSquare, Phone, ShoppingBag, Users, Utensils } from 'lucide-react';
import { useFacilities, useGallery, useRetreats, useSiteSettings } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { AvailabilityMatrix } from '@/components/availability/AvailabilityMatrix';
import { SectionHeader } from '@/components/common/SectionHeader';
import { LoadingGrid, QueryState } from '@/components/common/States';
import { formatKes, shortHallName, telHref, whatsappHref } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';

const SERVICES = [
  {
    to: '/hospitality/conference',
    icon: Building2,
    tone: 'bg-sky-100 text-sky-800',
    hover: 'hover:border-sky-300',
    link: 'text-sky-800',
    title: 'Conference Facilities',
    text: 'Three equipped halls (St. Bakhita, St. Julian, St. Bernard) for 8 to 100 people, with Wi-Fi, projector and sound system.',
    cta: 'View halls & rates',
  },
  {
    to: '/hospitality/accommodation',
    icon: Bed,
    tone: 'bg-amber-100 text-amber-800',
    hover: 'hover:border-amber-300',
    link: 'text-amber-800',
    title: 'Accommodation',
    text: 'Quiet residential wings plus self-contained guest apartments for facilitators, clergy and retreatants.',
    cta: 'Explore stay options',
  },
  {
    to: '/hospitality/catering',
    icon: Utensils,
    tone: 'bg-orange-100 text-orange-800',
    hover: 'hover:border-orange-300',
    link: 'text-orange-800',
    title: 'Catering & Dining',
    text: 'Kenyan tea breaks, buffet lunches and celebration meals for conferences and spiritual groups.',
    cta: 'Catering services',
  },
  {
    to: '/ministry',
    icon: BookOpen,
    tone: 'bg-sky-100 text-sky-800',
    hover: 'hover:border-sky-300',
    link: 'text-sky-800',
    title: 'Catholic Ministry',
    text: 'Daily Mass in our chapel, individual and group retreats, pastoral seminars and peaceful prayer gardens.',
    cta: 'Mass & retreats',
  },
  {
    to: '/products',
    icon: ShoppingBag,
    tone: 'bg-purple-100 text-purple-800',
    hover: 'hover:border-purple-300',
    link: 'text-purple-800',
    title: 'Products Catalogue',
    text: 'Catholic books, Bibles, missals, rosaries and devotional gifts available at the centre.',
    cta: 'Browse catalogue',
  },
];

export const HomePage: React.FC = () => {
  usePageMeta({});
  const { settings } = useSiteSettings();
  const { openInquiry } = useInquiryModal();
  const facilities = useFacilities();
  const retreats = useRetreats();
  const gallery = useGallery();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#1C1917] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=2000&q=80"
            alt=""
            className="w-full h-full object-cover object-center opacity-40"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#141211]/80 via-[#1C1917]/60 to-[#1C1917]/95" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20">
          <div className="inline-flex flex-wrap justify-center items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-sky-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-400" aria-hidden />
            <span>{settings.diocese}</span>
            <span className="text-white/40" aria-hidden>•</span>
            <span>Est. 1 November 1986</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Hospitality, Faith & Community
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-stone-200 font-light max-w-3xl mx-auto leading-relaxed">
            Welcome to Watakatifu Wote Senta, a peaceful Catholic conference, retreat and hospitality centre on Kahara Road in Ngong, Kenya.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/hospitality"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base shadow-lg"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => openInquiry('conference')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base backdrop-blur-md border border-white/30"
            >
              <CalendarCheck className="w-5 h-5 text-sky-300" />
              <span>Make an Inquiry</span>
            </button>
          </div>

          <dl className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              [settings.daily_mass_time, 'Daily Morning Mass'],
              ['3 Halls', '8 to 100 people'],
              ['62 Beds', '& 6 guest apartments'],
              ['44 Parishes', 'Diocese of Ngong'],
            ].map(([value, label]) => (
              <div key={label} className="p-2">
                <dd className="text-xl sm:text-2xl font-serif font-bold text-amber-200">{value}</dd>
                <dt className="text-xs text-stone-300 font-medium mt-0.5">{label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex justify-center">
            <a href="#quick-services" className="flex flex-col items-center gap-1 text-xs text-stone-400 hover:text-white transition-colors">
              <span>Discover more</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="quick-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-32">
        <SectionHeader
          badge="What We Offer"
          title="Hospitality, Ministry & Professional Services"
          subtitle="Conference spaces, retreat facilities, catering and Catholic spiritual programmes in one peaceful campus."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {SERVICES.map(({ to, icon: Icon, tone, hover, link, title, text, cta }) => (
            <Link
              key={to}
              to={to}
              className={`group bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs hover:shadow-md ${hover} transition-all flex flex-col justify-between`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">{text}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${link} pt-2 border-t border-stone-100`}>
                <span>{cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E3DAC9] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-3 py-1 rounded-md">
              About Watakatifu Wote Senta
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-snug">
              Serving the Diocese of Ngong & Groups Across Kenya Since 1986
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Opened on <strong>1 November 1986</strong>, the Solemnity of All Saints, Watakatifu Wote Senta is an institution of the Catholic
              Diocese of Ngong. For nearly four decades it has welcomed parishes, religious congregations, ecumenical partners, organisations and
              government delegations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {settings.mission && (
                <div className="p-4 rounded-xl bg-white border border-stone-200">
                  <div className="font-serif font-bold text-sm mb-1 text-sky-900">Our Mission</div>
                  <p className="text-xs text-stone-600 italic">&ldquo;{settings.mission}&rdquo;</p>
                </div>
              )}
              {settings.philosophy && (
                <div className="p-4 rounded-xl bg-white border border-stone-200">
                  <div className="font-serif font-bold text-sm mb-1 text-sky-900">Our Philosophy</div>
                  <p className="text-xs text-stone-600">{settings.philosophy}</p>
                </div>
              )}
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-xs"
            >
              <span>Learn more about our history</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80"
                alt="Chapel and grounds at Watakatifu Wote Senta"
                className="w-full h-80 sm:h-96 object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-sky-800 text-white p-4 rounded-xl shadow-lg text-xs max-w-[240px] border border-sky-600 hidden sm:block">
              <div className="font-bold text-amber-200 font-serif text-sm">Feast of All Saints</div>
              <div className="mt-1 text-stone-200">Opened 1 November 1986 on Kahara Road, Ngong.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Conference highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">Hospitality & Business Services</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">Conference Facilities in Ngong</h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Meeting rooms with 155 chairs and tables on campus, Wi-Fi, projector, sound system and purified water.
            </p>
          </div>
          <Link to="/hospitality/conference" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 self-start md:self-auto">
            <span>View full specifications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <QueryState query={facilities}>
          {(halls) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {halls.map((facility) => (
                <article key={facility.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      {facility.image_url && <img src={facility.image_url} alt={facility.name} className="w-full h-full object-cover" loading="lazy" />}
                      <div className="absolute top-3 right-3 bg-stone-950/80 text-white px-3 py-1 rounded-lg text-xs font-bold">{formatKes(facility.price_kes)}</div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1">
                        <span className="font-medium inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sky-700" />
                          <strong>
                            {facility.capacity_min}–{facility.capacity_max} people
                          </strong>
                        </span>
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-semibold text-stone-700 truncate">
                          {facility.seating_styles.join(' / ')}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-stone-900 mt-1 mb-2">{facility.name}</h3>
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">{facility.description}</p>
                      <ul className="space-y-1.5 pb-2">
                        {facility.features.slice(0, 3).map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-xs text-stone-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => openInquiry('conference', { facilityId: facility.id })}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold"
                    >
                      Request {shortHallName(facility.name)}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </QueryState>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AvailabilityMatrix />
      </div>

      {/* Accommodation & catering teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-[#E3DAC9] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                <Bed className="w-3.5 h-3.5" />
                <span>Restful Stay</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Accommodation & Guest House</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Residential wings with up to 62 beds, plus <strong>6 self-contained guest house apartments</strong>. Ideal for retreatants, visiting
                priests, workshop participants and conference delegates.
              </p>
            </div>
            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => openInquiry('accommodation')} className="px-4 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold">
                Request accommodation
              </button>
              <Link to="/hospitality/accommodation" className="px-4 py-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                Learn more
              </Link>
            </div>
          </div>

          <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-[#E3DAC9] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded">
                <Utensils className="w-3.5 h-3.5" />
                <span>Wholesome Dining</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Hospitality Catering Services</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Conference teas, Kenyan snacks, buffet meals and celebration banquets for retreatants and special gatherings. Purified water is
                provided in every hall.
              </p>
            </div>
            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => openInquiry('catering')} className="px-4 py-2.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold">
                Make a catering inquiry
              </button>
              <Link to="/hospitality/catering" className="px-4 py-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                View services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry highlight */}
      <section className="bg-[#1C1917] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-900/50 px-3 py-1 rounded-full border border-amber-800/60">
                Spiritual Life & Formation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">Catholic Ministry at Watakatifu Wote</h2>
              <p className="text-sm text-stone-300 mt-1 max-w-2xl">A place for the sacraments, silent prayer and pastoral formation in the Diocese of Ngong.</p>
            </div>
            <Link to="/ministry" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 self-start md:self-auto">
              <span>Explore all ministry programmes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-stone-900/90 rounded-2xl p-6 border border-stone-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Chapel Schedule</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-2">Daily Morning Mass</h3>
                <div className="text-3xl font-serif font-bold text-amber-200 mb-3">{settings.daily_mass_time} daily</div>
                <p className="text-xs text-stone-300 leading-relaxed mb-4">
                  Celebrated every morning in the centre&apos;s chapel. Open to retreatants, conference groups and local parishioners.
                </p>
              </div>
              <Link
                to="/ministry/mass"
                className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold border border-stone-700 text-center"
              >
                Mass & liturgical information
              </Link>
            </div>

            {retreats.isPending ? (
              <LoadingGrid count={2} className="contents" itemClassName="h-80 bg-stone-800!" />
            ) : (
              (retreats.data ?? []).slice(0, 2).map((ret) => (
                <article key={ret.id} className="bg-stone-900/90 rounded-2xl overflow-hidden border border-stone-800 flex flex-col justify-between">
                  <div>
                    <div className="h-40 w-full overflow-hidden relative">
                      {ret.image_url && <img src={ret.image_url} alt={ret.title} className="w-full h-full object-cover" loading="lazy" />}
                      <div className="absolute top-3 left-3 bg-stone-950/80 text-sky-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {ret.category} retreat
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold text-white mb-2 line-clamp-1">{ret.title}</h3>
                      <p className="text-xs text-stone-400 line-clamp-2 mb-3">{ret.description}</p>
                      <div className="text-xs text-stone-300 font-medium">
                        Duration: <strong>{ret.duration}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => openInquiry('retreat', { retreatId: ret.id })}
                      className="w-full py-2 px-3 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold"
                    >
                      Register / inquire
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">Visual Impressions</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">Our Facilities & Peaceful Grounds</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950">
            <span>View complete gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <QueryState query={gallery} loading={<LoadingGrid count={4} className="grid grid-cols-2 lg:grid-cols-4 gap-4" itemClassName="h-56" />}>
          {(images) => (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {images.slice(0, 4).map((img) => (
                <Link
                  key={img.id}
                  to={`/gallery?category=${encodeURIComponent(img.category)}`}
                  className="group relative h-56 rounded-2xl overflow-hidden shadow-xs border border-stone-200"
                >
                  <img src={img.image_url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">{img.category}</span>
                    <span className="font-serif font-bold text-sm text-stone-100 leading-tight mt-0.5">{img.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </QueryState>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-sky-900 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-800 text-sky-200 text-xs font-bold uppercase tracking-wider">
              Planning a conference, retreat or event?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">Experience Catholic Hospitality on Kahara Road, Ngong</h2>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
              Whether you are organising a parish retreat, an NGO seminar, a clergy gathering or a board meeting, our team is ready to help.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => openInquiry('conference')} className="px-6 py-3 rounded-xl bg-white text-sky-950 font-bold text-sm shadow-md hover:bg-stone-100">
                Request a facility booking
              </button>
              <a
                href={telHref(settings.phone)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-800/80 hover:bg-sky-800 text-white font-semibold text-sm border border-sky-700"
              >
                <Phone className="w-4 h-4" />
                <span>Call {settings.phone_display}</span>
              </a>
              <a
                href={whatsappHref(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp us</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
