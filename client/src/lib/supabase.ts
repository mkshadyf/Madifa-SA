import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are present
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

// Create a mock client if credentials are missing to prevent application crashes
const createSupabaseClient = () => {
  if (!hasSupabaseCredentials) {
    console.warn('Missing Supabase environment variables. Authentication features will be disabled.');
    
    // Create a mock implementation to prevent crashes
    // This allows the app to still function without Supabase
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        // Add missing methods to prevent TypeScript errors
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase credentials not configured') }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase credentials not configured') }),
        updateUser: async () => ({ data: { user: null }, error: new Error('Supabase credentials not configured') })
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    };
  }
  
  // Create actual client if credentials exist
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Return mock client as fallback
    return createSupabaseClient();
  }
};

export const supabase = createSupabaseClient();

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
    if (!supabaseUrl) {
      console.warn('Missing Supabase URL for image path:', path);
      return '/placeholder-image.jpg'; // Fallback to a placeholder
    }
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
  if (!hasSupabaseCredentials) {
    throw new Error('Supabase credentials not configured. Cannot sign in with Google.');
  }
  
  // Get the current URL for the redirect
  const redirectUrl = import.meta.env.VITE_WEBSITE_URL || window.location.origin;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : redirectUrl,
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