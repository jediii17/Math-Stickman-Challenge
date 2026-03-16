import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayerContext } from '@/contexts/MultiplayerProvider';
import type { OnlinePlayer } from '@/hooks/useMultiplayer';

type Difficulty = 'easy' | 'average' | 'hard';

export default function LobbyScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const {
    onlinePlayers,
    currentRoom,
    isInLobby,
    sendInvite,
    leaveRoom,
  } = useMultiplayerContext();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [invitedPlayerId, setInvitedPlayerId] = useState<string | null>(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  // React to room status changes for local UI state only
  // (navigation and startMatch are handled by MultiplayerProvider)
  useEffect(() => {
    if (currentRoom?.status === 'waiting') {
      setWaitingForResponse(false);
    }
    if (currentRoom?.status === 'cancelled') {
      setWaitingForResponse(false);
      setInvitedPlayerId(null);
    }
  }, [currentRoom?.status]);

  const handleInvite = useCallback(async (player: OnlinePlayer) => {
    setInvitedPlayerId(player.id);
    setWaitingForResponse(true);
    const roomId = await sendInvite(player.id, selectedDifficulty);
    if (!roomId) {
      setWaitingForResponse(false);
      setInvitedPlayerId(null);
    }

    // Auto-cancel after 15s if no response
    setTimeout(() => {
      setWaitingForResponse(false);
      setInvitedPlayerId(null);
    }, 16000);
  }, [selectedDifficulty, sendInvite]);


  const getDiffColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return Colors.primary;
      case 'average': return Colors.secondary;
      case 'hard': return Colors.error;
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (isGuest) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.guestMessage}>
          <Ionicons name="lock-closed" size={48} color={Colors.textLight} />
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestSubtitle}>
            You need to be logged in to play 1v1 matches.
          </Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderPlayer = ({ item, index }: { item: OnlinePlayer; index: number }) => {
    const isInvited = invitedPlayerId === item.id;
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
        <View style={styles.playerCard}>
          <View style={styles.playerInfo}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.playerName}>{item.username}</Text>
              <View style={styles.onlineDot}>
                <View style={[styles.dot, item.status === 'playing' && { backgroundColor: Colors.secondary }]} />
                <Text style={[styles.onlineText, item.status === 'playing' && { color: Colors.secondary }]}>
                  {item.status === 'playing' ? 'In Match' : 'Online'}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            style={[
              styles.inviteBtn,
              (isInvited || item.status === 'playing') && styles.inviteBtnDisabled,
            ]}
            onPress={() => handleInvite(item)}
            disabled={isInvited || waitingForResponse || item.status === 'playing'}
          >
            {isInvited ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="game-controller" size={16} color="#fff" />
                <Text style={styles.inviteBtnText}>Invite</Text>
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>1v1 Arena</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Difficulty Selector */}
      <View style={styles.diffSection}>
        <Text style={styles.diffLabel}>Select Difficulty:</Text>
        <View style={styles.diffRow}>
          {(['easy', 'average', 'hard'] as Difficulty[]).map((diff) => (
            <Pressable
              key={diff}
              style={[
                styles.diffChip,
                {
                  backgroundColor:
                    selectedDifficulty === diff
                      ? getDiffColor(diff)
                      : '#f0f0f0',
                },
              ]}
              onPress={() => setSelectedDifficulty(diff)}
            >
              <Text
                style={[
                  styles.diffChipText,
                  {
                    color: selectedDifficulty === diff ? '#fff' : Colors.textLight,
                  },
                ]}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Play vs Computer */}
      <Pressable
        style={styles.computerBtn}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push({
            pathname: '/multiplayer-game',
            params: {
              roomId: '0',
              difficulty: selectedDifficulty,
              isHost: 'true',
              isComputer: 'true',
            },
          });
        }}
      >
        <LinearGradient
          colors={['#6C5CE7', '#a29bfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.computerBtnGradient}
        >
          <Ionicons name="hardware-chip" size={20} color="#fff" />
          <Text style={styles.computerBtnText}>Play vs Computer</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </Pressable>
      {/* Online Players */}
      <View style={styles.playersSection}>
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>Online Players</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{onlinePlayers.length}</Text>
          </View>
        </View>

        {!isInLobby ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Connecting to lobby...</Text>
          </View>
        ) : onlinePlayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Players Online</Text>
            <Text style={styles.emptySubtitle}>
              Wait for other players to join the lobby
            </Text>
          </View>
        ) : (
          <FlatList
            data={onlinePlayers}
            renderItem={renderPlayer}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Waiting overlay */}
      {waitingForResponse && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.waitingOverlay}
        >
          <View style={styles.waitingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.waitingText}>Waiting for response...</Text>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                leaveRoom();
                setWaitingForResponse(false);
                setInvitedPlayerId(null);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  diffSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  diffLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  diffChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playersSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  onlineDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  onlineText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  inviteBtnDisabled: {
    backgroundColor: Colors.textLight,
  },
  inviteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.error,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  guestMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  computerBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  computerBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  computerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
});
