import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as db from '@/lib/db';

export type AccessoryType = 'hair' | 'face' | 'clothes' | 'shoes';

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

interface GameState {
  coins: number;
  highScores: HighScores;
  ownedAccessories: string[];
  equippedAccessories: Record<AccessoryType, string | null>;
  addCoins: (amount: number) => void;
  buyAccessory: (accessory: Accessory) => boolean;
  equipAccessory: (type: AccessoryType, id: string | null) => void;
  loadFromDb: (userId: string) => Promise<void>;
  syncCoinsToDb: (userId: string) => Promise<void>;
  buyAccessoryForUser: (userId: string, accessory: Accessory) => Promise<boolean>;
  updateHighScore: (difficulty: keyof HighScores, score: number) => void;
  resetForGuest: () => void;
}

const DEFAULT_ACCESSORIES = ['default-hair', 'default-face', 'default-clothes', 'default-shoes'];

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      highScores: { easy: 0, average: 0, difficult: 0 },
      ownedAccessories: [...DEFAULT_ACCESSORIES],
      equippedAccessories: {
        hair: null,
        face: null,
        clothes: null,
        shoes: null,
      },
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

      // Load user state from Supabase
      loadFromDb: async (userId) => {
        try {
          const profile = await db.getProfile(userId);
          const accessories = await db.getUserAccessories(userId);

          if (profile) {
            const ownedIds = accessories.map((a) => a.accessory_id);
            const equipped: Record<AccessoryType, string | null> = {
              hair: null,
              face: null,
              clothes: null,
              shoes: null,
            };

            accessories.forEach((a) => {
              if (a.equipped) {
                if (a.accessory_id.startsWith('hat-')) equipped.hair = a.accessory_id;
                else if (a.accessory_id.startsWith('glasses-')) equipped.face = a.accessory_id;
                else if (a.accessory_id.startsWith('shirt-')) equipped.clothes = a.accessory_id;
                else if (a.accessory_id.startsWith('shoes-')) equipped.shoes = a.accessory_id;
              }
            });

            set({
              coins: profile.coins,
              ownedAccessories: [...DEFAULT_ACCESSORIES, ...ownedIds],
              equippedAccessories: equipped,
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

      // Reset state for guest mode
      resetForGuest: () =>
        set({
          coins: 0,
          highScores: { easy: 0, average: 0, difficult: 0 },
          ownedAccessories: [...DEFAULT_ACCESSORIES],
          equippedAccessories: { hair: null, face: null, clothes: null, shoes: null },
        }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
