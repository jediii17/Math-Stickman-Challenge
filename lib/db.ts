import { supabase } from './supabase';
import { Alert } from 'react-native';

// --- Retry helper for resilient DB calls ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureSession() {
  try {
    // Always force a token refresh when called, since this is only invoked
    // after a query failure. getSession() returns cached tokens without
    // validating them, so it can't detect JWT expiration.
    console.log('[db.ts] Forcing token refresh...');
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      const msg = error.message || '';
      console.warn('[db.ts] Token refresh failed:', msg);

      if (
        msg.includes('Refresh Token') ||
        msg.includes('Invalid Refresh Token') ||
        error.name === 'AuthSessionMissingError'
      ) {
        // Refresh token is dead — session is permanently expired
        Alert.alert(
          'Session Expired',
          'Your login session has expired. Please log in again.',
          [{ text: 'OK' }]
        );
        await supabase.auth.signOut({ scope: 'local' });
      }
      return;
    }

    if (data?.session) {
      console.log('[db.ts] Token refresh successful, new token expires at:', new Date(data.session.expires_at! * 1000).toISOString());
    } else {
      console.warn('[db.ts] No active session to refresh');
    }
  } catch (e) {
    console.warn('[db.ts] Session refresh failed:', e);
  }
}

/**
 * Wraps a Supabase call with retry logic + automatic session refresh.
 * Retries up to maxRetries times with exponential backoff (500ms, 1s, 2s).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 500,
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[db.ts] Executing query... Attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase request timed out after 10000ms')), 10000);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      console.log(`[db.ts] Query success on attempt ${attempt + 1}`);
      return result as T;
    } catch (error: any) {
      console.warn(`[db.ts] Query failed on attempt ${attempt + 1}:`, error.message || error);
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`[db.ts] Refreshing session and waiting ${baseDelay * Math.pow(2, attempt)}ms before next attempt...`);
        await ensureSession();
        await delay(baseDelay * Math.pow(2, attempt));
      }
    }
  }
  console.error(`[db.ts] Query failed permanently after ${maxRetries + 1} attempts`);
  throw lastError;
}

// --- Profile helpers ---

export async function createProfile(userId: string, username: string, recoveryPhraseHash: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, username, coins: 0, recovery_phrase_hash: recoveryPhraseHash, classic_level: 1 });
  if (error) throw error;
  return { id: userId, username, coins: 0, classic_level: 1 };
}

export async function getProfile(userId: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, coins, classic_level, last_username_change_at, session_key, roulette_tickets, claimed_ticket_levels')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      console.warn('[db.ts] getProfile: no profile row found for userId:', userId);
      return null;
    }
    return data as { 
      id: string; 
      username: string; 
      coins: number; 
      classic_level: number;
      last_username_change_at: string | null;
      session_key: string | null;
      roulette_tickets: number;
      claimed_ticket_levels: number[];
    };
  }).catch((e) => {
    console.error("[db.ts] getProfile failed after all retries:", e.message || e);
    return null;
  });
}

export async function getUserById(userId: string) {
  return getProfile(userId);
}

export async function getRecoveryPhraseHash(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('recovery_phrase_hash')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.recovery_phrase_hash as string;
}

// --- Coins ---

export async function updateCoins(userId: string, coins: number) {
  const { error } = await supabase
    .from('profiles')
    .update({ coins })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateTicketsData(userId: string, tickets: number, claimedLevels: number[]) {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      roulette_tickets: tickets,
      claimed_ticket_levels: claimedLevels
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function addCoins(userId: string, amount: number) {
  // Fetch current coins, then update
  const profile = await getProfile(userId);
  if (!profile) return;
  const newCoins = profile.coins + amount;
  await updateCoins(userId, newCoins);
}

// --- Progression ---

export async function updateClassicLevel(userId: string, level: number) {
  const { error } = await supabase
    .from('profiles')
    .update({ classic_level: level })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateUsername(userId: string, newUsername: string) {
  // Check cooldown (7 days)
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Profile not found');

  if (profile.last_username_change_at) {
    const lastChange = new Date(profile.last_username_change_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      throw new Error(`You can only change your username every 7 days. (${7 - diffDays} days remaining)`);
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      username: newUsername,
      last_username_change_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    if (error.message.includes('unique')) throw new Error('Username already taken');
    throw error;
  }
}

export async function updateSessionKey(userId: string, sessionKey: string | null) {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      session_key: sessionKey,
      last_seen_at: sessionKey ? new Date().toISOString() : null
    })
    .eq('id', userId);

  if (error) {
    console.error('[db.ts] updateSessionKey error:', error.message);
    throw error;
  }
}

// --- Accessories ---

export async function addAccessory(userId: string, accessoryId: string) {
  const { error } = await supabase
    .from('user_accessories')
    .upsert({ user_id: userId, accessory_id: accessoryId }, { onConflict: 'user_id,accessory_id' });
  if (error) throw error;
}

export async function getUserAccessories(userId: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('user_accessories')
      .select('accessory_id, equipped')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []) as { accessory_id: string; equipped: boolean }[];
  }).catch(() => []);
}

export async function setEquipped(userId: string, accessoryId: string, equipped: boolean) {
  const { error } = await supabase
    .from('user_accessories')
    .update({ equipped })
    .eq('user_id', userId)
    .eq('accessory_id', accessoryId);
  if (error) throw error;
}

export async function syncEquippedStatus(userId: string, accessoryId: string | null, type: string) {
  // 1. Unequip all items of the same category
  let unequipQuery = supabase
    .from('user_accessories')
    .update({ equipped: false })
    .eq('user_id', userId);

  if (type === 'hair') {
    unequipQuery = unequipQuery.or('accessory_id.like.hat-%,accessory_id.like.hair-%');
  } else if (type === 'face') {
    unequipQuery = unequipQuery.or('accessory_id.like.glasses-%,accessory_id.eq.face-hero');
  } else if (type === 'cheeks') {
    unequipQuery = unequipQuery.in('accessory_id', ['face-blush', 'face-star', 'face-freckles']);
  } else if (type === 'mouth') {
    unequipQuery = unequipQuery.in('accessory_id', ['face-bandaid', 'face-cat']);
  } else if (type === 'back') {
    unequipQuery = unequipQuery.or('accessory_id.eq.shirt-1,accessory_id.like.back-%,accessory_id.eq.fairy-wings,accessory_id.eq.fairy-wand');
  } else if (type === 'upper') {
    unequipQuery = unequipQuery.or('accessory_id.like.shirt-%,accessory_id.like.upper-%').neq('accessory_id', 'shirt-1').neq('accessory_id', 'shirt-5');
  } else if (type === 'lower') {
    unequipQuery = unequipQuery.or('accessory_id.eq.shirt-5,accessory_id.like.lower-%');
  } else if (type === 'shoes') {
    unequipQuery = unequipQuery.like('accessory_id', 'shoes-%');
  }

  const { error: unequipError } = await unequipQuery;
  if (unequipError) {
    console.error('Error unequipping items:', unequipError);
    throw unequipError;
  }

  // 2. Equip the new item if it's not null
  if (accessoryId) {
    const { error: equipError } = await supabase
      .from('user_accessories')
      .update({ equipped: true })
      .eq('user_id', userId)
      .eq('accessory_id', accessoryId);
    if (equipError) {
      console.error('Error equipping item:', equipError);
      throw equipError;
    }
  }
}

// --- Power Ups ---

export async function getUserPowerUps(userId: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('user_powerups')
      .select('potion, dust, powder, firefly')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Row doesn't exist yet — insert defaults and return them
      const defaultPowerUps = { user_id: userId, potion: 0, dust: 0, powder: 0, firefly: 0 };
      const { error: insertError } = await supabase.from('user_powerups').insert(defaultPowerUps);
      if (insertError) console.warn('[db.ts] getUserPowerUps insert failed:', insertError.message);
      return { potion: 0, dust: 0, powder: 0, firefly: 0 };
    }
    return data as { potion: number; dust: number; powder: number; firefly: number };
  }).catch((e) => {
    console.warn('[db.ts] getUserPowerUps failed:', e?.message);
    return null;
  });
}

export async function updateUserPowerUps(
  userId: string,
  powerUps: { potion: number; dust: number; powder: number; firefly: number }
) {
  const { error } = await supabase
    .from('user_powerups')
    .update(powerUps)
    .eq('user_id', userId);
  
  if (error) {
    // If update fails, maybe row doesn't exist, try upsert
    await supabase.from('user_powerups').upsert({ user_id: userId, ...powerUps }, { onConflict: 'user_id' });
  }
}

// --- Game Sessions ---

/**
 * Saves a game session using upsert strategy:
 * - One row per (user_id, difficulty, game_mode)
 * - Only updates when the new score beats the personal record
 * - Skips the write entirely if the score is not a new best
 */
