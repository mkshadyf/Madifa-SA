import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Authentication will not work properly.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

/**
 * Helper function to get a public URL for an image
 * This handles both Supabase Storage URLs and regular URLs
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If it's already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path to a public asset
  if (path.startsWith('/')) {
    return path;
  }
  
  // If it's a Supabase storage path
  if (path.startsWith('public/')) {
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  }
  
  // Default fallback
  return path;
}

// Helper functions for authentication

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `https://dzsnjrnzmhxpfnoyajiw.supabase.co/auth/v1/callback`,
    },
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.user;
}