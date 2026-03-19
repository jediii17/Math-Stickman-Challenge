import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import Pressable from '@/components/AppPressable';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGameState, Accessory, PowerUps, AccessoryType, getSlotForAccessory } from '@/hooks/useGameState';
import Stickman from '@/components/Stickman';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from 'expo-audio';
import * as db from '@/lib/db';
import { ShopItem } from '@/lib/db';
import StickmanCoin from '@/components/StickmanCoin';
import AccessoryIcon from '@/components/AccessoryIcon';

// ─── Category definitions ───
type CategoryKey = 'hair' | 'face' | 'upper' | 'lower' | 'shoes' | 'back' | 'tail' | 'balloons';

interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  types: AccessoryType[];
}

const CATEGORIES: Category[] = [
  { key: 'hair', label: 'Head', icon: 'person-circle-outline', color: '#9B59B6', types: ['hair'] },
  { key: 'face', label: 'Face', icon: 'glasses-outline', color: '#3498DB', types: ['face', 'cheeks', 'mouth'] },
  { key: 'upper', label: 'Upper', icon: 'shirt-outline', color: '#E67E22', types: ['upper'] },
  { key: 'lower', label: 'Lower', icon: 'walk-outline', color: '#2ECC71', types: ['lower'] },
  { key: 'shoes', label: 'Shoes', icon: 'footsteps-outline', color: '#E74C3C', types: ['shoes'] },
  { key: 'back', label: 'Back', icon: 'briefcase-outline', color: '#1ABC9C', types: ['back'] },
  { key: 'tail', label: 'Tails', icon: 'cat', iconFamily: 'MaterialCommunityIcons', color: '#FF9800', types: ['tail'] },
  { key: 'balloons', label: 'Balloons', icon: 'balloon-outline', color: '#FF4081', types: ['balloons'] },
];

