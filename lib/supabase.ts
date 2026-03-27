import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Wait for session to be restored before setting up auto-refresh.
// On cold start, the session token is loaded from AsyncStorage asynchronously.
// Starting auto-refresh too early (before restoration) can cause it to
// fail silently, leaving the user without a valid session on first launch.
let autoRefreshReady = false;

supabase.auth.onAuthStateChange((event) => {
  if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
    autoRefreshReady = true;
    supabase.auth.startAutoRefresh();
  }
  if (event === 'SIGNED_OUT') {
    autoRefreshReady = false;
    supabase.auth.stopAutoRefresh();
  }
});

AppState.addEventListener('change', (state) => {
  if (state === 'active' && autoRefreshReady) {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
