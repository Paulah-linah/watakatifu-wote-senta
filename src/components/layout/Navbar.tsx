import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Clock, MapPin, Menu, MessageSquare, Phone, X } from 'lucide-react';
import { useSiteSettings } from '@/services/content';
import { telHref, whatsappHref } from '@/lib/format';
import { Logo } from '@/components/common/Logo';

interface NavItem {
  to: string;
  label: string;
  description?: string;
}

const ABOUT: NavItem[] = [
  { to: '/about/story', label: 'Our Story', description: 'Opened on All Saints Day, 1986' },
  { to: '/about/mission-vision', label: 'Mission & Vision', description: 'Why we exist' },
  { to: '/about/philosophy', label: 'Philosophy', description: 'Life, creation and service' },
  { to: '/about/values', label: 'Core Values', description: 'What guides our work' },
];

const HOSPITALITY: NavItem[] = [
  { to: '/hospitality/conference', label: 'Conference Halls', description: 'Three halls for 8 to 100 people' },
  { to: '/hospitality/accommodation', label: 'Accommodation', description: 'Residential wings & guest apartments' },
  { to: '/hospitality/catering', label: 'Catering', description: 'Tea breaks, buffets & celebrations' },
  { to: '/hospitality/laundry', label: 'Laundry', description: 'Guest linen & vestments' },
  { to: '/hospitality/water', label: 'Water Services', description: 'Purified water in every hall' },
];

const MINISTRY: NavItem[] = [
  { to: '/ministry/mass', label: 'Mass Schedule', description: 'Daily Mass in the chapel' },
  { to: '/ministry/retreats', label: 'Retreats', description: 'Individual & group retreats' },
  { to: '/ministry/formation', label: 'Formation', description: 'Seminars & catechesis' },
  { to: '/ministry/prayer', label: 'Chapel & Counselling', description: 'Spiritual counselling & quiet prayer' },
];

const SIMPLE: NavItem[] = [
  { to: '/events', label: 'Events' },
  { to: '/products', label: 'Bookshop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

const navLink = (active: boolean) =>
  `relative px-3 py-2 text-[0.9rem] font-medium transition-colors whitespace-nowrap after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-transform after:origin-left ${
    active ? 'text-sky-900 after:bg-gold-400 after:scale-x-100' : 'text-stone-600 hover:text-sky-900 after:bg-gold-400 after:scale-x-0 hover:after:scale-x-100'
  }`;

const Dropdown: React.FC<{ label: string; base: string; items: NavItem[] }> = ({ label, base, items }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
        className={`${navLink(pathname.startsWith(base))} inline-flex items-center gap-1`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={menuId} className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-72">
          <ul className="p-2 bg-white rounded-2xl shadow-lift border border-sand/70 animate-in fade-in slide-in-from-top-1 duration-150">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `block rounded-xl px-3.5 py-2.5 transition-colors ${isActive ? 'bg-sky-50' : 'hover:bg-parchment'}`}
                >
                  <span className="block text-sm font-semibold text-sky-950">{item.label}</span>
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

const Brand: React.FC<{ light?: boolean }> = ({ light }) => (
  <Link to="/" className="flex items-center gap-3 min-w-0 group" aria-label="Watakatifu Wote Senta home">
    <Logo className="h-[3.75rem] sm:h-[5rem] xl:h-[4.25rem] 2xl:h-[5rem] w-auto shrink-0" />
    <span className="min-w-0 leading-none">
      <span className={`block font-serif text-[clamp(1.05rem,4.4vw,1.6rem)] xl:text-[1.3rem] 2xl:text-[1.6rem] font-semibold tracking-tight whitespace-nowrap ${light ? 'text-white' : 'text-sky-950'}`}>
        Watakatifu Wote Senta
      </span>
      <span className={`mt-1 block text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.18em] xl:tracking-[0.1em] 2xl:tracking-[0.18em] whitespace-nowrap ${light ? 'text-gold-300' : 'text-gold-600'}`}>
        All Saints Centre · Ngong
      </span>
    </span>
  </Link>
);

export const Navbar: React.FC = () => {
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Utility bar (scrolls away) */}
      <div className="bg-ink text-stone-300 text-xs">
        <div className="container-page flex items-center justify-between gap-3 h-9">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-stone-400">{settings.diocese}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              {settings.location}
            </span>
          </div>
          <Link to="/ministry/mass" className="inline-flex items-center gap-1.5 text-gold-200 hover:text-gold-100">
            <Clock className="w-3.5 h-3.5" />
            <span>
              <span className="hidden xs:inline">Daily Mass </span>
              {settings.daily_mass_time}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a href={telHref(settings.phone)} className="inline-flex items-center gap-1.5 hover:text-white">
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              {settings.phone_display}
            </a>
            <Link to="/admin" className="hidden sm:inline text-stone-400 hover:text-white">
              Staff login
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar (sticky) */}
      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 border-b ${
          scrolled || mobileOpen ? 'bg-white/95 backdrop-blur-md border-sand shadow-soft' : 'bg-white border-sand/60'
        }`}
      >
        <div className="container-page flex items-center justify-between gap-4 h-[4.75rem] sm:h-24">
          <Brand />

          <nav aria-label="Main" className="hidden xl:flex items-center">
            <NavLink to="/" end className={({ isActive }) => navLink(isActive)}>
              Home
            </NavLink>
            <Dropdown label="About" base="/about" items={ABOUT} />
            <Dropdown label="Hospitality" base="/hospitality" items={HOSPITALITY} />
            <Dropdown label="Ministry" base="/ministry" items={MINISTRY} />
            {SIMPLE.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navLink(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/inquiry" className="hidden sm:inline-flex btn btn-primary">
              Book & Inquire
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-sky-950 hover:bg-white border border-transparent hover:border-sand"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="xl:hidden border-t border-sand bg-parchment h-[calc(100dvh-4.75rem)] sm:h-[calc(100dvh-6rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="container-page py-6 space-y-7">
              <div className="grid grid-cols-2 gap-2">
                {[{ to: '/', label: 'Home' }, ...SIMPLE].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-semibold border ${isActive ? 'bg-sky-900 text-white border-sky-900' : 'bg-white text-sky-950 border-sand/70'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              {[
                { title: 'About us', items: ABOUT },
                { title: 'Hospitality', items: HOSPITALITY },
                { title: 'Catholic ministry', items: MINISTRY },
              ].map((group) => (
                <div key={group.title}>
                  <p className="eyebrow mb-2">{group.title}</p>
                  <ul className="divide-y divide-sand/60 border-y border-sand/60">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) => `flex items-center justify-between py-3 text-[0.95rem] ${isActive ? 'text-sky-700 font-semibold' : 'text-sky-950'}`}
                        >
                          {item.label}
                          <ArrowRight className="w-4 h-4 text-stone-400" />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="grid gap-3 pb-6">
                <Link to="/inquiry" className="btn btn-primary w-full">
                  Make a booking or inquiry
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <a href={telHref(settings.phone)} className="btn btn-outline">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                <Link to="/admin" className="text-center text-xs text-stone-500 pt-2">
                  Staff login
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};
