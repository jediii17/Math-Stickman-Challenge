import { supabase } from './supabase';

// --- Profile helpers ---

export async function createProfile(userId: string, username: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, username, coins: 0 });
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
