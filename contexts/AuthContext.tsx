import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
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
            console.warn('Foreground session check failed. Clearing local session...');
            await supabase.auth.signOut({ scope: 'local' });
            setUser(null);
            setIsGuest(true);
            return;
          }

          if (data.session) {
            // Reload the user profile to ensure fresh data
            const profile = await db.getProfile(data.session.user.id);
            if (profile) {
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
  }, []);

  useEffect(() => {
    // 1. Explicitly check for an existing session on app load to guarantee we don't miss it
    const loadInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const profile = await db.getProfile(data.session.user.id);
          if (profile) {
            setUser(profile);
            setIsGuest(false);
          }
        }
      } catch (e) {
        console.warn('Initial session load failed:', e);
      } finally {
        setIsLoading(false); // Stop the loading screen once we know the state
      }
    };

    loadInitialSession();

    // 2. Listen for future auth state changes (like manual logins/logouts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await db.getProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setIsGuest(false);
          }
        } else {
          setUser(null);
          setIsGuest(true);
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

      // Only allow letters, numbers, underscores, and hyphens — NO spaces or special chars.
      // This prevents Supabase email validation errors since we build username@mathgame.local.
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
        // Catch any email validation errors and show a friendly message
        if (error.message.toLowerCase().includes('email')) {
          return { error: 'Invalid username format. Use only letters, numbers, underscores, or hyphens.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        // Generate recovery phrase (12 random bytes as hex string separated by dashes)
        const randomBytes = await Crypto.getRandomBytesAsync(12);
        const recoveryPhrase = Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .match(/.{4}/g)?.join('-') || 'math-game-key';
        
        // Hash it for secure storage
        const recoveryPhraseHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256, 
          recoveryPhrase.toLowerCase()
        );

        console.log("Generating recovery phrase and hitting db.createProfile()...");
        await db.createProfile(data.user.id, username, recoveryPhraseHash);
        
        console.log("Profile created! Hitting db.getProfile()...");
        const profile = await db.getProfile(data.user.id);
        if (profile) {
          console.log("Profile retrieved successfully post-register.");
          setUser(profile);
          setIsGuest(false);
        } else {
          // Profile fetch failed but registration succeeded — proceed with minimal profile
          console.warn("Profile fetch post-register returned null, using minimal profile.");
          setUser({ id: data.user.id, username: username.trim(), coins: 0 });
          setIsGuest(false);
        }
        return { error: null, recoveryPhrase };
      }
      console.warn("Register succeeded but data.user was null.");
      return { error: null };
    } catch (e: any) {
      console.error("Register try/catch caught exception:", e);
      if (e.message?.includes('duplicate') || e.message?.includes('unique')) {
        return { error: 'Username already taken' };
      }
      return { error: e.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Use scope: 'local' to clear the session immediately without
      // needing a valid (non-expired) token for server-side revocation.
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.warn('Signout network/token error ignored:', e);
    } finally {
      // ALWAYS clear the local React state, even if the token was already dead
      setUser(null);
      setIsGuest(true);
      // Clear equipped accessories so stickman resets to default after logout
      useGameState.getState().resetForGuest();
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    setIsLoading(false);
    // Ensure guest starts with no accessories equipped
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
      // 1. Update the profile in the DB (includes cooldown check)
      await db.updateUsername(user.id, newUsername);

      // 2. Sync with Supabase Auth credentials
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const newEmail = `${newUsername.toLowerCase()}@mathgame.local`;
        const { error: authError } = await adminClient.auth.admin.updateUserById(user.id, {
          email: newEmail,
          user_metadata: { username: newUsername }
        });

        if (authError) {
          console.warn('Failed to sync username to Auth:', authError.message);
          // We don't necessarily want to fail the whole operation if DB part succeeded, 
          // but logging it is important.
        }
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
      // 1. Verify current password by attempting to sign in
      const email = `${user.username.toLowerCase()}@mathgame.local`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) return 'Current password is incorrect';

      // 2. Update to new password
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
      if (!serviceRoleKey) {
        return 'Admin key not configured in environment.';
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      console.log("Attempting login for:", username);
      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data: userList, error: listError } = await adminClient.auth.admin.listUsers();

      if (listError) {
        return 'Failed to look up user account.';
      }

      const targetUser = userList.users.find((u: any) => u.email?.toLowerCase() === email);
      if (!targetUser) {
        return 'Username not found.';
      }

      // Bypass RLS: use the adminClient to fetch the profile data directly
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('recovery_phrase_hash')
        .eq('id', targetUser.id)
        .single();

      if (profileError || !profileData?.recovery_phrase_hash) {
        return 'This account does not have a recovery phrase set up.';
      }
      
      const storedHash = profileData.recovery_phrase_hash;

      const inputHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        recoveryPhrase.trim().toLowerCase()
      );

      if (storedHash !== inputHash) {
        return 'Incorrect recovery phrase. Please check your spelling and try again.';
      }

      return null;
    } catch (e: any) {
      console.error("Verification error:", e);
      return e.message || 'An unexpected error occurred.';
    }
  }, []);

  const resetPassword = useCallback(async (username: string, recoveryPhrase: string, newPassword: string): Promise<string | null> => {
    try {
      // Create an admin client directly on the client side since we are bypassing the server for this feature
      // Note: In a real production app, exposing the service_role key to the client is extremely dangerous.
      // We are only doing this because the backend server is not easily reachable via Expo Go with --tunnel.
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!serviceRoleKey) {
        return 'Admin key not configured in environment (EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY).';
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      console.log("Attempting login for:", username);
      const email = `${username.toLowerCase()}@mathgame.local`;

      // 1. Find the user by email
      const { data: userList, error: listError } = await adminClient.auth.admin.listUsers();

      if (listError) {
        console.error("Error listing users:", listError);
        return 'Failed to look up user account.';
      }

      const targetUser = userList.users.find((u: any) => u.email?.toLowerCase() === email);
      
      if (!targetUser) {
        return 'Username not found.';
      }

      // 2. Verify Recovery Phrase
      // Bypass RLS: use the adminClient to fetch the profile data directly
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('recovery_phrase_hash')
        .eq('id', targetUser.id)
        .single();

      if (profileError || !profileData?.recovery_phrase_hash) {
        return 'This account does not have a recovery phrase set up. Please contact an administrator.';
      }
      
      const storedHash = profileData.recovery_phrase_hash;

      const inputHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        recoveryPhrase.trim().toLowerCase()
      );

      if (storedHash !== inputHash) {
        return 'Incorrect recovery phrase. Please check your spelling and try again.';
      }

      // 3. Update their password
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error("Error updating password:", updateError);
        return 'Failed to update password across the server.';
      }

      return null;
    } catch (e: any) {
      console.error("Reset error:", e);
      return e.message || 'An unexpected error occurred. Please try again.';
    }
  }, []);

  useEffect(() => {
    // React Native often drops long-running background timers (like Supabase's 1-hour refresh).
    // Polling getSession() every 5 minutes forces the SDK to evaluate the token's health
    // and naturally trigger its own auto-refresh if it's close to expiring.
    const heartbeat = setInterval(async () => {
      if (!isGuest && user) {
        try {
          await supabase.auth.getSession();
        } catch (e) {
          console.warn('Heartbeat session check failed:', e);
        }
      }
    }, 5 * 60 * 1000); // Run every 5 minutes

    return () => clearInterval(heartbeat);
  }, [isGuest, user]);

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
