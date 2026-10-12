import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { useSiteSettings } from '@/services/content';
import { telHref, whatsappHref } from '@/lib/format';

const COLUMNS = [
  {
    title: 'Hospitality & Services',
    links: [
      { to: '/hospitality/conference', label: 'Conference Facilities' },
      { to: '/hospitality/accommodation', label: 'Accommodation' },
      { to: '/hospitality/catering', label: 'Catering Services' },
      { to: '/hospitality/laundry', label: 'Laundry Services' },
      { to: '/hospitality/water', label: 'Water Services' },
    ],
  },
  {
    title: 'Ministry & Resources',
    links: [
      { to: '/ministry/mass', label: 'Mass Schedule' },
      { to: '/ministry/retreats', label: 'Spiritual Retreats' },
      { to: '/ministry/formation', label: 'Formation & Seminars' },
      { to: '/ministry/prayer', label: 'Chapel & Prayer Grounds' },
      { to: '/products', label: 'Products Catalogue' },
      { to: '/events', label: 'Events' },
      { to: '/gallery', label: 'Photo Gallery' },
    ],
  },
];

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const founded = settings.founded_on ? new Date(`${settings.founded_on}T00:00:00Z`) : null;

  return (
    <footer className="bg-[#1C1917] text-stone-300 border-t border-stone-800">
      <div className="bg-[#141211] border-b border-stone-800 py-4 px-4 sm:px-6 lg:px-8 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            An institution of the <span className="text-sky-400 font-medium">{settings.diocese}</span>, serving Kajiado and Narok Counties.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-medium">
              <Clock className="w-3.5 h-3.5" /> Daily Mass {settings.daily_mass_time}
            </span>
            {founded && (
              <>
                <span aria-hidden>•</span>
                <span>Established {founded.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-700 flex items-center justify-center ring-1 ring-sky-500" aria-hidden>
                <div className="relative flex flex-col items-center">
                  <div className="w-0.5 h-5 bg-amber-200" />
                  <div className="w-3.5 h-0.5 bg-amber-200 absolute top-1.5" />
                </div>
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white tracking-wide">WATAKATIFU WOTE SENTA</p>
                <p className="text-xs text-sky-400 tracking-wider uppercase font-medium">All Saints Conference Centre, Ngong</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed pr-4">
              Opened on the Feast of All Saints in 1986. A peaceful place for hospitality, diocesan formation, spiritual retreat and professional
              conferences in Ngong, Kenya.
            </p>
            {settings.vision && (
              <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                <div className="text-amber-300 font-semibold font-serif text-sm">Our Vision</div>
                <p className="italic text-stone-300">&ldquo;{settings.vision}&rdquo;</p>
              </div>
            )}
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-sans">{col.title}</h2>
              <ul className="space-y-2 text-sm text-stone-400">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-sans">Contact & Inquiries</h2>
            <address className="not-italic space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <a href={telHref(settings.phone)} className="flex items-center gap-2.5 hover:text-white font-medium text-stone-200">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                {settings.phone_display}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-white break-all">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                {settings.email}
              </a>
              <a
                href={whatsappHref(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </address>
            <Link
              to="/inquiry"
              className="block w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 text-center"
            >
              Submit a booking request
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Watakatifu Wote Senta / All Saints Conference Centre. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-stone-300">
              About
            </Link>
            <span aria-hidden>•</span>
            <Link to="/contact" className="hover:text-stone-300">
              Contact
            </Link>
            <span aria-hidden>•</span>
            <Link to="/admin" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
