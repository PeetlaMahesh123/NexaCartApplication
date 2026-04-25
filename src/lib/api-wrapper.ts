import { supabase } from './supabase';

// Comprehensive API wrapper to prevent 400/401 errors
export class ApiWrapper {
  private static instance: ApiWrapper;
  
  static getInstance(): ApiWrapper {
    if (!ApiWrapper.instance) {
      ApiWrapper.instance = new ApiWrapper();
    }
    return ApiWrapper.instance;
  }

  // Safe Supabase operations with comprehensive error handling
  async safeSelect(table: string, columns: string = '*', filters: any = {}) {
    try {
      let query = supabase.from(table).select(columns);
      
      // Apply filters safely
      if (filters.eq) {
        Object.entries(filters.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (filters.order) {
        query = query.order(filters.order.column, { ascending: filters.order.ascending || false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`API Error in ${table} select:`, error);
        return { data: null, error: this.handleError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Unexpected error in ${table} select:`, error);
      return { data: null, error: this.handleError(error) };
    }
  }

  async safeInsert(table: string, data: any) {
    try {
      // Validate data before insertion
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format for insertion');
      }

      const { data: result, error } = await supabase.from(table).insert(data).select();
      
      if (error) {
        console.error(`API Error in ${table} insert:`, error);
        return { data: null, error: this.handleError(error) };
      }
      
      return { data: result, error: null };
    } catch (error) {
      console.error(`Unexpected error in ${table} insert:`, error);
      return { data: null, error: this.handleError(error) };
    }
  }

  async safeUpdate(table: string, data: any, filters: any) {
    try {
      let query = supabase.from(table).update(data);
      
      // Apply filters safely
      if (filters.eq) {
        Object.entries(filters.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data: result, error } = await query.select();
      
      if (error) {
        console.error(`API Error in ${table} update:`, error);
        return { data: null, error: this.handleError(error) };
      }
      
      return { data: result, error: null };
    } catch (error) {
      console.error(`Unexpected error in ${table} update:`, error);
      return { data: null, error: this.handleError(error) };
    }
  }

  async safeDelete(table: string, filters: any) {
    try {
      let query = supabase.from(table).delete();
      
      // Apply filters safely
      if (filters.eq) {
        Object.entries(filters.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query.select();
      
      if (error) {
        console.error(`API Error in ${table} delete:`, error);
        return { data: null, error: this.handleError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Unexpected error in ${table} delete:`, error);
      return { data: null, error: this.handleError(error) };
    }
  }

  // Comprehensive error handler
  private handleError(error: any): string {
    if (!error) return 'Unknown error occurred';
    
    // Handle Supabase specific errors
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': // Not found
          return 'Data not found';
        case 'PGRST301': // Permission denied
          return 'Permission denied. Please check your access rights.';
        case '23505': // Unique constraint violation
          return 'Data already exists';
        case '23503': // Foreign key constraint violation
          return 'Referenced data not found';
        case '42501': // Insufficient privilege
          return 'Insufficient privileges';
        default:
          return `Database error: ${error.message || 'Unknown database error'}`;
      }
    }
    
    // Handle HTTP errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'Access denied. You do not have permission to perform this action.';
        case 404:
          return 'Requested data not found.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Request failed: ${error.message || 'Unknown error'}`;
      }
    }
    
    // Handle network errors
    if (error.message) {
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  // Safe authentication operations
  async safeSignIn(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        return { data: null, error: this.handleError(error) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected auth error:', error);
      return { data: null, error: this.handleError(error) };
    }
  }

  async safeSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error: this.handleError(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error: this.handleError(error) };
    }
  }

  async safeGetSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        return { session: null, error: this.handleError(error) };
      }

      return { session, error: null };
    } catch (error) {
      console.error('Unexpected session error:', error);
      return { session: null, error: this.handleError(error) };
    }
  }
}

export const apiWrapper = ApiWrapper.getInstance();
