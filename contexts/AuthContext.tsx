import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/db';

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
  register: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: true,
  isLoading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  continueAsGuest: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes (handles session restore)
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
        setIsLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;

      const profile = await db.getProfile(data.user.id);
      if (profile) {
        setUser(profile);
        setIsGuest(false);
      }
      return null;
    } catch (e: any) {
      return e.message || 'Login failed';
    }
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      if (username.length < 3) return 'Username must be at least 3 characters';
      if (password.length < 6) return 'Password must be at least 6 characters';

      const email = `${username.toLowerCase()}@mathgame.local`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        if (error.message.includes('already registered')) {
          return 'Username already taken';
        }
        return error.message;
      }

      if (data.user) {
        await db.createProfile(data.user.id, username);
        const profile = await db.getProfile(data.user.id);
        if (profile) {
          setUser(profile);
          setIsGuest(false);
        }
      }
      return null;
    } catch (e: any) {
      if (e.message?.includes('duplicate') || e.message?.includes('unique')) {
        return 'Username already taken';
      }
      return e.message || 'Registration failed';
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsGuest(true);
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (user) {
      const profile = await db.getProfile(user.id);
      if (profile) {
        setUser(profile);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isGuest, isLoading, login, register, logout, continueAsGuest, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
