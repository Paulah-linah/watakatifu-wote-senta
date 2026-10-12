import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, ChevronDown, ChevronRight, Clock, MapPin, Menu, MessageSquare, Phone, ShieldCheck, X } from 'lucide-react';
import { useSiteSettings } from '@/services/content';
import { telHref, whatsappHref } from '@/lib/format';

interface NavItem {
  to: string;
  label: string;
  description?: string;
}

const ABOUT: NavItem[] = [
  { to: '/about/story', label: 'Our Story (since 1986)' },
  { to: '/about/mission-vision', label: 'Mission & Vision' },
  { to: '/about/philosophy', label: 'Philosophy' },
  { to: '/about/values', label: 'Core Values' },
];

const HOSPITALITY: NavItem[] = [
  { to: '/hospitality/conference', label: 'Conference Facilities', description: 'St. Bakhita, St. Julian & St. Bernard' },
  { to: '/hospitality/accommodation', label: 'Accommodation', description: 'Residential wings & guest apartments' },
  { to: '/hospitality/catering', label: 'Catering Services', description: 'Conferences, retreats & celebrations' },
  { to: '/hospitality/laundry', label: 'Laundry Services', description: 'Guest linen & liturgical vestments' },
  { to: '/hospitality/water', label: 'Water Services', description: 'Purified water in every hall' },
];

const MINISTRY: NavItem[] = [
  { to: '/ministry/mass', label: 'Mass Schedule' },
  { to: '/ministry/retreats', label: 'Spiritual Retreats' },
  { to: '/ministry/formation', label: 'Formation & Seminars' },
  { to: '/ministry/prayer', label: 'Chapel & Prayer Grounds' },
];

const SIMPLE: NavItem[] = [
  { to: '/products', label: 'Products' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

const linkBase = 'px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap';
const linkIdle = 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50';
const linkActive = 'text-sky-900 bg-sky-100/70';

const Dropdown: React.FC<{ label: string; base: string; items: NavItem[]; width?: string }> = ({ label, base, items, width = 'w-64' }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = pathname.startsWith(base);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={`${linkBase} inline-flex items-center gap-1 ${active ? linkActive : linkIdle}`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={menuId} className={`absolute top-full left-0 pt-1 z-50 ${width}`}>
          <ul className="py-2 bg-white rounded-xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-top-2 duration-150">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm hover:bg-stone-50 hover:text-sky-900 ${isActive ? 'text-sky-900 bg-sky-50' : 'text-stone-700'}`
                  }
                >
                  <span className={item.description ? 'block font-semibold text-stone-900' : ''}>{item.label}</span>
                  {item.description && <span className="block text-xs text-stone-500">{item.description}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-3 group select-none min-w-0" aria-label="Watakatifu Wote Senta home">
    <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-linear-to-br from-[#0284C7] to-[#0369A1] p-0.5 shadow-md flex items-center justify-center ring-2 ring-sky-200/60 transition-transform group-hover:scale-105">
      <div className="w-full h-full rounded-[10px] bg-linear-to-b from-[#0284C7] to-[#0c4a6e] flex items-center justify-center border border-sky-300/30">
        <div className="relative flex flex-col items-center justify-center" aria-hidden>
          <div className="w-1 h-6 bg-amber-200 rounded-xs" />
          <div className="w-4 h-1 bg-amber-200 rounded-xs absolute top-2" />
        </div>
      </div>
    </div>
    <div className="flex flex-col min-w-0">
      <span className="font-serif text-lg sm:text-2xl lg:text-xl xl:text-2xl font-bold tracking-tight text-stone-900 leading-tight whitespace-nowrap">
        WATAKATIFU WOTE SENTA
      </span>
      <span className="text-[11px] sm:text-xs font-medium tracking-wide text-sky-800 uppercase whitespace-nowrap truncate">
        All Saints Conference Centre <span className="text-stone-400 font-normal">| Ngong</span>
      </span>
    </div>
  </Link>
);

export const Navbar: React.FC = () => {
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);

  const mobileLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        `w-full py-2 px-3 rounded-lg text-left text-sm flex items-center justify-between ${
          isActive ? 'bg-sky-100 text-sky-900 font-semibold' : 'text-stone-800 hover:bg-stone-200/60'
        }`
      }
    >
      <span>{item.label}</span>
      <ChevronRight className="w-4 h-4 text-stone-400" />
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#E3DAC9] shadow-xs">
      {/* Top bar */}
      <div className="bg-[#1C1917] text-stone-300 text-xs py-1.5 sm:py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" aria-hidden />
              {settings.diocese}
            </span>
            <span className="text-stone-500" aria-hidden>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {settings.location}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
            <Link to="/ministry/mass" className="inline-flex items-center gap-1.5 text-amber-200/90 font-medium hover:text-amber-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>
                <span className="hidden xs:inline">Daily Mass: </span>
                {settings.daily_mass_time}
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <a href={telHref(settings.phone)} className="inline-flex items-center gap-1 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{settings.phone_display}</span>
              </a>
              <a
                href={whatsappHref(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                aria-label="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] border border-stone-700"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Staff Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand & main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-18 sm:h-20">
          <Logo />

          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
              Home
            </NavLink>
            <Dropdown label="About" base="/about" items={ABOUT} width="w-60" />
            <Dropdown label="Hospitality" base="/hospitality" items={HOSPITALITY} width="w-72" />
            <Dropdown label="Ministry" base="/ministry" items={MINISTRY} />
            {SIMPLE.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/inquiry"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm shadow-sm whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Make an Inquiry</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-200/60"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="lg:hidden border-t border-stone-200 bg-[#F7F5EE] px-4 pt-3 pb-6 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-3"
        >
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-300/70">
            {[{ to: '/', label: 'Home' }, ...SIMPLE].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `py-2 px-3 rounded-lg text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-900' : 'bg-stone-200/60 text-stone-800'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {[
            { title: 'About Us', items: ABOUT },
            { title: 'Hospitality & Services', items: HOSPITALITY },
            { title: 'Catholic Ministry', items: MINISTRY },
          ].map((group) => (
            <div key={group.title} className="space-y-1 pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 px-3 py-1">{group.title}</div>
              {group.items.map(mobileLink)}
            </div>
          ))}

          <Link to="/inquiry" className="block w-full py-3 rounded-xl bg-sky-700 text-white font-semibold text-center text-sm shadow-md">
            Make a Booking or Inquiry
          </Link>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-600 px-1">
            <Link to="/admin" className="inline-flex items-center gap-1 text-sky-800 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Staff login</span>
            </Link>
            <a href={telHref(settings.phone)} className="inline-flex items-center gap-1 font-medium">
              <Phone className="w-3.5 h-3.5" />
              {settings.phone_display}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
