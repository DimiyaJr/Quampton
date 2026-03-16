import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getAuthenticatedSupabaseClient() {
  if (typeof window === 'undefined') {
    return supabase;
  }

  const token = localStorage.getItem('token');

  if (token) {
    try {
      const userData = JSON.parse(atob(token));

      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (error) {
      console.error('Error creating authenticated client:', error);
    }
  }

  return supabase;
}
