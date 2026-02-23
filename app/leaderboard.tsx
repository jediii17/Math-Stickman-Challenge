import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable, FlatList, Platform, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import * as db from '@/lib/db';
import StickmanCoin, { abbreviateCoins } from '@/components/StickmanCoin';

// ─── Types ───
type TabKey = 'coins' | 'classic' | 'survival_easy' | 'survival_average' | 'survival_difficult';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  color: string;
}

const TABS: Tab[] = [
  { key: 'coins', label: 'Coins', icon: 'gold', color: '#FFD700' },
  { key: 'classic', label: 'Classic', icon: 'map-marker-path', color: '#3498DB' },
  { key: 'survival_easy', label: 'Easy', icon: 'sword-cross', color: '#2ECC71' },
  { key: 'survival_average', label: 'Average', icon: 'sword-cross', color: '#F39C12' },
  { key: 'survival_difficult', label: 'Hard', icon: 'skull-crossbones', color: '#E74C3C' },
];

interface LeaderboardEntry {
  id: string;
  username: string;
  value: number;
  rank: number;
}

// ─── Helpers ───
function getRankBadgeColors(rank: number): [string, string] {
  if (rank === 1) return ['#FFD700', '#F39C12'];
  if (rank === 2) return ['#E0E0E0', '#9E9E9E'];
  if (rank === 3) return ['#CD7F32', '#A0522D'];
  return ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'];
}

function getRowStyle(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: 'rgba(46, 204, 113, 0.6)' };
  }
  if (rank === 1) return { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)' };
  if (rank === 2) return { backgroundColor: 'rgba(192, 192, 192, 0.08)', borderColor: 'rgba(192, 192, 192, 0.25)' };
  if (rank === 3) return { backgroundColor: 'rgba(205, 127, 50, 0.08)', borderColor: 'rgba(205, 127, 50, 0.25)' };
  return { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' };
}

function getValueLabel(tab: TabKey, value: number): string {
  switch (tab) {
    case 'coins': return abbreviateCoins(value);
    case 'classic': return `Lv.${value}`;
    default: return `${value}Q`;
  }
}

