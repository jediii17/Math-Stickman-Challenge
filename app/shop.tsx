import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGameState, Accessory } from '@/hooks/useGameState';
import Stickman from '@/components/Stickman';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from 'expo-audio';

const SHOP_ITEMS: Accessory[] = [
  { id: 'hat-1', type: 'hair', name: 'Cool Cap', price: 50, owned: false },
  { id: 'glasses-1', type: 'face', name: 'Sunglasses', price: 30, owned: false },
  { id: 'shirt-1', type: 'clothes', name: 'Hero Cape', price: 100, owned: false },
  { id: 'shoes-1', type: 'shoes', name: 'Speed Boots', price: 60, owned: false },
];

export default function ShopScreen() {
  const purchasePlayer = useAudioPlayer(require('@/assets/sounds/purchase.mp3'));
  const insets = useSafeAreaInsets();
  const { coins, ownedAccessories, buyAccessory, equipAccessory, equippedAccessories, buyAccessoryForUser } = useGameState();
  const { user, isGuest } = useAuth();

  const renderItem = ({ item }: { item: Accessory }) => {
    const isOwned = ownedAccessories.includes(item.id);
    const isEquipped = Object.values(equippedAccessories).includes(item.id);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemIcon}>
          <Ionicons name="shirt-outline" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price} coins</Text>
        <Pressable
          style={[
            styles.buyBtn,
            isOwned && styles.ownedBtn,
            isEquipped && styles.equippedBtn
          ]}
          onPress={async () => {
            if (!isOwned) {
              // Optimistic audio
              if (coins >= item.price) {
                purchasePlayer.seekTo(0);
                purchasePlayer.play();
              }

              if (!isGuest && user) {
                await buyAccessoryForUser(user.id, item);
              } else {
                buyAccessory(item);
              }
            } else {
              equipAccessory(item.type, isEquipped ? null : item.id);
            }
          }}
        >
          <Text style={styles.buyBtnText}>
            {!isOwned ? 'Buy' : isEquipped ? 'Unequip' : 'Equip'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Character Shop</Text>
        <View style={styles.coinBadge}>
          <Ionicons name="sparkles" size={16} color="#FFD700" />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <View style={styles.previewArea}>
        <Stickman wrongCount={0} size={180} />
      </View>

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.secondary} />
          <Text style={styles.guestBannerText}>Login to save your purchases</Text>
        </View>
      )}

      <FlatList
        data={SHOP_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
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
  previewArea: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 24,
  },
  list: { padding: 8 },
  itemCard: {
    flex: 1,
    backgroundColor: Colors.card,
    margin: 8,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  itemName: { fontSize: 16, fontFamily: 'Fredoka_600SemiBold', color: Colors.text },
  itemPrice: { fontSize: 14, fontFamily: 'Fredoka_500Medium', color: Colors.textLight, marginBottom: 12 },
  buyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  ownedBtn: { backgroundColor: Colors.secondary },
  equippedBtn: { backgroundColor: Colors.tertiary },
  buyBtnText: { color: '#fff', fontFamily: 'Fredoka_600SemiBold' },
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
