import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus, Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/db';
import { useGameState } from '@/hooks/useGameState';

interface AuthUser {
  id: string;
  username: string;
  coins: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string) => Promise<{ error: string | null; recoveryPhrase?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  refreshUser: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<string | null>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  verifyRecoveryPhrase: (username: string, recoveryPhrase: string) => Promise<string | null>;
  resetPassword: (username: string, recoveryPhrase: string, newPassword: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: true,
  isLoading: true,
  login: async () => null,
  register: async () => ({ error: null }),
  logout: async () => {},
  continueAsGuest: () => {},
  refreshUser: async () => {},
  updateUsername: async () => null,
  updatePassword: async () => null,
  verifyRecoveryPhrase: async () => null,
  resetPassword: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const currentSessionKey = useRef<string | null>(null);

  const logout = useCallback(async () => {
    try {
      // Clear session key in DB on logout
      if (user) {
        await db.updateSessionKey(user.id, null);
      }
      // Use scope: 'local' to clear the session immediately without
      // needing a valid (non-expired) token for server-side revocation.
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.warn('Signout network/token error ignored:', e);
    } finally {
      // ALWAYS clear the local React state, even if the token was already dead
      setUser(null);
      currentSessionKey.current = null;
      setIsGuest(true);
      // Clear equipped accessories so stickman resets to default after logout
      useGameState.getState().resetForGuest();
    }
  }, [user]);

  // --- Session resilience: refresh on app foreground ---
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Foreground session check failed:', error.message);
            // Only log out if it's explicitly a dead session, ignore mere network offline errors
            if (error.message?.includes('Refresh Token') || error.message?.includes('expired') || error.name === 'AuthSessionMissingError') {
              Alert.alert(
                'Session Expired',
                'Your login session has expired. Please restart the game to continue.',
                [{ text: 'OK' }]
              );
              await logout();
            }
            return;
          }

          if (data.session) {
            // Reload the user profile to ensure fresh data
            const profile = await db.getProfile(data.session.user.id);
            if (profile) {
              // Check session key for single device login
              if (currentSessionKey.current && profile.session_key && profile.session_key !== currentSessionKey.current) {
                Alert.alert(
                  'Logged Out',
                  'Your account was logged in on another device.',
                  [{ text: 'OK' }]
                );
                await logout();
                return;
              }
              setUser(profile);
              setIsGuest(false);
            }
          }
        } catch (e) {
          console.warn('Session refresh on foreground failed:', e);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [logout]);

  useEffect(() => {
    // Track whether first auth event has been processed (for isLoading gate)
    let initialLoadDone = false;

    // Single source of truth: onAuthStateChange handles both initial session
    // recovery (INITIAL_SESSION event) and all future auth state changes.
    // This eliminates the race condition that occurred when loadInitialSession()
    // and onAuthStateChange competed to set user state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await db.getProfile(session.user.id);
          if (profile) {
            // On initial load, adopt the existing session key from DB
            if (!currentSessionKey.current && profile.session_key) {
              currentSessionKey.current = profile.session_key;
            }
            setUser(profile);
            setIsGuest(false);
          }
        } else {
          setUser(null);
          setIsGuest(true);
        }

        // Clear loading gate after the first auth event is fully processed
        if (!initialLoadDone) {
          initialLoadDone = true;
          setIsLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const email = `${username.toLowerCase().trim()}@mathgame.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;

      // Generate new session key for this login
      const sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await db.updateSessionKey(data.user.id, sessionKey);
      currentSessionKey.current = sessionKey;

      const profile = await db.getProfile(data.user.id);
      
      if (profile) {
        setUser(profile);
        setIsGuest(false);
        return null; // Success!
      } else {
        // Profile fetch failed (timeout/RLS) but auth succeeded.
        // Proceed with minimal profile instead of locking the user out.
        console.warn("[Auth] Profile fetch failed post-login, using minimal profile.");
        setUser({ id: data.user.id, username: username.trim(), coins: 0 });
        setIsGuest(false);
        return null;
      }
    } catch (e: any) {
      return e.message || 'Login failed';
    }
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<{ error: string | null; recoveryPhrase?: string }> => {
    try {
      console.log("[Auth] Attempting registration for:", username);
      if (username.length < 3) return { error: 'Username must be at least 3 characters' };
      if (username.length > 20) return { error: 'Username must be 20 characters or less' };
      if (password.length < 6) return { error: 'Password must be at least 6 characters' };

      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        return { error: 'Username can only contain letters, numbers, underscores, and hyphens (no spaces)' };
      }

      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error("Supabase registry error:", error.message);
        if (error.message.includes('already registered')) {
          return { error: 'Username already taken' };
        }
        if (error.message.toLowerCase().includes('email')) {
          return { error: 'Invalid username format. Use only letters, numbers, underscores, or hyphens.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        const randomBytes = await Crypto.getRandomBytesAsync(12);
        const recoveryPhrase = Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .match(/.{4}/g)?.join('-') || 'math-game-key';
        
        const recoveryPhraseHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256, 
          recoveryPhrase.toLowerCase()
        );

        await db.createProfile(data.user.id, username, recoveryPhraseHash);
        
        // Generate and set session key for new registration
        const sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await db.updateSessionKey(data.user.id, sessionKey);
        currentSessionKey.current = sessionKey;

        const profile = await db.getProfile(data.user.id);
        if (profile) {
          setUser(profile);
          setIsGuest(false);
        } else {
          setUser({ id: data.user.id, username: username.trim(), coins: 0 });
          setIsGuest(false);
        }
        return { error: null, recoveryPhrase };
      }
      return { error: null };
    } catch (e: any) {
      console.error("Register try/catch caught exception:", e);
      if (e.message?.includes('duplicate') || e.message?.includes('unique')) {
        return { error: 'Username already taken' };
      }
      return { error: e.message || 'Registration failed' };
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    setIsLoading(false);
    useGameState.getState().resetForGuest();
  }, []);

  const refreshUser = useCallback(async () => {
    if (user) {
      const profile = await db.getProfile(user.id);
      if (profile) {
        setUser(profile);
      }
    }
  }, [user]);

  const updateUsername = useCallback(async (newUsername: string): Promise<string | null> => {
    if (!user) return 'Not authenticated';
    try {
      await db.updateUsername(user.id, newUsername);

      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const newEmail = `${newUsername.toLowerCase()}@mathgame.local`;
        await adminClient.auth.admin.updateUserById(user.id, {
          email: newEmail,
          user_metadata: { username: newUsername }
        });
      }

      await refreshUser();
      return null;
    } catch (e: any) {
      return e.message || 'Failed to update username';
    }
  }, [user, refreshUser]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<string | null> => {
    if (!user) return 'Not authenticated';
    try {
      const email = `${user.username.toLowerCase()}@mathgame.local`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) return 'Current password is incorrect';

      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { error: authError } = await adminClient.auth.admin.updateUserById(user.id, {
          password: newPassword
        });

        if (authError) return authError.message;
      } else {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return error.message;
      }
      
      return null;
    } catch (e: any) {
      return e.message || 'Failed to update password';
    }
  }, [user]);

  const verifyRecoveryPhrase = useCallback(async (username: string, recoveryPhrase: string): Promise<string | null> => {
    try {
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) return 'Admin key not configured.';

      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data: userList } = await adminClient.auth.admin.listUsers();
      const targetUser = userList.users.find((u: any) => u.email?.toLowerCase() === email);
      if (!targetUser) return 'Username not found.';

      const { data: profileData } = await adminClient
        .from('profiles')
        .select('recovery_phrase_hash')
        .eq('id', targetUser.id)
        .single();

      if (!profileData?.recovery_phrase_hash) return 'No recovery phrase set up.';
      
      const inputHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        recoveryPhrase.trim().toLowerCase()
      );

      if (profileData.recovery_phrase_hash !== inputHash) return 'Incorrect recovery phrase.';
      return null;
    } catch (e: any) {
      return e.message || 'An error occurred.';
    }
  }, []);

  const resetPassword = useCallback(async (username: string, recoveryPhrase: string, newPassword: string): Promise<string | null> => {
    try {
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) return 'Admin key not configured.';

      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data: userList } = await adminClient.auth.admin.listUsers();
      const targetUser = userList.users.find((u: any) => u.email?.toLowerCase() === email);
      if (!targetUser) return 'Username not found.';

      const { data: profileData } = await adminClient
        .from('profiles')
        .select('recovery_phrase_hash')
        .eq('id', targetUser.id)
        .single();

      if (!profileData?.recovery_phrase_hash) return 'No recovery phrase set up.';

      const inputHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        recoveryPhrase.trim().toLowerCase()
      );

      if (profileData.recovery_phrase_hash !== inputHash) return 'Incorrect recovery phrase.';

      const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUser.id, { password: newPassword });
      if (updateError) return 'Failed to update password.';

      return null;
    } catch (e: any) {
      return e.message || 'An error occurred.';
    }
  }, []);

  useEffect(() => {
    const heartbeat = setInterval(async () => {
      if (!isGuest && user) {
        try {
          const { error } = await supabase.auth.getSession();
          if (error && (error.message?.includes('Refresh Token') || error.message?.includes('expired') || error.name === 'AuthSessionMissingError')) {
            Alert.alert(
              'Session Expired',
              'Your login session has expired. Please restart the game to continue.',
              [{ text: 'OK' }]
            );
            await logout();
          } else if (!error) {
            // Heartbeat session key check
            const { data: profile } = await supabase.from('profiles').select('session_key').eq('id', user.id).maybeSingle();
            if (profile && currentSessionKey.current && profile.session_key && profile.session_key !== currentSessionKey.current) {
              Alert.alert(
                'Logged Out',
                'Your account was logged in on another device.',
                [{ text: 'OK' }]
              );
              await logout();
            }
          }
        } catch (e) {
          console.warn('Heartbeat session check failed:', e);
        }
      }
    }, 5 * 60 * 1000); 

    return () => clearInterval(heartbeat);
  }, [isGuest, user, logout]);

  return (
    <AuthContext.Provider
      value={{ 
        user, isGuest, isLoading, 
        login, register, logout, continueAsGuest, refreshUser, 
        updateUsername, updatePassword,
        verifyRecoveryPhrase, resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
