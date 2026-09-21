/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '🚨 Security Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
    'Please configure your environment variables. Hardcoding secrets is prohibited.'
  );
}

/**
 * Shared Supabase Client singleton with persistent session handling
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'giriraj_supabase_auth_session'
  }
});