export async function saveGameSession(
  userId: string,
  difficulty: string,
  score: number,
  totalQuestions: number,
  wrongCount: number,
  coinsEarned: number,
  gameMode: string = 'survival',
) {
  try {
    // 1. Fetch existing personal best for this user+difficulty+gameMode
    const { data: existing } = await supabase
      .from('game_sessions')
      .select('id, score')
      .eq('user_id', userId)
      .eq('difficulty', difficulty)
      .eq('game_mode', gameMode)
      .maybeSingle();

    if (existing) {
      // 2a. Row exists — only update if the new score is higher
      if (score > existing.score) {
        const { error } = await supabase
          .from('game_sessions')
          .update({
            score,
            total_questions: totalQuestions,
            wrong_count: wrongCount,
            coins_earned: coinsEarned,
            played_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
        console.log(`[db.ts] Updated personal best for ${difficulty}/${gameMode}: ${existing.score} → ${score}`);
      } else {
        console.log(`[db.ts] Score ${score} did not beat personal best ${existing.score} for ${difficulty}/${gameMode}, skipping save.`);
      }
    } else {
      // 2b. No row yet — insert the first record
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: userId,
          difficulty,
          score,
          total_questions: totalQuestions,
          wrong_count: wrongCount,
          coins_earned: coinsEarned,
          game_mode: gameMode,
        });
      if (error) throw error;
      console.log(`[db.ts] Inserted first record for ${difficulty}/${gameMode}: ${score}`);
    }
  } catch (err: any) {
    console.error('[db.ts] saveGameSession error:', err.message || err);
    throw err;
  }
}

