import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Ensure WebSocket polyfill exists for Node environments < 22
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = ws;
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://otuxyxbxhusmxvbzcpzb.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log('⚡ Supabase Client initialized successfully for MedVault database');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase credentials missing; running in local database mode.');
}

export const supabase = supabaseInstance;
export const isSupabaseConfigured = (): boolean => supabaseInstance !== null;
