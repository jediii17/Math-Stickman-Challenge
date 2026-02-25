import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as db from '@/lib/db';

export type AccessoryType = 'hair' | 'face' | 'upper' | 'lower' | 'shoes' | 'back' | 'balloons';

export interface Accessory {
  id: string;
  type: AccessoryType;
  name: string;
  price: number;
  owned: boolean;
}

export interface HighScores {
  easy: number;
  average: number;
  difficult: number;
}

export interface PowerUps {
  potion: number;
  dust: number;
  powder: number;
  firefly: number;
}

interface GameState {
  coins: number;
  highScores: HighScores;
  classicLevel: number;
  ownedAccessories: string[];
  equippedAccessories: Record<AccessoryType, string | null>;
  powerUps: PowerUps;
  addCoins: (amount: number) => void;
  buyAccessory: (accessory: Accessory) => boolean;
  equipAccessory: (type: AccessoryType, id: string | null) => void;
  buyPowerUp: (id: keyof PowerUps, price: number) => boolean;
  usePowerUp: (id: keyof PowerUps) => boolean;
  advanceClassicLevel: () => void;
  advanceClassicLevelForUser: (userId: string) => Promise<void>;
  loadFromDb: (userId: string) => Promise<void>;
  syncCoinsToDb: (userId: string) => Promise<void>;
  buyAccessoryForUser: (userId: string, accessory: Accessory) => Promise<boolean>;
  equipAccessoryForUser: (userId: string, type: AccessoryType, id: string | null) => Promise<void>;
  buyPowerUpForUser: (userId: string, id: keyof PowerUps, price: number) => Promise<boolean>;
  usePowerUpForUser: (userId: string, id: keyof PowerUps) => Promise<boolean>;
  updateHighScore: (difficulty: keyof HighScores, score: number) => void;
  resetForGuest: () => void;
}

const DEFAULT_ACCESSORIES = ['default-hair', 'default-face', 'default-clothes', 'default-shoes', 'default-back', 'default-balloons'];