export async function getUserHighScores(userId: string) {
  // Each row is already the personal best (one per difficulty for survival)
  const { data, error } = await supabase
    .from('game_sessions')
    .select('difficulty, score')
    .eq('user_id', userId)
    .eq('game_mode', 'survival');

  const highScores = { easy: 0, average: 0, hard: 0 };

  if (!error && data) {
    data.forEach(row => {
      // Map both 'hard' and legacy 'difficult' to the 'hard' field
      const diff = row.difficulty;
      if (diff === 'easy') highScores.easy = row.score;
      else if (diff === 'average') highScores.average = row.score;
      else if (diff === 'hard' || diff === 'difficult') {
        highScores.hard = Math.max(highScores.hard, row.score);
      }
    });
  }

  return highScores;
}

// --- Leaderboard ---

export async function getLeaderboard(limit: number = 50, offset: number = 0) {
  return withRetry(async () => {
    // Try RPC first (server-side RANK)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_leaderboard', { result_limit: limit, result_offset: offset });

    if (!rpcError && rpcData) {
      return rpcData as { id: string; username: string; coins: number; rank: number }[];
    }

    // Fallback: direct query with client-side ranking
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, coins')
      .order('coins', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Add client-side rank
    return (data || []).map((entry, i) => ({
      ...entry,
      rank: offset + i + 1,
    })) as { id: string; username: string; coins: number; rank: number }[];
  }).catch((e) => {
    console.error('Leaderboard query error:', e);
    return [];
  });
}

// --- Classic Level Leaderboard ---

export async function getClassicLeaderboard(limit: number = 50, offset: number = 0) {
  return withRetry(async () => {
    // Try RPC first (server-side RANK)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_classic_leaderboard', { result_limit: limit, result_offset: offset });

    if (!rpcError && rpcData) {
      return (rpcData as any[]).map(e => ({
        id: e.id,
        username: e.username,
        value: e.classic_level,
        rank: e.rank,
      }));
    }

    // Fallback: direct query with client-side ranking
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, classic_level')
      .order('classic_level', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((entry, i) => ({
      id: entry.id,
      username: entry.username,
      value: entry.classic_level,
      rank: offset + i + 1,
    }));
  }).catch((e) => {
    console.error('Classic leaderboard error:', e);
    return [];
  });
}

// --- Survival Leaderboard (one row per user per difficulty = personal best) ---

export async function getSurvivalLeaderboard(difficulty: string, limit: number = 50, offset: number = 0) {
  return withRetry(async () => {
    // Try RPC first (server-side RANK with LEFT JOIN)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_survival_leaderboard', { p_difficulty: difficulty, result_limit: limit, result_offset: offset });

    if (!rpcError && rpcData) {
      return (rpcData as any[]).map(e => ({
        id: e.id,
        username: e.username,
        value: e.best_score,
        rank: e.rank,
      }));
    }

    console.warn('Survival RPC fallback, error:', rpcError?.message);

    // Fallback: join profiles with game_sessions directly
    // Each game_sessions row is already the personal best (unique constraint)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username');

    if (profileError || !profiles) throw profileError || new Error('No profiles returned');

    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score')
      .eq('difficulty', difficulty)
      .eq('game_mode', 'survival');

    // Build a lookup map (each user has at most one row now)
    const scoreMap = new Map<string, number>();
    if (sessions) {
      for (const row of sessions) {
        scoreMap.set(row.user_id, row.score);
      }
    }

    const merged = profiles.map(p => ({
      id: p.id,
      username: p.username,
      value: scoreMap.get(p.id) || 0,
    }));

    merged.sort((a, b) => b.value - a.value);

    return merged.slice(0, limit).map((entry, i) => ({
      ...entry,
      rank: offset + i + 1,
    }));
  }).catch((e) => {
    console.error('Survival leaderboard error:', e);
    return [];
  });
}
// --- Shop Items ---

export interface ShopItem {
  id: string;
  type: string;
  name: string;
  price: number;
  description?: string;
  icon?: string;
  color?: string;
  is_magic: boolean;
}
// --- In-memory shop items cache (stale-while-revalidate) ---
let _shopItemsCache: ShopItem[] | null = null;
let _shopItemsCacheTime = 0;
const SHOP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getShopItems(): Promise<ShopItem[]> {
  // Return cached data instantly if still fresh
  if (_shopItemsCache && (Date.now() - _shopItemsCacheTime) < SHOP_CACHE_TTL) {
    return _shopItemsCache;
  }

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    // Update cache
    _shopItemsCache = data as ShopItem[];
    _shopItemsCacheTime = Date.now();
    return _shopItemsCache;
  }).catch((e) => {
    console.error('Error fetching shop items after retries:', e);
    // If fetch fails but we have stale cache, return it
    if (_shopItemsCache) return _shopItemsCache;
    return [];
  });
}

export async function purchaseItem(userId: string, itemId: string, price: number, isMagic: boolean, magicKey?: string) {
  // 1. Check coins
  const profile = await getProfile(userId);
  if (!profile) throw new Error('User not found');
  if (profile.coins < price) throw new Error('Not enough coins');

  // 2. Perform purchase
  if (isMagic && magicKey) {
    // Magic items increment counts
    const powerUps = await getUserPowerUps(userId);
    if (!powerUps) throw new Error('Failed to fetch power-ups');
    
    const updatedValue = (powerUps[magicKey as keyof typeof powerUps] || 0) + 1;
    await updateUserPowerUps(userId, { ...powerUps, [magicKey]: updatedValue });
  } else {
    // Accessories are added to collection
    await addAccessory(userId, itemId);
  }

  // 3. Deduct coins
  await updateCoins(userId, profile.coins - price);
}
