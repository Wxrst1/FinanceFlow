
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Fallback keys for Demo/Build environments
const DEFAULT_URL = 'https://yvccfwzhsgjkhmkqaclf.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2Y2Nmd3poc2dqa2hta3FhY2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDgwNTgsImV4cCI6MjA3ODgyNDA1OH0.uGZsXs0sBYMLl4FxZBzR6GjjKYOU9dUGX7RpPGrYg10';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) { }
  return undefined;
};

const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabaseUrl = (envUrl as string) || DEFAULT_URL;
const supabaseAnonKey = (envKey as string) || DEFAULT_KEY;

if (!envUrl) {
  logger.warn('Supabase env vars missing. Using fallback credentials.');
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-application-name': 'financeflow-v1' },
    },
    db: {
      schema: 'public',
    }
  }
);

export const isSupabaseConfigured = true;
