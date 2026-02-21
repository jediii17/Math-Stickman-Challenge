import { supabase } from './supabase';

// --- Profile helpers ---

export async function createProfile(userId: string, username: string, recoveryPhraseHash: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, username, coins: 0, recovery_phrase_hash: recoveryPhraseHash });
  if (error) throw error;
  return { id: userId, username, coins: 0 };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, coins')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as { id: string; username: string; coins: number };
}

export async function getUserById(userId: string) {
  return getProfile(userId);
}

export async function getRecoveryPhraseHash(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('recovery_phrase_hash')
    .eq('id', userId)
    .single();
  if (error) return null;
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

export async function addCoins(userId: string, amount: number) {
  // Fetch current coins, then update
  const profile = await getProfile(userId);
  if (!profile) return;
  const newCoins = profile.coins + amount;
  await updateCoins(userId, newCoins);
}

// --- Accessories ---

export async function addAccessory(userId: string, accessoryId: string) {
  const { error } = await supabase
    .from('user_accessories')
    .upsert({ user_id: userId, accessory_id: accessoryId }, { onConflict: 'user_id,accessory_id' });
  if (error) throw error;
}

export async function getUserAccessories(userId: string) {
  const { data, error } = await supabase
    .from('user_accessories')
    .select('accessory_id, equipped')
    .eq('user_id', userId);
  if (error) return [];
  return (data || []) as { accessory_id: string; equipped: boolean }[];
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

  if (type === 'hair') unequipQuery = unequipQuery.like('accessory_id', 'hat-%');
  else if (type === 'face') unequipQuery = unequipQuery.like('accessory_id', 'glasses-%');
  else if (type === 'back') unequipQuery = unequipQuery.eq('accessory_id', 'shirt-1');
  else if (type === 'clothes') unequipQuery = unequipQuery.like('accessory_id', 'shirt-%').neq('accessory_id', 'shirt-1');
  else if (type === 'shoes') unequipQuery = unequipQuery.like('accessory_id', 'shoes-%');

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
  const { data, error } = await supabase
    .from('user_powerups')
    .select('potion, dust, powder, firefly')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row doesn't exist yet, insert default 0s
      const defaultPowerUps = { user_id: userId, potion: 0, dust: 0, powder: 0, firefly: 0 };
      await supabase.from('user_powerups').insert(defaultPowerUps);
      return { potion: 0, dust: 0, powder: 0, firefly: 0 };
    }
    return null;
  }
  return data as { potion: number; dust: number; powder: number; firefly: number };
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

export async function saveGameSession(
  userId: string,
  difficulty: string,
  score: number,
  totalQuestions: number,
  wrongCount: number,
  coinsEarned: number,
) {
  const { error } = await supabase
    .from('game_sessions')
    .insert({
      user_id: userId,
      difficulty,
      score,
      total_questions: totalQuestions,
      wrong_count: wrongCount,
      coins_earned: coinsEarned,
    });
  if (error) throw error;
}

export async function getUserHighScores(userId: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('difficulty, score')
    .eq('user_id', userId);

  const highScores = { easy: 0, average: 0, difficult: 0 };
  
  if (!error && data) {
    data.forEach(row => {
      const diff = row.difficulty as 'easy' | 'average' | 'difficult';
      if (diff && highScores[diff] !== undefined && row.score > highScores[diff]) {
        highScores[diff] = row.score;
      }
    });
  }

  return highScores;
}
