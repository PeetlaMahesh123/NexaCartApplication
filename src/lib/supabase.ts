import { createClient } from '@supabase/supabase-js';

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Debug environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Is Development:', isDevelopment);

if (!isConfigured) {
  console.error(
    'Supabase environment variables are missing. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets.'
  );
}

export const isSupabaseConfigured = isConfigured;

// Fallback to empty strings only if missing, but createClient will throw if url is empty.
// We handle this more gracefully by checking if they exist before calling.
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          email_verified: boolean
          role: 'user' | 'admin' | 'editor' | 'viewer'
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          email_verified?: boolean
          role?: 'user' | 'admin' | 'editor' | 'viewer'
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          email_verified?: boolean
          role?: 'user' | 'admin' | 'editor' | 'viewer'
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          image_url: string | null
          category_id: string | null
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_price: number
          shipping_address: string | null
          payment_id: string | null
          payment_status: 'pending' | 'paid' | 'failed' | null
          created_at: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          payment_id: string
          amount: number
          currency: string
          status: 'pending' | 'success' | 'failed' | 'refunded'
          payment_method: string
          razorpay_signature: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
