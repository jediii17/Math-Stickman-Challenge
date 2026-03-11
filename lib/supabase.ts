import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const REQUEST_TIMEOUT_MS = 8000;

function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
          const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : String(url);
          console.warn(`[supabase.ts] Aborting stale request via AbortController for ${urlStr.split('?')[0]}`);
          controller.abort();
        }, REQUEST_TIMEOUT_MS);

        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timer));
      },
    },
  });
}

// Singleton client - replaced on AFK recovery or retries
let supabaseInstance: SupabaseClient = createSupabaseClient();

export function resetSupabaseClient() {
  console.log('[supabase.ts] Recreating Supabase client to clear stale TCP connections...');
  supabaseInstance = createSupabaseClient();
}

// AppState Listener: detect AFK / background return
let lastActiveTime = Date.now();
const AFK_THRESHOLD_MS = 60 * 1000; // 1 minute

AppState.addEventListener('change', (nextState: AppStateStatus) => {
  if (nextState === 'active') {
    const elapsed = Date.now() - lastActiveTime;
    console.log(`[supabase.ts] App resumed after ${Math.round(elapsed / 1000)}s`);

    if (elapsed > AFK_THRESHOLD_MS) {
      // Connection is likely dead — nuke it and start fresh
      resetSupabaseClient();
    }
    supabaseInstance.auth.startAutoRefresh();
  } else {
    lastActiveTime = Date.now();
    supabaseInstance.auth.stopAutoRefresh();
  }
});

// Proxy allows all existing code using `import { supabase } from './supabase'`
// to seamlessly use the dynamically recreated client instance without any changes.
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return (supabaseInstance as any)[prop];
  }
});
