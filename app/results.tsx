import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import StickmanCoin from '@/components/StickmanCoin';
import type { Difficulty, GameMode } from '@/lib/math-engine';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import * as dbLib from '@/lib/db';



interface ResultItem {
  display: string;
  answer: number;
  userAnswer: number | string | null;
  correct: boolean;
  timeUp: boolean;
  topic: string;
  coinsEarned?: number;
  multiplier?: number;
  problem?: any;
}

function StarItem({ index, filled }: { index: number; filled: boolean }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 200 + 400,
      withSpring(1, { damping: 8, stiffness: 100 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={48}
        color={filled ? Colors.secondary : '#ddd'}
      />
    </Animated.View>
  );
}

function StarRating({ score, total }: { score: number; total: number }) {
  const percentage = total > 0 ? score / total : 0;
  let stars = 0;
  if (percentage >= 0.9) stars = 3;
  else if (percentage >= 0.75) stars = 2;
  else if (percentage >= 0.4) stars = 1;

  return (
    <View style={starStyles.container}>
      {[0, 1, 2].map((i) => (
        <StarItem key={i} index={i} filled={i < stars} />
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});

function ResultRow({ item }: { item: ResultItem }) {
  return (
    <View style={[rowStyles.row, item.correct ? rowStyles.correct : rowStyles.wrong]}>
      <View style={rowStyles.left}>
        <Ionicons
          name={item.correct ? 'checkmark-circle' : 'close-circle'}
          size={22}
          color={item.correct ? Colors.primary : Colors.error}
        />
        <View>
          <Text style={rowStyles.problem}>{item.display}</Text>
          <Text style={rowStyles.topic}>{item.topic}</Text>
        </View>
      </View>
      <View style={rowStyles.right}>
        {item.timeUp ? (
          <View style={rowStyles.timeUpBadge}>
            <Ionicons name="time-outline" size={14} color={Colors.secondaryDark} />
            <Text style={rowStyles.timeUpText}>Time up</Text>
          </View>
        ) : (
          <Text style={[rowStyles.answerText, !item.correct && rowStyles.wrongAnswer]}>
            {item.userAnswer}
          </Text>
        )}
        <Text style={rowStyles.correctAnswer}>
          = {item.problem?.stringAnswer || item.answer}
        </Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  correct: {
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
  },
  wrong: {
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  problem: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.text,
  },
  topic: {
    fontSize: 11,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  answerText: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.primary,
  },
  wrongAnswer: {
    color: Colors.error,
    textDecorationLine: 'line-through',
  },
  correctAnswer: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
  },
  timeUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeUpText: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.secondaryDark,
  },
});

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    score: string;
    total: string;
    wrong: string;
    difficulty: string;
    mode: string;
    level: string;
    coinsEarned: string;
    results: string;
  }>();

  const insets = useSafeAreaInsets();
  const score = parseInt(params.score || '0', 10);
  const total = parseInt(params.total || '0', 10);
  const wrongCount = parseInt(params.wrong || '0', 10);
  const difficulty = (params.difficulty || 'easy') as Difficulty;
  const mode = (params.mode || 'survival') as GameMode;
  const level = parseInt(params.level || '1', 10);
  const earnedCoins = parseInt(params.coinsEarned || '0', 10);

  let resultItems: ResultItem[] = [];
  try {
    resultItems = JSON.parse(params.results || '[]');
  } catch {
    resultItems = [];
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isGameOver = mode === 'survival' ? wrongCount >= 5 : wrongCount >= 5;
  const isLevelComplete = mode === 'classic' && !isGameOver && percentage >= 75;

  const { user, isGuest, refreshUser } = useAuth();

  useEffect(() => {
    const saveResults = async () => {
      const { addCoins, updateHighScore, advanceClassicLevel, advanceClassicLevelForUser } = useGameState.getState();
      addCoins(earnedCoins);
      updateHighScore(difficulty, score);

      // Advance classic level on completion
      if (isLevelComplete) {
        if (!isGuest && user) {
          await advanceClassicLevelForUser(user.id);
        } else {
          advanceClassicLevel();
        }
      }

      // Persist to SQLite for logged-in users
      if (!isGuest && user) {
        await dbLib.addCoins(user.id, earnedCoins);
        await dbLib.saveGameSession(
          user.id,
          difficulty,
          score,
          total,
          wrongCount,
          earnedCoins,
        );
        await refreshUser();
      }
    };
    saveResults();

    if (Platform.OS !== 'web') {
      if (percentage >= 70) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);
  const getMessage = () => {
    if (isGameOver && mode === 'survival') return `Survived ${score} questions!`;
    if (isLevelComplete) return `Level ${level} Complete!`;
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 75) return 'Great job!';
    if (percentage >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };

  const getGradient = (): [string, string, string] => {
    if (isGameOver && mode !== 'survival') return ['#e74c3c', '#c0392b', '#e74c3c'];
    if (percentage >= 75) return [Colors.primaryDark, Colors.primary, Colors.primaryLight];
    if (percentage >= 50) return [Colors.secondaryDark, Colors.secondary, Colors.secondaryLight];
    return [Colors.tertiaryDark, Colors.tertiary, Colors.tertiaryLight];
  };

  const handlePlayAgain = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (mode === 'classic') {
      if (isLevelComplete) {
        // Go to map
        router.replace('/classic-map');
      } else {
        // Retry current level
        const { classicLevel: currentLevel } = useGameState.getState();
        const { getClassicDifficulty } = require('@/lib/math-engine');
        const newDiff = getClassicDifficulty(currentLevel);
        router.replace({ pathname: '/game', params: { difficulty: newDiff, mode: 'classic', level: currentLevel.toString() } });
      }
    } else {
      router.replace({ pathname: '/game', params: { difficulty, mode: 'survival' } });
    }
  };

  const handleHome = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (mode === 'classic') {
      router.replace('/classic-map');
    } else {
      router.replace('/difficulty');
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (percentage >= 70) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <LinearGradient
        colors={getGradient()}
        style={[styles.headerGradient, { paddingTop: topPadding + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerContent}>
          <MaterialCommunityIcons
            name={!isLevelComplete && mode === 'classic' ? 'emoticon-sad-outline' : percentage >= 75 ? 'trophy' : 'emoticon-happy-outline'}
            size={48}
            color={Colors.textWhite}
          />
          <Text style={styles.messageText}>{getMessage()}</Text>
          <StarRating score={score} total={total} />
          <View style={styles.scoreDisplay}>
            <Text style={styles.bigScore}>{score}</Text>
            <Text style={styles.outOf}>/ {total}</Text>
          </View>
          <Text style={styles.percentText}>{percentage}% correct</Text>
          <View style={styles.coinBadge}>
            <StickmanCoin size={18} />
            <Text style={styles.coinText}>+{earnedCoins.toLocaleString()} coins</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{score}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={24} color={Colors.error} />
          <Text style={styles.statNumber}>{total - score}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="heart-dislike" size={24} color={Colors.tertiary} />
          <Text style={styles.statNumber}>{wrongCount}/5</Text>
          <Text style={styles.statLabel}>Attempts</Text>
        </View>
      </Animated.View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Review Answers</Text>
        <FlatList
          data={resultItems}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ResultRow item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={resultItems.length > 0}
        />
      </View>

      <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.buttonRow}>
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => [
            styles.btn,
            styles.homeBtn,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Ionicons name="home" size={22} color={Colors.text} />
        </Pressable>
        <Pressable
          onPress={handlePlayAgain}
          style={({ pressed }) => [
            styles.btn,
            styles.playAgainBtn,
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
          ]}
        >
          <Ionicons name={mode === 'classic' && isLevelComplete ? 'arrow-forward' : 'refresh'} size={22} color={Colors.textWhite} />
          <Text style={styles.playAgainText}>{mode === 'classic' && isLevelComplete ? 'Next Level' : 'Play Again'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.textWhite,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bigScore: {
    fontSize: 48,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.textWhite,
  },
  outOf: {
    fontSize: 22,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  percentText: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  coinText: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFD700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: -12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.text,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  btn: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  homeBtn: {
    backgroundColor: Colors.card,
    width: 56,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  playAgainBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playAgainText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.textWhite,
  },
});