// ─── Row Component ───
function LeaderboardRow({ entry, rank, isCurrentUser, activeTab }: {
  entry: LeaderboardEntry; rank: number; isCurrentUser: boolean; activeTab: TabKey;
}) {
  const rowStyle = getRowStyle(rank, isCurrentUser);
  const isTop3 = rank <= 3;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(rank * 30, 600)).springify()}>
      <View style={[styles.row, rowStyle]}>
        <LinearGradient
          colors={getRankBadgeColors(rank)}
          style={[styles.rankBadge, isTop3 && styles.rankBadgeGlow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {rank === 1 ? (
            <MaterialCommunityIcons name="crown" size={20} color="#fff" />
          ) : (
            <Text style={[styles.rankNumber, isTop3 && styles.rankNumberTop]}>{rank}</Text>
          )}
        </LinearGradient>

        <View style={styles.nameContainer}>
          <Text style={[styles.username, isTop3 && styles.topUsername, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
            {entry.username}
          </Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </View>

        <View style={styles.valueContainer}>
          {activeTab === 'coins' && <StickmanCoin size={16} animated={false} />}
          <Text style={[styles.valueText, isTop3 && styles.topValueText]}>
            {getValueLabel(activeTab, entry.value)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ───
export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('coins');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const fetchLeaderboard = useCallback(async (tab: TabKey) => {
    try {
      let data: LeaderboardEntry[] = [];

      switch (tab) {
        case 'coins': {
          const coins = await db.getLeaderboard(50, 0);
          data = coins.map(e => ({ id: e.id, username: e.username, value: e.coins, rank: e.rank }));
          break;
        }
        case 'classic': {
          data = await db.getClassicLeaderboard(50, 0);
          break;
        }
        case 'survival_easy': {
          data = await db.getSurvivalLeaderboard('easy', 50);
          break;
        }
        case 'survival_average': {
          data = await db.getSurvivalLeaderboard('average', 50);
          break;
        }
        case 'survival_difficult': {
          data = await db.getSurvivalLeaderboard('difficult', 50);
          break;
        }
      }

      setLeaderboard(data);
    } catch (e) {
      console.warn('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setLeaderboard([]);
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const currentUserEntry = user ? leaderboard.find(e => e.id === user.id) : null;
  const currentUserRank = currentUserEntry?.rank || 0;
  const activeTabInfo = TABS.find(t => t.key === activeTab)!;

  return (
    <LinearGradient
      colors={['#0F4C2E', '#1A7A3D', '#27AE60']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <View style={{ paddingTop: topPadding, paddingBottom: bottomPadding, flex: 1 }}>

        {/* Header */}
        <View style={styles.headerArea}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Hall of Fame</Text>
            <View style={styles.placeholder} />
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.trophyArea}>
            <View style={styles.trophyGlow}>
              <MaterialCommunityIcons name="trophy-award" size={54} color="#FFD700" />
            </View>
          </Animated.View>

          {/* Tab Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabBar}
            contentContainerStyle={styles.tabBarContent}
          >
            {TABS.map(tab => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && [styles.activeTab, { borderColor: tab.color }],
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.5)'}
                />
                <Text style={[
                  styles.tabLabel,
                  activeTab === tab.key && { color: tab.color, fontFamily: 'Fredoka_700Bold' },
                ]}>{tab.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Current user rank badge */}
          {!isGuest && user && currentUserRank > 0 && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.myRankBadge}>
              <Text style={styles.myRankLabel}>Your Rank</Text>
              <Text style={[styles.myRankNumber, { color: activeTabInfo.color }]}>#{currentUserRank}</Text>
              <Text style={styles.myRankValue}>{getValueLabel(activeTab, currentUserEntry!.value)}</Text>
            </Animated.View>
          )}
          {isGuest && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.loginPrompt}>
              <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.loginPromptText}>Log in to claim your rank</Text>
            </Animated.View>
          )}
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={activeTabInfo.color} />
              <Text style={styles.loadingText}>Loading legends...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="trophy-broken" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyTitle}>No Rankings Yet</Text>
              <Text style={styles.emptyDesc}>Be the first to leave a legacy.</Text>
            </View>
          ) : (
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LeaderboardRow
                  entry={item}
                  rank={item.rank}
                  isCurrentUser={!isGuest && user?.id === item.id}
                  activeTab={activeTab}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTabInfo.color} />
              }
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  trophyArea: {
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBar: {
    maxHeight: 50,
    marginBottom: 8,
  },
  tabBarContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.7)',
  },
  myRankBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  myRankLabel: {
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#fff',
  },
  myRankNumber: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFD700',
  },
  myRankValue: {
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
    color: 'rgba(255,255,255,0.8)',
  },
  loginPrompt: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loginPromptText: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.6)',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.6)',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.5)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rankBadgeGlow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankNumber: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
    color: 'rgba(255,255,255,0.8)',
  },
  rankNumberTop: {
    color: '#fff',
    fontSize: 18,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.8)',
    flexShrink: 1,
  },
  topUsername: {
    fontFamily: 'Fredoka_600SemiBold',
    color: '#fff',
  },
  currentUserName: {
    color: '#F1C40F',
    fontFamily: 'Fredoka_700Bold',
  },
  youBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(241, 196, 15, 0.4)',
  },
  youBadgeText: {
    fontSize: 10,
    fontFamily: 'Fredoka_700Bold',
    color: '#F1C40F',
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 15,
    fontFamily: 'Fredoka_600SemiBold',
    color: 'rgba(255,255,255,0.7)',
  },
  topValueText: {
    color: '#FFD700',
    fontFamily: 'Fredoka_700Bold',
  },
});
