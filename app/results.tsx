import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import Pressable from '@/components/AppPressable';
import { BlurView } from 'expo-blur';
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
import { useAudioPlayer } from 'expo-audio';



interface ResultItem {
  display: string;
  answer: number;
  userAnswer: number | string | null;
  correct: boolean;
  timeUp: boolean;
  topic: string;
  stringAnswer?: string;
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

function ResultRow({ item, onPress }: { item: ResultItem; onPress?: () => void }) {
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        rowStyles.row, 
        item.correct ? rowStyles.correct : rowStyles.wrong,
        pressed && { opacity: 0.7 }
      ]}
    >
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
            = {item.stringAnswer || item.answer}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} style={{ opacity: 0.5 }} />
      </View>
    </Pressable>
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
  const [selectedProblem, setSelectedProblem] = useState<ResultItem | null>(null);

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
  const gameOverPlayer = useAudioPlayer(require('@/assets/sounds/game_over.mp3'));
  const levelCompletePlayer = useAudioPlayer(require('@/assets/sounds/level_complete.mp3'));

  const safePlay = React.useCallback(
    (player: any, volume: number = 1.0) => {
      try {
        if (player) {
          player.volume = volume;
          player.seekTo(0);
          player.play();
        }
      } catch (err) {
        console.warn('Audio play failed in results:', err);
      }
    },
    []
  );

  const getStepByStepSolution = (prob: any) => {
    if (!prob) return '';
    try {
      const { operation, num1, num2, answer, stringAnswer, display, topic } = prob;

      // Helper: right-align numbers for vertical arithmetic
      const pad = (n: number | string, width: number) => String(n).padStart(width, ' ');

      // Helper: GCD for fraction simplification
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

      // Helper: LCM
      const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

      switch (operation) {
        case 'add': {
          const w = Math.max(String(num1).length, String(num2).length, String(answer).length);
          const line = '─'.repeat(w + 2);

          // Column-by-column working
          const s1 = String(num1).padStart(w, '0');
          const s2 = String(num2).padStart(w, '0');
          const steps: string[] = [];
          let carry = 0;
          for (let i = w - 1; i >= 0; i--) {
            const d1 = parseInt(s1[i]);
            const d2 = parseInt(s2[i]);
            const sum = d1 + d2 + carry;
            const digit = sum % 10;
            const newCarry = Math.floor(sum / 10);
            let stepText = `  ${d1} + ${d2}`;
            if (carry > 0) stepText += ` + ${carry} (carried)`;
            stepText += ` = ${sum}`;
            if (newCarry > 0) stepText += `  ✏️ write ${digit}, carry ${newCarry}`;
            else stepText += `  ✏️ write ${digit}`;
            steps.push(stepText);
            carry = newCarry;
          }

          return [
            `📝 Step 1: Line up the numbers`,
            ``,
            `    ${pad(num1, w)}`,
            `  + ${pad(num2, w)}`,
            `  ${line}`,
            ``,
            `📝 Step 2: Add each column from right to left`,
            ``,
            ...steps,
            ``,
            `📝 Step 3: Write the answer! 🎉`,
            ``,
            `    ${pad(num1, w)}`,
            `  + ${pad(num2, w)}`,
            `  ${line}`,
            `    ${pad(answer, w)}  ✓`,
          ].join('\n');
        }

        case 'subtract': {
          const w = Math.max(String(num1).length, String(num2).length, String(answer).length);
          const line = '─'.repeat(w + 2);

          const s1 = String(num1).padStart(w, '0');
          const s2 = String(num2).padStart(w, '0');
          const steps: string[] = [];
          const digits1 = s1.split('').map(Number);
          let borrowed = Array(w).fill(0);

          for (let i = w - 1; i >= 0; i--) {
            let d1 = digits1[i] - borrowed[i];
            const d2 = parseInt(s2[i]);
            if (d1 < d2 && i > 0) {
              steps.push(`  ${d1} < ${d2}, so borrow 1 from the left`);
              d1 += 10;
              borrowed[i - 1] = 1;
              steps.push(`  ${d1} − ${d2} = ${d1 - d2}  ✏️ write ${d1 - d2}`);
            } else {
              steps.push(`  ${d1} − ${d2} = ${d1 - d2}  ✏️ write ${d1 - d2}`);
            }
          }

          return [
            `📝 Step 1: Put the bigger number on top`,
            ``,
            `    ${pad(num1, w)}`,
            `  − ${pad(num2, w)}`,
            `  ${line}`,
            ``,
            `📝 Step 2: Subtract each column from right to left`,
            ``,
            ...steps,
            ``,
            `📝 Step 3: Write the answer! 🎉`,
            ``,
            `    ${pad(num1, w)}`,
            `  − ${pad(num2, w)}`,
            `  ${line}`,
            `    ${pad(answer, w)}  ✓`,
          ].join('\n');
        }

        case 'multiply': {
          const n2str = String(num2);
          const w = Math.max(String(num1).length, n2str.length, String(answer).length);
          const line = '─'.repeat(w + 2);

          if (n2str.length === 1) {
            const steps: string[] = [];
            const s1 = String(num1);
            let carry = 0;
            for (let i = s1.length - 1; i >= 0; i--) {
              const d = parseInt(s1[i]);
              const product = d * num2 + carry;
              const digit = product % 10;
              const newCarry = Math.floor(product / 10);
              let stepText = `  ${d} × ${num2}`;
              if (carry > 0) stepText += ` + ${carry} (carried)`;
              stepText += ` = ${product}`;
              if (newCarry > 0) stepText += `  ✏️ write ${digit}, carry ${newCarry}`;
              else stepText += `  ✏️ write ${digit}`;
              steps.push(stepText);
              carry = newCarry;
            }

            return [
              `📝 Step 1: Set up the multiplication`,
              ``,
              `    ${pad(num1, w)}`,
              `  × ${pad(num2, w)}`,
              `  ${line}`,
              ``,
              `📝 Step 2: Multiply each digit from right to left`,
              ``,
              ...steps,
              ``,
              `📝 Step 3: Write the answer! 🎉`,
              ``,
              `    ${pad(num1, w)}`,
              `  × ${pad(num2, w)}`,
              `  ${line}`,
              `    ${pad(answer, w)}  ✓`,
            ].join('\n');
          }

          // Multi-digit
          const partials: string[] = [];
          const partialExplains: string[] = [];
          for (let i = 0; i < n2str.length; i++) {
            const digit = parseInt(n2str[n2str.length - 1 - i]);
            const partial = num1 * digit * Math.pow(10, i);
            partials.push(partial.toString());
            const zeros = i > 0 ? ` (add ${i} zero${i > 1 ? 's' : ''})` : '';
            partialExplains.push(`  ${num1} × ${digit}${zeros} = ${partial}`);
          }

          const pw = Math.max(w, ...partials.map(p => p.length));
          const pline = '─'.repeat(pw + 2);
          const lines = [
            `📝 Step 1: Set up the multiplication`,
            ``,
            `    ${pad(num1, pw)}`,
            `  × ${pad(num2, pw)}`,
            `  ${pline}`,
            ``,
            `📝 Step 2: Multiply by each digit`,
            ``,
            ...partialExplains,
            ``,
            `📝 Step 3: Add the partial results! 🎉`,
            ``,
          ];
          partials.forEach((p, i) => {
            lines.push(`  ${i === 0 ? ' ' : '+'} ${pad(p, pw)}`);
          });
          lines.push(`  ${pline}`);
          lines.push(`    ${pad(answer, pw)}  ✓`);
          return lines.join('\n');
        }

        case 'divide': {
          const quotient = answer;
          const dividendStr = String(num1);
          let remainder = 0;
          const workLines: string[] = [];

          for (let i = 0; i < dividendStr.length; i++) {
            const current = remainder * 10 + parseInt(dividendStr[i]);
            const q = Math.floor(current / num2);
            const product = q * num2;
            remainder = current - product;
            const bringDown = remainder > 0 && i < dividendStr.length - 1 
              ? `  👉 leftover ${remainder}, bring down next digit` 
              : '';
            workLines.push(`  ${num2} goes into ${current} → ${q} time${q !== 1 ? 's' : ''}  (${num2} × ${q} = ${product})${bringDown}`);
          }

          return [
            `📝 Step 1: How many times does ${num2} fit?`,
            ``,
            `  ${num1} ÷ ${num2}`,
            ``,
            `📝 Step 2: Divide digit by digit`,
            ``,
            ...workLines,
            ``,
            `📝 Step 3: Write the answer! 🎉`,
            ``,
            `  ${num1} ÷ ${num2} = ${quotient}  ✓`,
          ].join('\n');
        }

        case 'fraction_add': {
          if (!display) return `= ${stringAnswer || answer}`;
          const parts = display.split(' + ');
          if (parts.length !== 2) return `${display} = ${stringAnswer || answer}`;

          const [aFrac, bFrac] = parts;
          const [aN, aD] = aFrac.split('/').map(Number);
          const [bN, bD] = bFrac.split('/').map(Number);
          const finalAns = stringAnswer || answer;

          if (aD === bD) {
            const sumN = aN + bN;
            const g = gcd(Math.abs(sumN), aD);
            const simpN = sumN / g;
            const simpD = aD / g;
            const lines = [
              `📝 Step 1: Check the bottom numbers`,
              ``,
              `  ${aFrac} + ${bFrac}`,
              `  Both have ${aD} on the bottom — great! 🎉`,
              ``,
              `📝 Step 2: Add the top numbers`,
              ``,
              `  ${aN} + ${bN} = ${sumN}`,
              `  Keep the bottom number: ${aD}`,
              ``,
              `  = ${sumN}/${aD}`,
            ];
            if (g > 1) {
              lines.push(``);
              lines.push(`📝 Step 3: Simplify! Both ${sumN} and ${aD} can be divided by ${g}`);
              lines.push(`  = ${simpN}/${simpD}`);
            }
            lines.push(``);
            lines.push(`  Answer: ${finalAns}  ✓`);
            return lines.join('\n');
          } else {
            const commonD = lcm(aD, bD);
            const newAN = aN * (commonD / aD);
            const newBN = bN * (commonD / bD);
            const sumN = newAN + newBN;
            const g = gcd(Math.abs(sumN), commonD);
            const simpN = sumN / g;
            const simpD = commonD / g;
            const lines = [
              `📝 Step 1: The bottom numbers are different!`,
              ``,
              `  ${aFrac} + ${bFrac}`,
              `  ${aD} and ${bD} are not the same 🤔`,
              ``,
              `📝 Step 2: Make the bottoms the same (find LCD)`,
              ``,
              `  LCD of ${aD} and ${bD} = ${commonD}`,
              ``,
              `  ${aN}/${aD} → multiply top and bottom by ${commonD / aD}`,
              `       = ${newAN}/${commonD}`,
              `  ${bN}/${bD} → multiply top and bottom by ${commonD / bD}`,
              `       = ${newBN}/${commonD}`,
              ``,
              `📝 Step 3: Now add the top numbers! 🎉`,
              ``,
              `  ${newAN}/${commonD} + ${newBN}/${commonD}`,
              `  = ${sumN}/${commonD}`,
            ];
            if (g > 1) {
              lines.push(``);
              lines.push(`📝 Step 4: Simplify! Divide both by ${g}`);
              lines.push(`  = ${simpN}/${simpD}`);
            }
            lines.push(``);
            lines.push(`  Answer: ${finalAns}  ✓`);
            return lines.join('\n');
          }
        }

        case 'fraction_subtract': {
          if (!display) return `= ${stringAnswer || answer}`;
          const parts = display.split(' - ');
          if (parts.length !== 2) return `${display} = ${stringAnswer || answer}`;

          const [aFrac, bFrac] = parts;
          const [aN, aD] = aFrac.split('/').map(Number);
          const [bN, bD] = bFrac.split('/').map(Number);
          const finalAns = stringAnswer || answer;

          if (aD === bD) {
            const diffN = aN - bN;
            const g = gcd(Math.abs(diffN), aD);
            const simpN = diffN / g;
            const simpD = aD / g;
            const lines = [
              `📝 Step 1: Check the bottom numbers`,
              ``,
              `  ${aFrac} − ${bFrac}`,
              `  Both have ${aD} on the bottom — great! 🎉`,
              ``,
              `📝 Step 2: Subtract the top numbers`,
              ``,
              `  ${aN} − ${bN} = ${diffN}`,
              `  Keep the bottom number: ${aD}`,
              ``,
              `  = ${diffN}/${aD}`,
            ];
            if (g > 1) {
              lines.push(``);
              lines.push(`📝 Step 3: Simplify! Both ${diffN} and ${aD} can be divided by ${g}`);
              lines.push(`  = ${simpN}/${simpD}`);
            }
            lines.push(``);
            lines.push(`  Answer: ${finalAns}  ✓`);
            return lines.join('\n');
          } else {
            const commonD = lcm(aD, bD);
            const newAN = aN * (commonD / aD);
            const newBN = bN * (commonD / bD);
            const diffN = newAN - newBN;
            const g = gcd(Math.abs(diffN), commonD);
            const simpN = diffN / g;
            const simpD = commonD / g;
            const lines = [
              `📝 Step 1: The bottom numbers are different!`,
              ``,
              `  ${aFrac} − ${bFrac}`,
              `  ${aD} and ${bD} are not the same 🤔`,
              ``,
              `📝 Step 2: Make the bottoms the same (find LCD)`,
              ``,
              `  LCD of ${aD} and ${bD} = ${commonD}`,
              ``,
              `  ${aN}/${aD} → multiply top and bottom by ${commonD / aD}`,
              `       = ${newAN}/${commonD}`,
              `  ${bN}/${bD} → multiply top and bottom by ${commonD / bD}`,
              `       = ${newBN}/${commonD}`,
              ``,
              `📝 Step 3: Now subtract the top numbers! 🎉`,
              ``,
              `  ${newAN}/${commonD} − ${newBN}/${commonD}`,
              `  = ${diffN}/${commonD}`,
            ];
            if (g > 1) {
              lines.push(``);
              lines.push(`📝 Step 4: Simplify! Divide both by ${g}`);
              lines.push(`  = ${simpN}/${simpD}`);
            }
            lines.push(``);
            lines.push(`  Answer: ${finalAns}  ✓`);
            return lines.join('\n');
          }
        }

        default:
          return `= ${stringAnswer || answer}`;
      }
    } catch (e) {
      return `= ${prob.stringAnswer || prob.answer}`;
    }
  };

  const renderSolutionModal = () => {
    if (!selectedProblem) return null;

    const prob = selectedProblem.problem;
    const explanation = prob 
      ? getStepByStepSolution(prob) 
      : `The correct answer is ${selectedProblem.stringAnswer || selectedProblem.answer}. (Detailed problem data is missing)`;

    return (
      <Modal
        visible={!!selectedProblem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProblem(null)}
      >
        <View style={modalStyles.overlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
          <Animated.View entering={FadeInUp.duration(300).springify()} style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Solution</Text>
              <Pressable onPress={() => setSelectedProblem(null)} style={modalStyles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </Pressable>
            </View>
            <ScrollView style={modalStyles.body} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={modalStyles.problemDisplay}>{selectedProblem.display}</Text>
              <Text style={modalStyles.explanation}>{explanation}</Text>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    const saveResults = async () => {
      const { addCoins, updateHighScore, advanceClassicLevel, advanceClassicLevelForUser } = useGameState.getState();
      addCoins(earnedCoins);
      if (mode === 'survival') {
        updateHighScore(difficulty, score);
      }

      // Advance classic level on completion — only if the player finished their current frontier level
      const { classicLevel: currentClassicLevel } = useGameState.getState();
      if (isLevelComplete && level === currentClassicLevel) {
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
          mode,
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

    const shouldPlayGameOverSound = isGameOver || (mode === 'classic' && !isLevelComplete);
    if (shouldPlayGameOverSound) {
      safePlay(gameOverPlayer, 0.5);
    } else if (isLevelComplete) {
      safePlay(levelCompletePlayer, 0.5);
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
        router.replace({ pathname: '/classic-map', params: { justFinished: 'true' } });
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
      router.replace({ pathname: '/classic-map', params: isLevelComplete ? { justFinished: 'true' } : {} });
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
        <Text style={styles.listHint}>👆 Tap any question to see how to solve it!</Text>
        <FlatList
          data={resultItems}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ResultRow item={item} onPress={() => setSelectedProblem(item)} />}
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
      {renderSolutionModal()}
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
    marginBottom: 2,
  },
  listHint: {
    fontSize: 12,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 24,
  },
  problemDisplay: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  explanation: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.text,
    lineHeight: 28,
    textAlign: 'left',
  }
});
