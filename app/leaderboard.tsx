import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, FlatList, Platform, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import Pressable from '@/components/AppPressable';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import * as db from '@/lib/db';
import StickmanCoin, { abbreviateCoins } from '@/components/StickmanCoin';

// ─── Types ───
type GameMode = 'coins' | 'classic' | 'survival' | 'arena';
type Difficulty = 'easy' | 'average' | 'hard';

interface LeaderboardEntry {
  id: string;
  username: string;
  value: number;
  rank: number;
}

interface ModeOption {
  key: GameMode;
  label: string;
  icon: string;
  color: string;
  hasDifficulty: boolean;
}

const MODES: ModeOption[] = [
  { key: 'coins', label: 'Coins', icon: 'gold', color: '#FFD700', hasDifficulty: false },
  { key: 'classic', label: 'Classic', icon: 'map-marker-path', color: '#3498DB', hasDifficulty: false },
  { key: 'survival', label: 'Survival', icon: 'sword-cross', color: '#2ECC71', hasDifficulty: true },
  { key: 'arena', label: 'Arena', icon: 'sword-cross', color: '#FF6B6B', hasDifficulty: true },
];

const DIFFICULTIES: { key: Difficulty; label: string; color: string }[] = [
  { key: 'easy', label: 'Easy', color: '#2ECC71' },
  { key: 'average', label: 'Average', color: '#F39C12' },
  { key: 'hard', label: 'Hard', color: '#E74C3C' },
];

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

function getValueLabel(mode: GameMode, value: number): string {
  switch (mode) {
    case 'coins': return abbreviateCoins(value);
    case 'classic': return `Lv.${value}`;
    case 'arena': return `${value}W`;
    default: return `${value}Q`;
  }
}

// ─── Row Component ───
function LeaderboardRow({ entry, rank, isCurrentUser, activeMode }: {
  entry: LeaderboardEntry; rank: number; isCurrentUser: boolean; activeMode: GameMode;
}) {
  const rowStyle = getRowStyle(rank, isCurrentUser);
  const isTop3 = rank <= 3;

  return (
    <Animated.View 
      entering={FadeInDown.delay(Math.min(rank * 30, 600)).springify()}
      layout={Layout.springify()}
    >
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
          {activeMode === 'coins' && <StickmanCoin size={16} animated={false} />}
          <Text style={[styles.valueText, isTop3 && styles.topValueText]}>
            {getValueLabel(activeMode, entry.value)}
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
  const [activeMode, setActiveMode] = useState<GameMode>('coins');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('easy');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const fetchLeaderboard = useCallback(async (mode: GameMode, diff: Difficulty) => {
    try {
      let data: LeaderboardEntry[] = [];

      switch (mode) {
        case 'coins': {
          const coins = await db.getLeaderboard(50, 0);
          data = coins.map(e => ({ id: e.id, username: e.username, value: e.coins, rank: e.rank }));
          break;
        }
        case 'classic': {
          data = await db.getClassicLeaderboard(50, 0);
          break;
        }
        case 'survival': {
          data = await db.getSurvivalLeaderboard(diff, 50);
          break;
        }
        case 'arena': {
          data = await db.getArenaLeaderboard(diff, 50);
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
    fetchLeaderboard(activeMode, activeDifficulty);
  }, [activeMode, activeDifficulty, fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard(activeMode, activeDifficulty);
  }, [activeMode, activeDifficulty, fetchLeaderboard]);

  const currentUserEntry = user ? leaderboard.find(e => e.id === user.id) : null;
  const currentUserRank = currentUserEntry?.rank || 0;
  
  const activeModeInfo = useMemo(() => MODES.find(m => m.key === activeMode)!, [activeMode]);
  const activeDiffInfo = useMemo(() => DIFFICULTIES.find(d => d.key === activeDifficulty)!, [activeDifficulty]);

  const mainColor = activeModeInfo.hasDifficulty ? activeDiffInfo.color : activeModeInfo.color;

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

          {/* Mode Selector (Top Tabs) */}
          <View style={styles.modeTabs}>
            {MODES.map(mode => (
              <Pressable
                key={mode.key}
                style={[
                  styles.modeTab,
                  activeMode === mode.key && [styles.activeModeTab, { borderColor: mode.color }],
                ]}
                onPress={() => setActiveMode(mode.key)}
              >
                <MaterialCommunityIcons
                  name={mode.icon as any}
                  size={16}
                  color={activeMode === mode.key ? mode.color : 'rgba(255,255,255,0.5)'}
                />
                <Text style={[
                  styles.modeTabLabel,
                  activeMode === mode.key && { color: mode.color, fontFamily: 'Fredoka_700Bold' },
                ]}>{mode.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Difficulty Selector (Sub Tabs) */}
          {activeModeInfo.hasDifficulty && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.diffSelectorContainer}>
              <View style={styles.diffSelector}>
                {DIFFICULTIES.map(diff => (
                  <Pressable
                    key={diff.key}
                    style={[
                      styles.diffTab,
                      activeDifficulty === diff.key && { backgroundColor: diff.color },
                    ]}
                    onPress={() => setActiveDifficulty(diff.key)}
                  >
                    <Text style={[
                      styles.diffTabLabel,
                      activeDifficulty === diff.key && styles.activeDiffTabLabel
                    ]}>
                      {diff.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Current user rank badge */}
          {!isGuest && user && currentUserRank > 0 && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.myRankBadge}>
              <Text style={styles.myRankLabel}>Your Rank</Text>
              <Text style={[styles.myRankNumber, { color: mainColor }]}>#{currentUserRank}</Text>
              <Text style={styles.myRankValue}>{getValueLabel(activeMode, currentUserEntry!.value)}</Text>
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
              <ActivityIndicator size="large" color={mainColor} />
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
                  activeMode={activeMode}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={mainColor} />
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  trophyGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  modeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeModeTab: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  modeTabLabel: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.7)',
  },
  diffSelectorContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  diffSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 4,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  diffTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  diffTabLabel: {
    fontSize: 13,
    fontFamily: 'Fredoka_600SemiBold',
    color: 'rgba(255,255,255,0.6)',
  },
  activeDiffTabLabel: {
    color: '#fff',
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
    marginTop: 4,
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