/** Maps any accessory ID to its equipment slot */
function getSlotForAccessory(id: string): AccessoryType | null {
  if (id.startsWith('hat-') || id.startsWith('hair-')) return 'hair';
  if (id.startsWith('glasses-') || id.startsWith('face-')) return 'face';
  if (id.startsWith('shoes-')) return 'shoes';
  // 'back' items: shirt-1 (cape), back-*, fairy-wings, fairy-wand
  if (id === 'shirt-1' || id.startsWith('back-') || id === 'fairy-wings' || id === 'fairy-wand') return 'back';
  // 'lower' items: shirt-5 (skirt), lower-*
  if (id === 'shirt-5' || id.startsWith('lower-')) return 'lower';
  // 'upper' items: remaining shirts (shirt-2, shirt-3, shirt-4) and new upper-* items
  if (id.startsWith('shirt-') || id.startsWith('upper-')) return 'upper';
  if (id.startsWith('balloons-')) return 'balloons';
  return null;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      highScores: { easy: 0, average: 0, difficult: 0 },
      classicLevel: 1,
      ownedAccessories: [...DEFAULT_ACCESSORIES],
      equippedAccessories: {
        hair: null,
        face: null,
        upper: null,
        lower: null,
        shoes: null,
        back: null,
        balloons: null,
      },
      powerUps: { potion: 0, dust: 0, powder: 0, firefly: 0 },
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      buyAccessory: (accessory) => {
        const { coins, ownedAccessories } = get();
        if (coins >= accessory.price && !ownedAccessories.includes(accessory.id)) {
          set((state) => ({
            coins: state.coins - accessory.price,
            ownedAccessories: [...state.ownedAccessories, accessory.id],
          }));
          return true;
        }
        return false;
      },
      equipAccessory: (type, id) =>
        set((state) => ({
          equippedAccessories: { ...state.equippedAccessories, [type]: id },
        })),

      buyPowerUp: (id, price) => {
        const { coins } = get();
        if (coins >= price) {
          set((state) => ({
            coins: state.coins - price,
            powerUps: { ...state.powerUps, [id]: state.powerUps[id] + 1 },
          }));
          return true;
        }
        return false;
      },

      usePowerUp: (id) => {
        const { powerUps } = get();
        if (powerUps[id] > 0) {
          set((state) => ({
            powerUps: { ...state.powerUps, [id]: state.powerUps[id] - 1 },
          }));
          return true;
        }
        return false;
      },

      updateHighScore: (difficulty, score) =>
        set((state) => {
          if (score > state.highScores[difficulty]) {
            return {
              highScores: {
                ...state.highScores,
                [difficulty]: score,
              }
            };
          }
          return state;
        }),

      advanceClassicLevel: () =>
        set((state) => ({
          classicLevel: state.classicLevel + 1,
        })),

      advanceClassicLevelForUser: async (userId: string) => {
        const { classicLevel } = get();
        const nextLevel = classicLevel + 1;
        set({ classicLevel: nextLevel });
        try {
          await db.updateClassicLevel(userId, nextLevel);
        } catch (e) {
          console.warn('Failed to sync classic level:', e);
        }
      },

      // Load user state from Supabase
      loadFromDb: async (userId) => {
        try {
          const profile = await db.getProfile(userId);
          const accessories = await db.getUserAccessories(userId);
          const dbPowerUps = await db.getUserPowerUps(userId);
          const dbHighScores = await db.getUserHighScores(userId);

          if (profile) {
            const ownedIds = accessories.map((a) => a.accessory_id);
            const equipped: Record<AccessoryType, string | null> = {
              hair: null,
              face: null,
              upper: null,
              lower: null,
              shoes: null,
              back: null,
              balloons: null,
            };

            accessories.forEach((a) => {
              if (a.equipped) {
                const slot = getSlotForAccessory(a.accessory_id);
                if (slot) equipped[slot] = a.accessory_id;
              }
            });

            set({
              coins: profile.coins,
              classicLevel: profile.classic_level || 1,
              ownedAccessories: [...DEFAULT_ACCESSORIES, ...ownedIds],
              equippedAccessories: equipped,
              powerUps: dbPowerUps || { potion: 0, dust: 0, powder: 0, firefly: 0 },
              highScores: dbHighScores,
            });
          }
        } catch (e) {
          console.warn('Failed to load from DB:', e);
        }
      },

      // Sync coins to Supabase
      syncCoinsToDb: async (userId) => {
        try {
          const { coins } = get();
          await db.updateCoins(userId, coins);
        } catch (e) {
          console.warn('Failed to sync coins:', e);
        }
      },

      // Buy accessory and persist to Supabase
      buyAccessoryForUser: async (userId, accessory) => {
        const { coins, ownedAccessories } = get();
        if (coins >= accessory.price && !ownedAccessories.includes(accessory.id)) {
          const newCoins = coins - accessory.price;
          set((state) => ({
            coins: newCoins,
            ownedAccessories: [...state.ownedAccessories, accessory.id],
          }));
          await db.updateCoins(userId, newCoins);
          await db.addAccessory(userId, accessory.id);
          return true;
        }
        return false;
      },

      equipAccessoryForUser: async (userId, type, id) => {
        set((state) => ({
          equippedAccessories: { ...state.equippedAccessories, [type]: id },
        }));
        await db.syncEquippedStatus(userId, id, type);
      },

      buyPowerUpForUser: async (userId, id, price) => {
        const { coins, powerUps } = get();
        if (coins >= price) {
          const newCoins = coins - price;
          const newPowerUps = { ...powerUps, [id]: powerUps[id] + 1 };
          
          set({
            coins: newCoins,
            powerUps: newPowerUps,
          });
          
          await db.updateCoins(userId, newCoins);
          await db.updateUserPowerUps(userId, newPowerUps);
          return true;
        }
        return false;
      },

      usePowerUpForUser: async (userId, id) => {
        const { powerUps } = get();
        if (powerUps[id] > 0) {
          const newPowerUps = { ...powerUps, [id]: powerUps[id] - 1 };
          
          set({
            powerUps: newPowerUps,
          });
          
          await db.updateUserPowerUps(userId, newPowerUps);
          return true;
        }
        return false;
      },

      // Reset state for guest mode
      resetForGuest: () =>
        set({
          coins: 0,
          highScores: { easy: 0, average: 0, difficult: 0 },
          classicLevel: 1,
          ownedAccessories: [...DEFAULT_ACCESSORIES],
          equippedAccessories: { hair: null, face: null, upper: null, lower: null, shoes: null, back: null, balloons: null },
          powerUps: { potion: 0, dust: 0, powder: 0, firefly: 0 },
        }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
