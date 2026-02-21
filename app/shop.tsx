import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import Svg, { Path, Ellipse, Line, G, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGameState, Accessory, PowerUps } from '@/hooks/useGameState';
import Stickman from '@/components/Stickman';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from 'expo-audio';

const SHOP_ITEMS: Accessory[] = [
  { id: 'hat-1', type: 'hair', name: 'Cool Cap', price: 50, owned: false },
  { id: 'hat-2', type: 'hair', name: 'Boy Cap', price: 60, owned: false },
  { id: 'hat-3', type: 'hair', name: 'Girl Hat', price: 60, owned: false },
  { id: 'glasses-1', type: 'face', name: 'Sunglasses', price: 30, owned: false },
  { id: 'glasses-2', type: 'face', name: 'Boy Glasses', price: 40, owned: false },
  { id: 'glasses-3', type: 'face', name: 'Girl Glasses', price: 40, owned: false },
  { id: 'shirt-1', type: 'clothes', name: 'Hero Cape', price: 100, owned: false },
  { id: 'shirt-2', type: 'clothes', name: 'Boy Outfit', price: 120, owned: false },
  { id: 'shirt-3', type: 'clothes', name: 'Girl Dress', price: 120, owned: false },
  { id: 'shoes-1', type: 'shoes', name: 'Speed Boots', price: 60, owned: false },
  { id: 'shoes-2', type: 'shoes', name: 'Boy Sneakers', price: 70, owned: false },
  { id: 'shoes-3', type: 'shoes', name: 'Girl Flats', price: 70, owned: false },
];

export interface MagicItem {
  id: keyof PowerUps;
  name: string;
  description: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MAGIC_ITEMS: MagicItem[] = [
  { id: 'potion', name: 'Pixie Patch Potion', description: 'Heal 1 body part', price: 150, icon: 'flask', color: '#E91E63' },
  { id: 'dust', name: 'Moonlit Minute Dust', description: '+30s to timer', price: 100, icon: 'hourglass', color: '#9C27B0' },
  { id: 'powder', name: 'Aurora Pause Powder', description: 'Pause timer for 30s', price: 200, icon: 'snow', color: '#00BCD4' },
  { id: 'firefly', name: 'Hinting Firefly', description: 'Show 1 digit of the answer', price: 80, icon: 'bulb', color: '#FFC107' },
];

const AccessoryIcon = ({ id, color = Colors.primary }: { id: string, color?: string }) => {
  const size = 60;
  const sw = 1.5;
  
  if (id === 'hat-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Ellipse cx={0} cy={0} rx={22} ry={4} fill={color} />
          <Path
            d={`M-16.5,0 Q-16.5,-16 0,-17 Q16.5,-16 16.5,0 Z`}
            fill={color}
            stroke="#1976D2"
            strokeWidth={1}
          />
          <Line x1={-15} y1={-2} x2={15} y2={-2} stroke="#1976D2" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  
  if (id === 'hat-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Path d={`M-18,0 Q-18,-18 0,-18 Q18,-18 18,0 Z`} fill="#FF5722" stroke="#E64A19" strokeWidth={1} />
          <Path d={`M-18,0 L25,0`} stroke="#E64A19" strokeWidth={3} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }

  if (id === 'hat-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 65) scale(1.5)">
          <Ellipse cx={0} cy={2} rx={26} ry={6} fill="#F06292" />
          <Path d={`M-15,0 Q-15,-20 0,-20 Q15,-20 15,0 Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Line x1={-14} y1={-2} x2={14} y2={-2} stroke="#D81B60" strokeWidth={3} />
        </G>
      </Svg>
    );
  }
  
  if (id === 'glasses-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Circle cx={-12} cy={0} r={8} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw} />
          <Circle cx={12} cy={0} r={8} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw} />
          <Line x1={-4} y1={0} x2={4} y2={0} stroke="#37474F" strokeWidth={sw} />
          <Line x1={-20} y1={0} x2={-30} y2={-5} stroke="#37474F" strokeWidth={1} />
          <Line x1={20} y1={0} x2={30} y2={-5} stroke="#37474F" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'glasses-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path d={`M-20,-6 L-4,-6 L-4,6 L-20,6 Z`} fill="none" stroke="#2196F3" strokeWidth={sw} />
          <Path d={`M4,-6 L20,-6 L20,6 L4,6 Z`} fill="none" stroke="#2196F3" strokeWidth={sw} />
          <Line x1={-4} y1={0} x2={4} y2={0} stroke="#2196F3" strokeWidth={sw} />
        </G>
      </Svg>
    );
  }

  if (id === 'glasses-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Circle cx={-12} cy={0} r={9} fill="none" stroke="#E91E63" strokeWidth={sw} />
          <Circle cx={12} cy={0} r={9} fill="none" stroke="#E91E63" strokeWidth={sw} />
          <Line x1={-3} y1={0} x2={3} y2={0} stroke="#E91E63" strokeWidth={sw} />
          <Path d={`M-20,-8 L-15,-13`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
          <Path d={`M20,-8 L15,-13`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
        </G>
      </Svg>
    );
  }
  
  if (id === 'shirt-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path
            d={`M-12,-15 L-25,18 Q0,25 25,18 L12,-15 Z`}
            fill="rgba(231, 76, 60, 0.4)"
            stroke={Colors.error}
            strokeWidth={1.5}
          />
          <Circle cx={0} cy={-13} r={3} fill={Colors.secondary} stroke="#E57373" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path d={`M-10,-15 L-20,-5 L-15,0 L-8,-5 L-8,15 L8,15 L8,-5 L15,0 L20,-5 L10,-15 Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1} />
        </G>
      </Svg>
    );
  }

  if (id === 'shirt-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 45) scale(1.5)">
          <Path d={`M-8,-15 L-12,-5 L-20,15 Q0,20 20,15 L12,-5 L8,-15 Z`} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          <Line x1={-10} y1={-5} x2={10} y2={-5} stroke="#7B1FA2" strokeWidth={2} />
        </G>
      </Svg>
    );
  }
  
