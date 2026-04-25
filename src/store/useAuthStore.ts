import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { apiWrapper } from '../lib/api-wrapper';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  lastUpdated: number;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  lastUpdated: Date.now(),
  setUser: (user) => set({ user, lastUpdated: Date.now() }),
  setSession: (session) => set({ session, lastUpdated: Date.now() }),
  setProfile: (profile) => set({ profile, lastUpdated: Date.now() }),
  setLoading: (loading) => set({ loading }),
  isAdmin: () => get().profile?.role === 'admin',
  initialize: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    set({ loading: true });
    try {
      console.log('Starting safe sign in...');
      const { data, error } = await apiWrapper.safeSignIn(email, password);

      if (error) {
        console.error('Safe sign in error:', error);
        throw new Error(error);
      }
      
      if (data.session) {
        // Update state immediately
        set({ user: data.session.user, session: data.session, lastUpdated: Date.now() });
        
        // Fetch profile and wait for it to complete
        await get().fetchProfile(data.session.user.id);
        
        console.log('Auth state updated successfully:', {
          user: data.session.user,
          session: data.session,
          profile: get().profile
        });
        
        // Force a state update to ensure reactivity
        set(state => ({ ...state, lastUpdated: Date.now() }));
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Clear cart on logout - will be handled by App.tsx
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
