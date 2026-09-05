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

/**
 * Upload a document buffer directly to Supabase Storage Bucket
 */
export const uploadFileToStorage = async (
  buffer: Buffer,
  filename: string,
  mimeType: string,
  bucket = 'medical-records'
): Promise<string | null> => {
  if (!supabaseInstance) return null;
  try {
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${Date.now()}_${cleanName}`;
    const { data, error } = await supabaseInstance.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn('⚠️ Supabase storage upload notice:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabaseInstance.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log(`☁️ File uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Supabase storage upload exception:', err);
    return null;
  }
};
