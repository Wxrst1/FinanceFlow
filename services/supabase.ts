
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars since import.meta.env might be undefined in some environments or blocked
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn("Failed to access env vars");
  }
  return null;
};

// Try to get keys from Vite env, fallback to hardcoded demo keys if absolutely necessary for preview
const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback values (DEMO ONLY - Replace with your real keys in Vercel Environment Variables)
const DEFAULT_URL = 'https://yvccfwzhsgjkhmkqaclf.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2Y2Nmd3poc2dqa2hta3FhY2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDgwNTgsImV4cCI6MjA3ODgyNDA1OH0.uGZsXs0sBYMLl4FxZBzR6GjjKYOU9dUGX7RpPGrYg10';

const supabaseUrl = envUrl || DEFAULT_URL;
const supabaseAnonKey = envKey || DEFAULT_KEY;

// Singleton instance
let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Supabase client init failed:", error);
    }
} else {
    console.warn("Supabase keys missing. Auth and DB features will be disabled.");
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = !!supabaseClient;
