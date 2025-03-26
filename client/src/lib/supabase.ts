import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dzsnjrnzmhxpfnoyajiw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6c25qcm56bWh4cGZub3lhaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTg0OTYsImV4cCI6MjA1ODQ5NDQ5Nn0.T7cWJVYfm1p21nDBPciwZ2O8Q4Mud4Z4uDv0blKNB6I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabasePublicUrl = (path: string) => {
  if (!path) return '';
  const { data } = supabase.storage.from('videos').getPublicUrl(path);
  return data?.publicUrl || '';
};

// Helper function to get image URL from Supabase storage
export const getImageUrl = (path: string, bucket = 'thumbnails') => {
  if (!path) return '';
  // Check if it's already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || '';
};
