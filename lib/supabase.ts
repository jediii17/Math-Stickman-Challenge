import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import 'expo-sqlite/localStorage/install';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Immediately validate the persisted session on module load.
// If the stored refresh token is invalid (e.g. after reinstall or backend change),
// clear the corrupted session to prevent the AuthApiError crash loop.
(async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { error } = await supabase.auth.refreshSession();
      if (error && error.message.includes('Refresh Token')) {
        console.warn('Supabase: clearing invalid persisted session:', error.message);
        await supabase.auth.signOut();
      }
    }
  } catch (e: any) {
    if (e.message?.includes('Refresh Token')) {
      console.warn('Supabase: invalid refresh token, clearing session');
      try { await supabase.auth.signOut(); } catch {}
    }
  }
})();
