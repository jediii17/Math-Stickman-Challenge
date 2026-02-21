import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import Stickman from '@/components/Stickman';
import NumberPad from '@/components/NumberPad';
import Timer from '@/components/Timer';
import ScribbleArea from '@/components/ScribbleArea';
import Snowflakes from '@/components/Snowflakes';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import AdBanner from '@/components/AdBanner';
import {
  generateProblem,
  getTimeLimit,
  getTotalQuestions,
  type Difficulty,
  type MathProblem,
} from '@/lib/math-engine';

interface GameResult {
  problem: MathProblem;
  userAnswer: number | null;
  correct: boolean;
  timeUp: boolean;
}

export default function GameScreen() {
  const { difficulty = 'easy' } = useLocalSearchParams<{ difficulty: Difficulty }>();
  const insets = useSafeAreaInsets();

  const diff = (difficulty as Difficulty) || 'easy';
  const timeLimit = getTimeLimit(diff);
  const totalQ = getTotalQuestions(diff);

  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateProblem(diff));
  const [userInput, setUserInput] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [scribbleMode, setScribbleMode] = useState(false);
  const [preGameCountdown, setPreGameCountdown] = useState<number | 'GO' | null>(3);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [addedTimeAnim, setAddedTimeAnim] = useState(0); // Trigger for +30s animation

  const isTimerPausedRef = useRef(false);

  const { powerUps, usePowerUp, usePowerUpForUser } = useGameState();
  const { user, isGuest } = useAuth();

  const pingPlayer = useAudioPlayer(require('@/assets/sounds/ping.wav'));
  const goPlayer = useAudioPlayer(require('@/assets/sounds/go.wav'));
  const tickPlayer = useAudioPlayer(require('@/assets/sounds/tick.wav'));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const feedbackScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const problemScale = useSharedValue(1);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isTimerPausedRef.current) {
        setFreezeTimeLeft((prev) => {
          if (prev <= 1) {
            isTimerPausedRef.current = false;
            setIsTimerPaused(false);
            return 0;
          }
          return prev - 1;
        });
        return; // Skip main timer decrement
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (preGameCountdown === null) return;

    if (preGameCountdown === 'GO') {
        if (goPlayer) {
          goPlayer.seekTo(0);
          goPlayer.play();
        }
        const t = setTimeout(() => {
            setPreGameCountdown(null);
            startTimer();
        }, 800);
        return () => clearTimeout(t);
    }

    if (typeof preGameCountdown === 'number' && preGameCountdown > 0) {
        if (pingPlayer) {
          pingPlayer.seekTo(0);
          pingPlayer.play();
        }
        const t = setTimeout(() => {
            setPreGameCountdown(preGameCountdown - 1 === 0 ? 'GO' : preGameCountdown - 1);
        }, 1000);
        return () => clearTimeout(t);
    }
  }, [preGameCountdown, pingPlayer, goPlayer]);

  useEffect(() => {
    if (preGameCountdown === null && timeLeft <= 5 && timeLeft > 0 && !gameOver && !isTransitioning) {
        if (tickPlayer) {
          tickPlayer.seekTo(0);
          tickPlayer.play();
        }
        if (Platform.OS !== 'web') {
           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }
  }, [timeLeft, preGameCountdown, gameOver, isTransitioning, tickPlayer]);

  useEffect(() => {
    if (timeLeft === 0 && !isTransitioning && !gameOver && preGameCountdown === null && !isTimerPausedRef.current) {
      handleTimeout();
    }
  }, [timeLeft, isTransitioning, gameOver, preGameCountdown]);

  const clearPowderEffect = () => {
    isTimerPausedRef.current = false;
    setIsTimerPaused(false);
    setFreezeTimeLeft(0);
  };

  const handleTimeout = () => {
    stopTimer();
    setIsTransitioning(true);
    const newWrong = wrongCount + 1;
    setWrongCount(newWrong);
    setFeedback('timeout');

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSequence(
      withSpring(1.2),
      withSpring(1),
    );

    const result: GameResult = {
      problem: currentProblem,
      userAnswer: null,
      correct: false,
      timeUp: true,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (newWrong >= 5) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, score, newWrong);
      }, 2000);
      return;
    }

    setTimeout(() => nextQuestion(newResults, score, newWrong), 1500);
  };

  const handleSubmit = () => {
    if (!userInput || isTransitioning || gameOver || preGameCountdown !== null) return;
    stopTimer();
    setIsTransitioning(true);

    const answer = parseInt(userInput, 10);
    const isCorrect = answer === currentProblem.answer;

    let newScore = score;
    let newWrong = wrongCount;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setFeedback('correct');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setFeedback('wrong');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSequence(
      withSpring(1.2),
      withSpring(1),
    );

    const result: GameResult = {
      problem: currentProblem,
      userAnswer: answer,
      correct: isCorrect,
      timeUp: false,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (newWrong >= 5) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, newScore, newWrong);
      }, 2000);
      return;
    }

    if (questionNum >= totalQ) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, newScore, newWrong);
      }, 1500);
      return;
    }

    setTimeout(() => nextQuestion(newResults, newScore, newWrong), 1200);
  };

  const nextQuestion = (currentResults: GameResult[], currentScore: number, currentWrong: number) => {
    const newProblem = generateProblem(diff);
    setCurrentProblem(newProblem);
    setUserInput('');
    setQuestionNum((prev) => prev + 1);
    setTimeLeft(timeLimit);
    setFeedback(null);
    setIsTransitioning(false);
    clearPowderEffect();

    feedbackOpacity.value = 0;

    problemScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1),
    );

    startTimer();
  };

  const navigateToResults = (finalResults: GameResult[], finalScore: number, finalWrong: number) => {
    router.replace({
      pathname: '/results',
      params: {
        score: finalScore.toString(),
        total: finalResults.length.toString(),
        wrong: finalWrong.toString(),
        difficulty: diff,
        results: JSON.stringify(finalResults.map(r => ({
          display: r.problem.display,
          answer: r.problem.answer,
          userAnswer: r.userAnswer,
          correct: r.correct,
          timeUp: r.timeUp,
          topic: r.problem.topic,
        }))),
      },
    });
  };

  const handleNumberPress = (value: string) => {
    if (isTransitioning || gameOver || preGameCountdown !== null) return;
    if (userInput.length < 5) {
      setUserInput((prev) => prev + value);
    }
  };

  const handleDelete = () => {
    if (isTransitioning || gameOver || preGameCountdown !== null) return;
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleUsePotion = async () => {
    if (wrongCount > 0) {
      let used = false;
      if (!isGuest && user) {
        used = await usePowerUpForUser(user.id, 'potion');
      } else {
        used = usePowerUp('potion');
      }

      if (used) {
        setWrongCount(prev => prev - 1);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleUseDust = async () => {
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'dust');
    } else {
      used = usePowerUp('dust');
    }

    if (used) {
      setTimeLeft(prev => prev + 30);
      setAddedTimeAnim(prev => prev + 1); // Trigger animation re-render
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUsePowder = async () => {
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'powder');
    } else {
      used = usePowerUp('powder');
    }

    if (used) {
      isTimerPausedRef.current = true;
      setIsTimerPaused(true);
      setFreezeTimeLeft(30);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUseFirefly = async () => {
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'firefly');
    } else {
      used = usePowerUp('firefly');
    }

    if (used) {
      const ansStr = currentProblem.answer.toString();
      const currentLen = userInput.length;
      if (currentLen < ansStr.length) {
        setUserInput(prev => prev + ansStr[currentLen]);
      }
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const feedbackAnimStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const problemAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: problemScale.value }],
  }));

  const getFeedbackText = () => {
    if (feedback === 'correct') return 'Correct!';
    if (feedback === 'wrong') return `Wrong! Answer: ${currentProblem.answer}`;
    if (feedback === 'timeout') return `Time's up! Answer: ${currentProblem.answer}`;
    return '';
  };

  const getFeedbackColor = () => {
    if (feedback === 'correct') return Colors.primary;
    return Colors.error;
  };

  const getDiffLabel = () => {
    switch (diff) {
      case 'easy': return 'Easy';
      case 'average': return 'Average';
      case 'difficult': return 'Difficult';
    }
  };

  const getDiffColor = () => {
    switch (diff) {
      case 'easy': return Colors.primary;
      case 'average': return Colors.secondary;
      case 'difficult': return Colors.tertiary;
    }
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding + 8 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.topInfo}>
          <View style={[styles.badge, { backgroundColor: getDiffColor() }]}>
            <Text style={[styles.badgeText, diff === 'difficult' && { color: Colors.text }]}>{getDiffLabel()}</Text>
          </View>
          <Text style={styles.questionCount}>
            Q{questionNum}/{totalQ}
          </Text>
        </View>
        <View style={{ position: 'relative' }}>
          <Timer timeLeft={timeLeft} totalTime={timeLimit} isPaused={isTimerPaused} />
          {addedTimeAnim > 0 && (
            <Animated.Text
              key={addedTimeAnim}
              entering={FadeIn.duration(200).withInitialValues({ transform: [{ translateY: 10 }] })}
              exiting={FadeOut.duration(400)}
              style={styles.addedTimeText}
            >
              +30s
            </Animated.Text>
          )}
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
          <Text style={[styles.scoreText, { color: Colors.primary }]}>{score}</Text>
        </View>
        <View style={styles.livesRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < wrongCount ? 'heart-dislike' : 'heart'}
              size={20}
              color={i < wrongCount ? '#ccc' : Colors.tertiary}
            />
          ))}
        </View>
      </View>

      {isTimerPaused && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.freezeBanner}>
          <Ionicons name="snow" size={20} color="#00BCD4" />
          <Text style={styles.freezeBannerText}>Time Frozen: {freezeTimeLeft}s</Text>
        </Animated.View>
      )}

      {isTimerPaused && <Snowflakes />}

      <View style={styles.gameArea}>
        <View style={styles.stickmanArea}>
          <Stickman wrongCount={wrongCount} size={140} />
        </View>

        <Animated.View style={[styles.problemCard, problemAnimStyle]}>
          <Text style={styles.topicLabel}>{currentProblem.topic}</Text>
          <Text style={styles.problemText}>{currentProblem.display} = ?</Text>
          <View style={styles.answerBox}>
            <Text style={styles.answerText}>
              {userInput || '_'}
            </Text>
          </View>
        </Animated.View>

        {feedback && (
          <Animated.View style={[styles.feedbackContainer, feedbackAnimStyle]}>
            <View style={[styles.feedbackBadge, { backgroundColor: getFeedbackColor() }]}>
              <Ionicons
                name={feedback === 'correct' ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color="#fff"
              />
              <Text style={styles.feedbackText}>{getFeedbackText()}</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {scribbleMode ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
          <ScribbleArea onClose={() => setScribbleMode(false)} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
          <View style={styles.toggleRow}>
            <Pressable
              style={({ pressed }) => [styles.scribbleToggle, pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] }]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setScribbleMode(true);
              }}
            >
              <Ionicons name="pencil" size={18} color={Colors.textWhite} />
            </Pressable>
          </View>

          {(powerUps.potion > 0 || powerUps.dust > 0 || powerUps.powder > 0 || powerUps.firefly > 0) && (
            <View style={styles.powerUpRow}>
              {powerUps.potion > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#E91E63'}]}
                  onPress={handleUsePotion}
                  disabled={wrongCount === 0 || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.potion}</Text></View>
                  <Ionicons name="flask" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.dust > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#9C27B0'}]}
                  onPress={handleUseDust}
                  disabled={isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.dust}</Text></View>
                  <Ionicons name="hourglass" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.powder > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#00BCD4'}]}
                  onPress={handleUsePowder}
                  disabled={isTimerPaused || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.powder}</Text></View>
                  <Ionicons name="snow" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.firefly > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#FFC107'}]}
                  onPress={handleUseFirefly}
                  disabled={userInput.length >= currentProblem.answer.toString().length || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.firefly}</Text></View>
                  <Ionicons name="bulb" size={24} color="#fff" />
                </Pressable>
              )}
            </View>
          )}

          <NumberPad
            onPress={handleNumberPress}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            disabled={isTransitioning || gameOver || preGameCountdown !== null}
          />
        </Animated.View>
      )}

      {preGameCountdown !== null && (
        <View style={[StyleSheet.absoluteFill, styles.countdownOverlay]}>
          <Animated.View
            key={preGameCountdown}
            entering={ZoomIn.duration(300).springify()}
          >
            <Animated.Text style={styles.countdownText}>
              {preGameCountdown}
            </Animated.Text>
          </Animated.View>
        </View>
      )}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topInfo: {
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textWhite,
  },
  questionCount: {
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.text,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
  },
  livesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  stickmanArea: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  problemCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  topicLabel: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  problemText: {
    fontSize: 36,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  answerBox: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 30,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.05)',
  },
  answerText: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    minHeight: 36,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 0,
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textWhite,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  scribbleToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  powerUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  powerUpBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  powerUpQtyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.text,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 10,
  },
  powerUpQtyText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Fredoka_700Bold',
  },
  freezeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    marginHorizontal: 30,
    marginBottom: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    gap: 8,
    zIndex: 10,
  },
  freezeBannerText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: '#00BCD4',
  },
  countdownOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 120,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  addedTimeText: {
    position: 'absolute',
    right: 0,
    bottom: -20,
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.primary,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
});
