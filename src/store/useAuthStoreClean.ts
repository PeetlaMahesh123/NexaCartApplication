import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  isAdmin: () => boolean;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  isAdmin: () => get().profile?.role === 'admin',
  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Clear cart on logout
    set({ user: null, session: null, profile: null });
  },
  fetchProfile: async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        set({ profile: data });
      }
      if (error) console.error('Error fetching profile:', error);
    } catch (err) {
      console.error('Fatal profile fetch error:', err);
    }
  },
}));
