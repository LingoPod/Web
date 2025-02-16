import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth types
export type Profile = {
  id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

// Database types
export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Content = {
  id: string;
  topic_id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  content: string;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}; 