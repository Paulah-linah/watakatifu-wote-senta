import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Enums, Tables } from '@/lib/database.types';

export type StaffProfile = Tables<'staff_profiles'>;
export type StaffRole = Enums<'staff_role'>;
export type Area = 'settings' | 'staff' | 'hospitality' | 'bookings' | 'bookings_read' | 'ministry' | 'events' | 'products' | 'gallery';

// Mirrors public.can_manage() in the database. The database is the real gatekeeper; this only shapes the UI.
const AREA_ROLES: Record<Area, StaffRole[]> = {
  settings: ['primary_admin'],
  staff: ['primary_admin'],
  hospitality: ['primary_admin', 'hospitality_editor'],
  bookings: ['primary_admin', 'hospitality_editor'],
  bookings_read: ['primary_admin', 'hospitality_editor', 'ministry_editor'],
  ministry: ['primary_admin', 'ministry_editor'],
  events: ['primary_admin', 'hospitality_editor', 'ministry_editor'],
  products: ['primary_admin', 'products_editor'],
  gallery: ['primary_admin', 'hospitality_editor', 'ministry_editor', 'products_editor'],
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  primary_admin: 'Primary Administrator',
  hospitality_editor: 'Hospitality Editor',
  ministry_editor: 'Ministry Editor',
  products_editor: 'Products Editor',
};

interface AuthState {
  session: Session | null;
  profile: StaffProfile | null;
  loading: boolean;
  can: (area: Area) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('staff_profiles').select('*').eq('id', s.user.id).maybeSingle();
    setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session);
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Avoid awaiting Supabase calls inside the callback (can deadlock the auth client).
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setTimeout(() => loadProfile(s).finally(() => setLoading(false)), 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      loading,
      can: (area) => !!profile?.is_active && AREA_ROLES[area].includes(profile.role),
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshProfile: () => loadProfile(session),
    }),
    [session, profile, loading, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