export default function ShopScreen() {
  const [activeTab, setActiveTab] = React.useState<'character' | 'magic'>('character');
  const [activeCategory, setActiveCategory] = React.useState<CategoryKey>('hair');
  const [trialItem, setTrialItem] = React.useState<{ id: string; type: AccessoryType } | null>(null);
  const [dbItems, setDbItems] = React.useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);




  useEffect(() => {
    fetchItems();
  }, []);

 const fetchItems = async () => {
    try {
      setIsLoading(true);
      const items = await db.getShopItems();
      setDbItems(items || []); // Ensure we set an array even if it fails
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
      // Set some error state here to show to the user

    } finally {
      setIsLoading(false);
    }
  };

  const purchasePlayer = useAudioPlayer(require('@/assets/sounds/purchase.mp3'));
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;
  const previewMaxHeight = isSmallScreen ? 200 : 250;
  const shopStickmanSize = Math.min(Math.round(screenWidth * 0.20), isSmallScreen ? 110 : 130);
  const { coins, ownedAccessories, buyAccessory, equipAccessory, equippedAccessories, buyAccessoryForUser, equipAccessoryForUser, powerUps, buyPowerUp, buyPowerUpForUser } = useGameState();
  const { user, isGuest } = useAuth();

  // Build preview overrides from trial item
  const previewOverrides: Partial<Record<AccessoryType, string | null>> | undefined = trialItem
    ? { [getSlotForAccessory(trialItem.id) || trialItem.type]: trialItem.id }
    : undefined;

  // Filter and sort items by active category
  const categoryDef = CATEGORIES.find(c => c.key === activeCategory)!;
  const filteredItems = dbItems
    .filter(item => {
      if (item.is_magic) return false;
      const slot = getSlotForAccessory(item.id) || (item.type as AccessoryType);
      return categoryDef.types.includes(slot);
    })
    .sort((a, b) => {
      const aOwned = ownedAccessories.includes(a.id);
      const bOwned = ownedAccessories.includes(b.id);
      if (aOwned && !bOwned) return -1;
      if (!aOwned && bOwned) return 1;
      return 0;
    });
  const magicItemsList = dbItems.filter(item => item.is_magic);

  const handleTryItem = (item: ShopItem) => {
    // Toggle trial: if same item, clear; otherwise set
    if (trialItem?.id === item.id) {
      setTrialItem(null);
    } else {
      setTrialItem({ id: item.id, type: item.type as AccessoryType });
    }
  };

  const handleBuyTrialItem = async () => {
    if (!trialItem) return;
    const item = dbItems.find(i => i.id === trialItem.id);
    if (!item) return;
    if (coins < item.price) return;

    purchasePlayer.seekTo(0);
    purchasePlayer.play();

    if (!isGuest && user) {
      await buyAccessoryForUser(user.id, item as unknown as Accessory);
    } else {
      buyAccessory(item as unknown as Accessory);
    }
    // After buying, auto-equip and clear trial
    if (!isGuest && user) {
      await equipAccessoryForUser(user.id, getSlotForAccessory(item.id) || item.type as AccessoryType, item.id);
    } else {
      equipAccessory(getSlotForAccessory(item.id) || item.type as AccessoryType, item.id);
    }
    setTrialItem(null);
  };

  const handleCategoryChange = (key: CategoryKey) => {
    setActiveCategory(key);
    setTrialItem(null); // Clear trial when switching categories
  };

  const renderItem = React.useCallback(({ item }: { item: ShopItem }) => {
    const isOwned = ownedAccessories.includes(item.id);
    const isEquipped = Object.values(equippedAccessories).includes(item.id);
    const isTrying = trialItem?.id === item.id;

    return (
      <View style={[styles.itemCard, isTrying && styles.itemCardTrial]}>
        <View style={[styles.itemIcon, { backgroundColor: isTrying ? 'rgba(46, 204, 113, 0.15)' : 'rgba(46, 204, 113, 0.06)' }]}>
          <AccessoryIcon id={item.id} color={Colors.primary} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        {!isOwned && (
          <View style={styles.priceRow}>
            <StickmanCoin size={15} animated={false} />
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        )}
        {isOwned ? (
          <Pressable
            style={[styles.actionBtn, isEquipped ? styles.equippedBtn : styles.equipBtn]}
            onPress={async () => {
              if (!isGuest && user) {
                await equipAccessoryForUser(user.id, getSlotForAccessory(item.id) || item.type as AccessoryType, isEquipped ? null : item.id);
              } else {
                equipAccessory(getSlotForAccessory(item.id) || item.type as AccessoryType, isEquipped ? null : item.id);
              }
            }}
          >
            <Ionicons name={isEquipped ? 'checkmark-circle' : 'add-circle-outline'} size={16} color="#fff" />
            <Text style={styles.actionBtnText}>{isEquipped ? 'Equipped' : 'Equip'}</Text>
          </Pressable>
        ) : (
          <View style={styles.dualBtnRow}>
            <Pressable
              style={[styles.actionBtn, styles.tryBtnHalf, isTrying && styles.tryingBtn]}
              onPress={() => handleTryItem(item)}
            >
              <Ionicons name={isTrying ? 'eye' : 'eye-outline'} size={14} color="#fff" />
              <Text style={styles.actionBtnText}>{isTrying ? 'Trying' : 'Try'}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.buyBtnHalf]}
              onPress={async () => {
                if (coins >= item.price) {
                  purchasePlayer.seekTo(0);
                  purchasePlayer.play();
                  if (!isGuest && user) {
                    await buyAccessoryForUser(user.id, item as unknown as Accessory);
                    await equipAccessoryForUser(user.id, getSlotForAccessory(item.id) || item.type as AccessoryType, item.id);
                  } else {
                    buyAccessory(item as unknown as Accessory);
                    equipAccessory(getSlotForAccessory(item.id) || item.type as AccessoryType, item.id);
                  }
                  if (trialItem?.id === item.id) setTrialItem(null);
                }
              }}
            >
              <Ionicons name="cart-outline" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Buy</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }, [ownedAccessories, equippedAccessories, trialItem, coins, isGuest, user]);

  const renderMagicItem = React.useCallback(({ item }: { item: ShopItem }) => {
    const quantity = powerUps[item.id as keyof PowerUps] || 0;

    return (
      <View style={styles.itemCard}>
        <View style={[styles.itemIcon, { backgroundColor: `${item.color}1A` }]}>
          <Ionicons name={item.icon as any} size={32} color={item.color} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.priceRow}>
          <StickmanCoin size={16} animated={false} />
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
        <View style={styles.inventoryRow}>
          <Text style={styles.inventoryText}>Owned: {quantity}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            styles.buyBtn,
            pressed && { opacity: 0.8 }
          ]}
          onPress={async () => {
            if (coins >= item.price) {
              purchasePlayer.seekTo(0);
              purchasePlayer.play();
              if (!isGuest && user) {
                await buyPowerUpForUser(user.id, item.id as keyof PowerUps, item.price);
              } else {
                buyPowerUp(item.id as keyof PowerUps, item.price);
              }
            }
          }}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Buy One</Text>
        </Pressable>
      </View>
    );
  }, [powerUps, coins, isGuest, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.coinBadge}>
          <StickmanCoin size={18} />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── Top-level tabs ── */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => { setActiveTab('character'); setTrialItem(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'character' && styles.activeTabText]}>Character</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'magic' && styles.activeTab]}
          onPress={() => { setActiveTab('magic'); setTrialItem(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'magic' && styles.activeTabText]}>Magic Items</Text>
        </Pressable>
      </View>

      {/* ── Character tab content ── */}
      {activeTab === 'character' && (
        <>
          {/* Preview area with trial badge */}
          <View style={[styles.previewArea, { maxHeight: previewMaxHeight }, trialItem && styles.previewAreaTrial]}>
            <Stickman 
              wrongCount={0} 
              size={shopStickmanSize} 
              previewOverrides={previewOverrides} 
              isShop={true} 
              forceShowBalloons={activeCategory === 'balloons'} 
            />
            {trialItem && (
              <View style={styles.trialBadge}>
                <Ionicons name="eye" size={12} color={Colors.primary} />
                <Text style={styles.trialBadgeText}>Previewing</Text>
              </View>
            )}
          </View>

          {/* Category bar */}
          <View style={styles.categoryBar}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = dbItems.filter((i: ShopItem) => {
                if (i.is_magic) return false;
                const slot = getSlotForAccessory(i.id) || i.type;
                return cat.types.includes(slot as AccessoryType);
              }).length;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => handleCategoryChange(cat.key)}
                >
                  <View style={[styles.categoryIconWrap, isActive && { backgroundColor: cat.color + '20' }]}> 
                    {cat.iconFamily === 'MaterialCommunityIcons' ? (
                      <MaterialCommunityIcons name={cat.icon as any} size={20} color={isActive ? cat.color : Colors.textLight} />
                    ) : (
                      <Ionicons name={cat.icon as any} size={20} color={isActive ? cat.color : Colors.textLight} />
                    )}
                  </View>
                  <View style={[styles.categoryCountBadge, isActive && styles.categoryCountBadgeActive]}>
                    <Text style={[styles.categoryCountText, isActive && styles.categoryCountTextActive]}>{count}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* ── Remove Equipped Item Strip ── */}
          {(() => {
            const catTypes = categoryDef.types;
            const equippedId = catTypes.map(t => equippedAccessories[t]).find(Boolean);
            if (!equippedId) return null;
            const equippedItem = dbItems.find(i => i.id === equippedId);
            const equippedName = equippedItem?.name || equippedId;
            return (
              <View style={styles.removeEquippedStrip}>
                <View style={styles.removeEquippedInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.tertiary} />
                  <Text style={styles.removeEquippedText} numberOfLines={1}>
                    {equippedName}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.removeEquippedBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={async () => {
                    for (const t of catTypes) {
                      if (equippedAccessories[t]) {
                        if (!isGuest && user) {
                          await equipAccessoryForUser(user.id, t, null);
                        }
                        equipAccessory(t, null);
                      }
                    }
                    setTrialItem(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={14} color="#FFF" />
                  <Text style={styles.removeEquippedBtnText}>Remove</Text>
                </Pressable>
              </View>
            );
          })()}
        </>
      )}

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.secondary} />
          <Text style={styles.guestBannerText}>Login to sync across devices!</Text>
        </View>
      )}

      {/* ── Item grid ── */}
        {activeTab === 'character' ? (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.itemList}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : null
            }
          />
        ) : (
          <FlatList
            data={magicItemsList}
            renderItem={renderMagicItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.itemList}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} /> : null
            }
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Fredoka_700Bold', color: Colors.text },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinText: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#B8860B' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },

  // ── Preview ──
  previewArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  previewAreaTrial: {
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  trialBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trialBadgeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
  },

  // ── Category bar ──
  categoryBar: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: 4,
  },
  categoryPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
    gap: 4,
  },
  categoryPillActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  categoryCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  categoryCountBadgeActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  categoryCountText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 10,
    color: Colors.textLight,
  },
  categoryCountTextActive: {
    color: Colors.primary,
  },

  // ── Item grid ──
  list: { padding: 8 },
  itemCard: {
    width: '46%',
    backgroundColor: Colors.card,
    margin: 6,
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardTrial: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(46, 204, 113, 0.04)',
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemName: { fontSize: 13, fontFamily: 'Fredoka_600SemiBold', color: Colors.text, textAlign: 'center', minHeight: 34 },
  itemDesc: { fontSize: 11, fontFamily: 'Fredoka_500Medium', color: Colors.textLight, textAlign: 'center', marginBottom: 6, minHeight: 28 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8, backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  itemPrice: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#B8860B' },
  itemPriceMagic: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#B8860B' },

  // ── Action buttons ──
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    width: '100%',
  },
  actionBtnText: { color: '#fff', fontFamily: 'Fredoka_600SemiBold', fontSize: 13 },
  tryBtn: {
    backgroundColor: Colors.blue,
  },
  tryingBtn: {
    backgroundColor: '#2980B9',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  tryBtnHalf: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  buyBtnHalf: {
    flex: 1,
    backgroundColor: '#27AE60',
  },
  equipBtn: {
    backgroundColor: Colors.secondary,
  },
  equippedBtn: {
    backgroundColor: Colors.tertiary,
  },
  itemList: {
    padding: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },
  removeEquippedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.tertiary + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.tertiary + '30',
  },
  removeEquippedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  removeEquippedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  removeEquippedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E74C3C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeEquippedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  inventoryRow: {
    marginVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inventoryText: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
    textAlign: 'center',
  },
  buyBtn: {
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  magicBuyBtn: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  magicActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  quantityBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: Colors.text,
  },

  // ── Guest banner ──
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  guestBannerText: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.secondaryDark,
  },
});
