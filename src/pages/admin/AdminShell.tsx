import React, { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import {
  Bed,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  Church,
  ExternalLink,
  GraduationCap,
  Image,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shirt,
  ShoppingBag,
  Tags,
  Users,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, ROLE_LABELS, type Area } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';
import { Modal } from '@/components/common/Modal';
import { Emblem } from '@/components/common/Emblem';
import { Button, FieldLabel, inputCls, Spinner, ToastProvider, useToast, errorMessage } from './ui';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  area?: Area;
  end?: boolean;
}

const NAV: { heading?: string; items: NavEntry[] }[] = [
  {
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
      { to: '/admin/calendar', label: 'Hall calendar', icon: CalendarRange, area: 'bookings_read' },
    ],
  },
  {
    heading: 'Hospitality',
    items: [
      { to: '/admin/content/facilities', label: 'Conference halls', icon: Building2, area: 'hospitality' },
      { to: '/admin/content/accommodation', label: 'Accommodation', icon: Bed, area: 'hospitality' },
      { to: '/admin/content/catering', label: 'Catering', icon: Utensils, area: 'hospitality' },
      { to: '/admin/content/laundry', label: 'Laundry', icon: Shirt, area: 'hospitality' },
    ],
  },
  {
    heading: 'Ministry',
    items: [
      { to: '/admin/content/mass', label: 'Mass schedule', icon: Church, area: 'ministry' },
      { to: '/admin/content/retreats', label: 'Retreats', icon: BookOpen, area: 'ministry' },
      { to: '/admin/content/formation', label: 'Formation', icon: GraduationCap, area: 'ministry' },
      { to: '/admin/content/events', label: 'Events', icon: CalendarDays, area: 'events' },
    ],
  },
  {
    heading: 'Catalogue & media',
    items: [
      { to: '/admin/content/products', label: 'Products', icon: ShoppingBag, area: 'products' },
      { to: '/admin/content/categories', label: 'Product categories', icon: Tags, area: 'products' },
      { to: '/admin/content/gallery', label: 'Gallery', icon: Image, area: 'gallery' },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { to: '/admin/staff', label: 'Staff accounts', icon: Users, area: 'staff' },
      { to: '/admin/settings', label: 'Site settings', icon: Settings, area: 'settings' },
    ],
  },
];

/** Wraps every /admin route: toasts, no public chrome, noindex. */
export function AdminRoot() {
  usePageMeta({ title: 'Staff Portal', noindex: true });
  return (
    <ToastProvider>
      <div className="min-h-screen bg-parchment text-ink font-sans">
        <Outlet />
      </div>
      <ScrollRestoration />
    </ToastProvider>
  );
}

function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) return toast.error('Use at least 10 characters.');
    if (password !== confirm) return toast.error('The two passwords do not match.');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(errorMessage(error));
    toast.success('Password updated.');
    setPassword('');
    setConfirm('');
    onClose();
  };
  return (
    <Modal isOpen={open} onClose={onClose} title="Change your password" maxWidth="sm">
      <form onSubmit={submit} className="space-y-4">
        <FieldLabel label="New password" htmlFor="pw-new" hint="At least 10 characters.">
          <input id="pw-new" type="password" autoComplete="new-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Confirm new password" htmlFor="pw-confirm">
          <input id="pw-confirm" type="password" autoComplete="new-password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </FieldLabel>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Route guard + portal layout. */
export function AdminShell() {
  const { session, profile, loading, can, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (loading) return <Spinner label="Checking your session…" />;
  if (!session) return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!profile || !profile.is_active) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <KeyRound className="w-10 h-10 text-stone-400 mx-auto mb-3" />
        <h1 className="font-serif text-2xl font-bold">No staff access</h1>
        <p className="text-sm text-stone-600 mt-2">
          {profile ? 'Your staff account has been deactivated.' : 'This login is not linked to a staff profile.'} Please contact the primary administrator.
        </p>
        <Button className="mt-6" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  const sidebar = (
    <nav aria-label="Staff portal" className="space-y-5">
      {NAV.map((group, i) => {
        const items = group.items.filter((item) => !item.area || can(item.area));
        if (!items.length) return null;
        return (
          <div key={i}>
            {group.heading && <div className="px-3 mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400/80">{group.heading}</div>}
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/10 text-gold-200' : 'text-sky-100/75 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="lg:grid lg:grid-cols-[16rem_1fr] min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-sky-950 text-white flex flex-col transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="block">
            <div className="flex items-center gap-2.5">
              <Emblem className="w-8 h-10" />
              <div>
                <div className="font-serif text-lg font-semibold leading-tight">Staff Portal</div>
                <div className="text-[10px] text-gold-300 uppercase tracking-[0.16em]">Watakatifu Wote Senta</div>
              </div>
            </div>
          </Link>
          <button type="button" className="lg:hidden p-1" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{sidebar}</div>
        <div className="p-3 border-t border-white/10 space-y-1 text-sm">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-100/75 hover:bg-white/5">
            <ExternalLink className="w-4 h-4" /> View website
          </a>
          <button type="button" onClick={() => setPwOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sky-100/75 hover:bg-white/5">
            <KeyRound className="w-4 h-4" /> Change password
          </button>
          <button type="button" onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sky-100/75 hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden />}

      {/* Main */}
      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-parchment/95 backdrop-blur border-b border-sand/70 px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <button type="button" className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto text-right">
            <div className="text-sm font-semibold text-stone-900">{profile.full_name}</div>
            <div className="text-[11px] text-sky-700 font-medium">{ROLE_LABELS[profile.role]}</div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
