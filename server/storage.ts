// storage.ts
import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout));
    },
  },
});

// --- Simple In-Memory Cache ---
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs = 30000) {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  invalidate(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

export const cache = new Cache();

// --- Storage Interface ---
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getShopItems(): Promise<ShopItem[]>;
  getArenaMatches(userId: string): Promise<ArenaMatch[]>;
  createArenaMatch(player1_id: string, player2_id: string): Promise<ArenaMatch>;
}

// --- Types (extend to match your Supabase schema) ---
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface ArenaMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  status: 'pending' | 'active' | 'completed';
  winner_id?: string;
  created_at: string;
}

// --- Supabase Storage Implementation ---
export class SupabaseStorage implements IStorage {

  // Retry wrapper
  private async withRetry<T = any>(
    fn: () => PromiseLike<{ data: any; error: any }>,
    retries = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      const { data, error } = await fn();
      if (!error && data !== null) return data as T;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      } else {
        throw error || new Error('No data returned');
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getUser(id: string): Promise<User | undefined> {
    const cacheKey = `user:${id}`;
    const cached = cache.get<User>(cacheKey);
    if (cached) return cached;

    const data = await this.withRetry(() =>
      supabase.from('users').select('*').eq('id', id).single()
    );
    cache.set(cacheKey, data, 60000); // Cache 1 min
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const cacheKey = `user:username:${username}`;
    const cached = cache.get<User>(cacheKey);
    if (cached) return cached;

    const data = await this.withRetry(() =>
      supabase.from('users').select('*').eq('username', username).single()
    );
    cache.set(cacheKey, data, 60000);
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const data = await this.withRetry(() =>
      supabase.from('users').insert(insertUser).select().single()
    );
    cache.invalidate('user:');
    return data;
  }

  async getShopItems(): Promise<ShopItem[]> {
    const cacheKey = 'shop:items';
    const cached = cache.get<ShopItem[]>(cacheKey);
    if (cached) return cached;

    const data = await this.withRetry(() =>
      supabase.from('shop_items').select('*').order('created_at', { ascending: false })
    );
    cache.set(cacheKey, data, 30000); // Cache 30s
    return data;
  }

  async getArenaMatches(userId: string): Promise<ArenaMatch[]> {
    const cacheKey = `arena:matches:${userId}`;
    const cached = cache.get<ArenaMatch[]>(cacheKey);
    if (cached) return cached;

    const data = await this.withRetry(() =>
      supabase
        .from('arena_matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('created_at', { ascending: false })
    );
    cache.set(cacheKey, data, 15000); // Cache 15s (arena is time-sensitive)
    return data;
  }

  async createArenaMatch(player1_id: string, player2_id: string): Promise<ArenaMatch> {
    const data = await this.withRetry<ArenaMatch>(() =>
      supabase
        .from('arena_matches')
        .insert({ player1_id, player2_id, status: 'pending' })
        .select()
        .single() as any
    );
    cache.invalidate(`arena:matches:${player1_id}`);
    cache.invalidate(`arena:matches:${player2_id}`);
    return data;
  }
}

export const storage = new SupabaseStorage();