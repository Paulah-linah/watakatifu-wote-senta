import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { useSiteSettings } from '@/services/content';
import { telHref, whatsappHref } from '@/lib/format';
import { Logo } from '@/components/common/Logo';

const COLUMNS = [
  {
    title: 'Hospitality',
    links: [
      { to: '/hospitality/conference', label: 'Conference halls' },
      { to: '/hospitality/accommodation', label: 'Accommodation' },
      { to: '/hospitality/catering', label: 'Catering' },
      { to: '/hospitality/laundry', label: 'Laundry' },
      { to: '/hospitality/water', label: 'Water services' },
    ],
  },
  {
    title: 'Ministry',
    links: [
      { to: '/ministry/mass', label: 'Mass schedule' },
      { to: '/ministry/retreats', label: 'Retreats' },
      { to: '/ministry/formation', label: 'Formation' },
      { to: '/ministry/prayer', label: 'Chapel & counselling' },
      { to: '/events', label: 'Events' },
    ],
  },
  {
    title: 'Centre',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/products', label: 'Catholic bookshop' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/contact', label: 'Contact & directions' },
      { to: '/admin', label: 'Staff login' },
    ],
  },
];

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-sky-950 text-sky-100/80 mt-28">
      {/* Call to action band */}
      <div className="container-page">
        <div className="relative -mt-16 rounded-3xl bg-linear-to-br from-gold-300 to-gold-400 text-ink px-6 py-8 sm:px-10 sm:py-10 shadow-lift flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-semibold leading-tight">Planning a retreat, conference or celebration?</p>
            <p className="mt-1 text-sm text-ink/75">Tell us your dates and group size. We will confirm availability and rates.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/inquiry" className="btn bg-ink text-white hover:bg-sky-950">
              Start an inquiry <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={telHref(settings.phone)} className="btn border border-ink/25 hover:bg-white/40">
              <Phone className="w-4 h-4" /> {settings.phone_display}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-2 lg:col-span-3 space-y-5">
            <div className="space-y-4">
              <Logo framed className="h-28 w-auto" />
              <div>
                <p className="font-serif text-2xl font-semibold text-white leading-none">Watakatifu Wote Senta</p>
                <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-gold-300">All Saints Centre · Ngong</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              A place of hospitality, prayer and formation of the {settings.diocese}, welcoming groups and guests since 1986.
            </p>
            {settings.vision && <p className="font-serif text-lg italic text-gold-200/90 max-w-sm">&ldquo;{settings.vision}&rdquo;</p>}
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="lg:col-span-2">
              <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">{col.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-gold-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 lg:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">Visit</h2>
            <address className="not-italic space-y-3 text-sm">
              <p className="flex gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                {settings.address}
              </p>
              <a href={`mailto:${settings.email}`} className="flex gap-2.5 hover:text-gold-300 break-all">
                <Mail className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                {settings.email}
              </a>
              <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 hover:text-gold-300">
                <MessageSquare className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                WhatsApp us
              </a>
              <p className="flex gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                Daily Mass {settings.daily_mass_time}
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 pt-6 pb-16 sm:pb-0 sm:pr-36 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sky-100/50">
          <p>© {new Date().getFullYear()} Watakatifu Wote Senta · All Saints Conference Centre, Ngong</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2">
            <span>An institution of the {settings.diocese}</span>
            <span aria-hidden>·</span>
            <span>
              Website by <span className="text-sky-100/80 font-medium">PN Innovations</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