  if (id === 'shoes-1') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.8)">
          <Path
            d={`M-25,10 L-25,-5 L-12,-5 L-10,-12 L-30,-12 Z`}
            fill="#37474F"
            stroke="#263238"
            strokeWidth={1}
          />
          <Path
            d={`M25,10 L25,-5 L12,-5 L10,-12 L30,-12 Z`}
            fill="#37474F"
            stroke="#263238"
            strokeWidth={1}
          />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-25,15 L-25,2 L-10,2 L-8,-5 L-30,-5 Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={-18} cy={8} r={3} fill="#fff" />
          <Path d={`M25,15 L25,2 L10,2 L8,-5 L30,-5 Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={18} cy={8} r={3} fill="#fff" />
        </G>
      </Svg>
    );
  }

  if (id === 'shoes-3') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50) scale(1.5)">
          <Path d={`M-22,15 L-22,5 Q-15,5 -12,15 Z`} fill="#E91E63" />
          <Line x1={-22} y1={8} x2={-15} y2={8} stroke="#fff" strokeWidth={1.5} />
          <Path d={`M22,15 L22,5 Q15,5 12,15 Z`} fill="#E91E63" />
          <Line x1={22} y1={8} x2={15} y2={8} stroke="#fff" strokeWidth={1.5} />
        </G>
      </Svg>
    );
  }

  // Fallback
  return <Ionicons name="shirt-outline" size={32} color={color} />;
};

export default function ShopScreen() {
  const [activeTab, setActiveTab] = React.useState<'character' | 'magic'>('character');
  const purchasePlayer = useAudioPlayer(require('@/assets/sounds/purchase.mp3'));
  const insets = useSafeAreaInsets();
  const { coins, ownedAccessories, buyAccessory, equipAccessory, equippedAccessories, buyAccessoryForUser, powerUps, buyPowerUp, buyPowerUpForUser } = useGameState();
  const { user, isGuest } = useAuth();

  const renderItem = ({ item }: { item: Accessory }) => {
    const isOwned = ownedAccessories.includes(item.id);
    const isEquipped = Object.values(equippedAccessories).includes(item.id);

    return (
      <View style={styles.itemCard}>
        <View style={[styles.itemIcon, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
          <AccessoryIcon id={item.id} color={Colors.primary} />
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

  const renderMagicItem = ({ item }: { item: MagicItem }) => {
    const quantity = powerUps[item.id];

    return (
      <View style={styles.itemCard}>
        <View style={[styles.itemIcon, { backgroundColor: `${item.color}1A` }]}>
          <Ionicons name={item.icon} size={32} color={item.color} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Ionicons name="sparkles" size={14} color="#FFD700" />
          <Text style={styles.itemPriceMagic}>{item.price}</Text>
        </View>
        <View style={styles.magicActionRow}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>x{quantity}</Text>
          </View>
          <Pressable
            style={[styles.buyBtn, styles.magicBuyBtn]}
            onPress={async () => {
              if (coins >= item.price) {
                purchasePlayer.seekTo(0);
                purchasePlayer.play();
                
                if (!isGuest && user) {
                  await buyPowerUpForUser(user.id, item.id, item.price);
                } else {
                  buyPowerUp(item.id, item.price);
                }
              }
            }}
          >
            <Text style={styles.buyBtnText}>Buy</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.coinBadge}>
          <Ionicons name="sparkles" size={16} color="#FFD700" />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => setActiveTab('character')}
        >
          <Text style={[styles.tabText, activeTab === 'character' && styles.activeTabText]}>Character</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'magic' && styles.activeTab]}
          onPress={() => setActiveTab('magic')}
        >
          <Text style={[styles.tabText, activeTab === 'magic' && styles.activeTabText]}>Magic Items</Text>
        </Pressable>
      </View>

      {activeTab === 'character' && (
        <View style={styles.previewArea}>
          <Stickman wrongCount={0} size={150} />
        </View>
      )}

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.secondary} />
          <Text style={styles.guestBannerText}>Login to sync across devices!</Text>
        </View>
      )}

      {activeTab === 'character' ? (
        <FlatList
          data={SHOP_ITEMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={MAGIC_ITEMS}
          renderItem={renderMagicItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  previewArea: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
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
  itemName: { fontSize: 15, fontFamily: 'Fredoka_600SemiBold', color: Colors.text, textAlign: 'center', minHeight: 40 },
  itemDesc: { fontSize: 12, fontFamily: 'Fredoka_500Medium', color: Colors.textLight, textAlign: 'center', marginBottom: 8, minHeight: 32 },
  itemPrice: { fontSize: 14, fontFamily: 'Fredoka_500Medium', color: Colors.textLight, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  itemPriceMagic: { fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: '#B8860B' },
  buyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
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
  magicBuyBtn: {
    flex: 1,
  },
  ownedBtn: { backgroundColor: Colors.secondary },
  equippedBtn: { backgroundColor: Colors.tertiary },
  buyBtnText: { color: '#fff', fontFamily: 'Fredoka_600SemiBold', fontSize: 14 },
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
