import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Timer from '@/components/Timer';
import NumberPad from '@/components/NumberPad';
import Stickman from '@/components/Stickman';
import ScribbleArea from '@/components/ScribbleArea';
import Snowflakes from '@/components/Snowflakes';
import Colors from '@/constants/colors';
import { BlurView } from 'expo-blur';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import AdBanner from '@/components/AdBanner';
import {
  generateProblem,
  generateClassicProblem,
  getTimeLimit,
  calculateQuestionCoins,
  type Difficulty,
  type GameMode,
  type MathProblem,
} from '@/lib/math-engine';
import { useAudioPlayer } from 'expo-audio';

interface GameResult {
  problem: MathProblem;
  userAnswer: number | null;
  correct: boolean;
  timeUp: boolean;
  coinsEarned: number;
  multiplier: number;
}

export default function GameScreen() {
  const params = useLocalSearchParams<{ difficulty: Difficulty; mode?: GameMode; level?: string }>();
  const insets = useSafeAreaInsets();

  const diff = (params.difficulty as Difficulty) || 'easy';
  const mode: GameMode = (params.mode as GameMode) || 'survival';
  const classicLevel = parseInt(params.level || '1', 10);
  const timeLimit = getTimeLimit(diff);
  const totalQ = mode === 'classic' ? 10 : 0; // 0 = infinite for survival

  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() =>
    mode === 'classic' ? generateClassicProblem(classicLevel) : generateProblem(diff)
  );
  const [userInput, setUserInput] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [scribbleMode, setScribbleMode] = useState(false);
  const [preGameCountdown, setPreGameCountdown] = useState<number | 'GO' | null>(3);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [addedTimeAnim, setAddedTimeAnim] = useState(0);
  const [usedPowerUps, setUsedPowerUps] = useState<string[]>([]);
  const [showFireflyHint, setShowFireflyHint] = useState(false);
  const [showPotionHeal, setShowPotionHeal] = useState(false);
  const [lastCoinReward, setLastCoinReward] = useState<{ coins: number; multiplier: number } | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);

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
        return;
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

  // Pre-game countdown
  useEffect(() => {
    if (preGameCountdown === null) return;
    if (preGameCountdown === 'GO') {
      goPlayer.seekTo(0);
      goPlayer.play();
      const t = setTimeout(() => {
        setPreGameCountdown(null);
        startTimer();
      }, 600);
      return () => clearTimeout(t);
    }
    if (preGameCountdown > 0) {
      pingPlayer.seekTo(0);
      pingPlayer.play();
      const t = setTimeout(() => {
        if (preGameCountdown === 1) setPreGameCountdown('GO');
        else setPreGameCountdown(preGameCountdown - 1);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [preGameCountdown]);

  // Timeout handler
  useEffect(() => {
    if (timeLeft === 0 && preGameCountdown === null && !isTransitioning && !gameOver) {
      handleTimeout();
    }
  }, [timeLeft, preGameCountdown, isTransitioning, gameOver]);

  // Tick sound
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && preGameCountdown === null && !gameOver) {
      tickPlayer.seekTo(0);
      tickPlayer.play();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const clearPowderEffect = () => {
    if (isTimerPausedRef.current) {
      isTimerPausedRef.current = false;
      setIsTimerPaused(false);
      setFreezeTimeLeft(0);
    }
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
      coinsEarned: 0,
      multiplier: 0,
    };
    const newResults = [...results, result];
    setResults(newResults);

    // Both modes: game over on 5 wrong
    if (newWrong >= 5) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, score, newWrong, totalCoinsEarned);
      }, 2000);
      return;
    }

    setTimeout(() => nextQuestion(newResults, score, newWrong, totalCoinsEarned), 1500);
  };

  const handleSubmit = () => {
    if (!userInput || isTransitioning || gameOver || preGameCountdown !== null) return;
    stopTimer();
    setIsTransitioning(true);

    const isCorrect = currentProblem.stringAnswer 
      ? userInput === currentProblem.stringAnswer
      : parseInt(userInput, 10) === currentProblem.answer;

    const answerValue = currentProblem.stringAnswer ? 0 : parseInt(userInput, 10); // 0 is placeholder for results log if it's a fraction

    let newScore = score;
    let newWrong = wrongCount;
    let earnedCoins = 0;
    let multiplier = 0;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setFeedback('correct');

      // Calculate per-question coins
      const coinResult = calculateQuestionCoins(diff, timeLimit, timeLeft);
      earnedCoins = coinResult.total;
      multiplier = coinResult.multiplier;
      const newTotalCoins = totalCoinsEarned + earnedCoins;
      setTotalCoinsEarned(newTotalCoins);
      setLastCoinReward({ coins: earnedCoins, multiplier });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setFeedback('wrong');
      setLastCoinReward(null);
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
      userAnswer: currentProblem.stringAnswer ? userInput : parseInt(userInput, 10) as any,
      correct: isCorrect,
      timeUp: false,
      coinsEarned: earnedCoins,
      multiplier,
    };
    const newResults = [...results, result];
    setResults(newResults);
    const newTotalCoins = totalCoinsEarned + earnedCoins;

    // Both modes: game over on 5 wrong
    if (newWrong >= 5) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, newScore, newWrong, newTotalCoins);
      }, 2000);
      return;
    }

    // Classic: level complete
    if (mode === 'classic' && questionNum >= totalQ) {
      setTimeout(() => {
        setGameOver(true);
        navigateToResults(newResults, newScore, newWrong, newTotalCoins);
      }, 1500);
      return;
    }

    setTimeout(() => nextQuestion(newResults, newScore, newWrong, newTotalCoins), 1200);
  };

  const nextQuestion = (currentResults: GameResult[], currentScore: number, currentWrong: number, currentCoins: number) => {
    const newProblem = mode === 'classic' 
      ? generateClassicProblem(classicLevel) 
      : generateProblem(diff);
    setCurrentProblem(newProblem);
    setUserInput('');
    setQuestionNum((prev) => prev + 1);
    setTimeLeft(timeLimit);
    setFeedback(null);
    setIsTransitioning(false);
    setLastCoinReward(null);
    clearPowderEffect();
    setUsedPowerUps([]);

    feedbackOpacity.value = 0;

    problemScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1),
    );

    startTimer();
  };

  const navigateToResults = (finalResults: GameResult[], finalScore: number, finalWrong: number, finalCoins: number) => {
    router.replace({
      pathname: '/results',
      params: {
        score: finalScore.toString(),
        total: finalResults.length.toString(),
        wrong: finalWrong.toString(),
        difficulty: diff,
        mode,
        level: classicLevel.toString(),
        coinsEarned: finalCoins.toString(),
        results: JSON.stringify(finalResults.map(r => ({
          display: r.problem.display,
          answer: r.problem.answer,
          userAnswer: r.userAnswer,
          correct: r.correct,
          timeUp: r.timeUp,
          topic: r.problem.topic,
          coinsEarned: r.coinsEarned,
          multiplier: r.multiplier,
        }))),
      },
    });
  };

  const handleNumberPress = (value: string) => {
    if (isTransitioning || gameOver || preGameCountdown !== null) return;
    
    // Prevent multiple slashes
    if (value === '/' && userInput.includes('/')) return;

    if (userInput.length < 7) {
      setUserInput((prev) => prev + value);
    }
  };

  const handleDelete = () => {
    if (isTransitioning || gameOver || preGameCountdown !== null) return;
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleUsePotion = async () => {
    if (usedPowerUps.includes('potion')) return;
    if (wrongCount > 0) {
      let used = false;
      if (!isGuest && user) {
        used = await usePowerUpForUser(user.id, 'potion');
      } else {
        used = usePowerUp('potion');
      }

      if (used) {
        setUsedPowerUps(prev => [...prev, 'potion']);
        setShowPotionHeal(true);
        setWrongCount(prev => prev - 1);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setTimeout(() => {
          setShowPotionHeal(false);
        }, 1500);
      }
    }
  };

  const handleUseDust = async () => {
    if (usedPowerUps.includes('dust')) return;
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'dust');
    } else {
      used = usePowerUp('dust');
    }

    if (used) {
      setUsedPowerUps(prev => [...prev, 'dust']);
      setTimeLeft(prev => prev + 30);
      setAddedTimeAnim(Date.now());
      setTimeout(() => {
        setAddedTimeAnim(0);
      }, 1500);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUsePowder = async () => {
    if (usedPowerUps.includes('powder')) return;
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'powder');
    } else {
      used = usePowerUp('powder');
    }

    if (used) {
      setUsedPowerUps(prev => [...prev, 'powder']);
      isTimerPausedRef.current = true;
      setIsTimerPaused(true);
      setFreezeTimeLeft(30);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUseFirefly = async () => {
    if (usedPowerUps.includes('firefly')) return;
    let used = false;
    if (!isGuest && user) {
      used = await usePowerUpForUser(user.id, 'firefly');
    } else {
      used = usePowerUp('firefly');
    }

    if (used) {
      setUsedPowerUps(prev => [...prev, 'firefly']);
      setShowFireflyHint(true);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        const ansStr = currentProblem.stringAnswer || currentProblem.answer.toString();
        const currentLen = userInput.length;
        if (currentLen < ansStr.length) {
          setUserInput(prev => prev + ansStr[currentLen]);
        }
        setShowFireflyHint(false);
      }, 1200);
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

  const getMultiplierColor = (m: number) => {
    if (m >= 3) return '#FFD700';
    if (m >= 2) return Colors.primary;
    return Colors.textLight;
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleBackPress = () => {
    isTimerPausedRef.current = true;
    setIsTimerPaused(true);
    setShowQuitModal(true);
  };

  const handleConfirmQuit = () => {
    if (mode === 'classic') {
      router.replace('/classic-map');
    } else {
      router.replace('/difficulty');
    }
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
    isTimerPausedRef.current = false;
    setIsTimerPaused(false);
    // Unfreeze logic relies on freezeTimeLeft, so if not frozen by powder just let it tick normally
    if (freezeTimeLeft <= 0) {
      startTimer();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding + 8 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBackPress} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.topInfo}>
          <View style={styles.topBadgeRow}>
            <View style={[styles.badge, { backgroundColor: getDiffColor() }]}>
              <Text style={[styles.badgeText, diff === 'difficult' && { color: Colors.text }]}>{getDiffLabel()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: mode === 'survival' ? '#E74C3C' : Colors.blue }]}>
              <Text style={styles.badgeText}>{mode === 'survival' ? '☠️' : `Lv.${classicLevel}`}</Text>
            </View>
          </View>
          <Text style={styles.questionCount}>
            {mode === 'survival' ? `Q${questionNum}` : `Q${questionNum}/${totalQ}`}
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

        {/* Coin counter */}
        <View style={styles.coinCounter}>
          <Ionicons name="sparkles" size={14} color="#FFD700" />
          <Text style={styles.coinCounterText}>{totalCoinsEarned}</Text>
          {lastCoinReward && feedback === 'correct' && (
            <Animated.View
              key={questionNum}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(400)}
              style={styles.coinPopup}
            >
              <Text style={[styles.coinPopupText, { color: getMultiplierColor(lastCoinReward.multiplier) }]}>
                +{lastCoinReward.coins} ({lastCoinReward.multiplier}×)
              </Text>
            </Animated.View>
          )}
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
        {!scribbleMode && (
          <View style={styles.stickmanArea}>
            <Stickman wrongCount={wrongCount} size={140} />
          </View>
        )}

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
            {/* Coin reward badge */}
            {feedback === 'correct' && lastCoinReward && (
              <Animated.View
                key={`coin-${questionNum}`}
                entering={FadeIn.delay(300).duration(300)}
                style={styles.coinRewardBadge}
              >
                <Ionicons name="sparkles" size={16} color="#FFD700" />
                <Text style={styles.coinRewardText}>+{lastCoinReward.coins}</Text>
                <View style={[styles.multiplierTag, { backgroundColor: getMultiplierColor(lastCoinReward.multiplier) }]}>
                  <Text style={styles.multiplierTagText}>{lastCoinReward.multiplier}×</Text>
                </View>
              </Animated.View>
            )}
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
                  style={[styles.powerUpBtn, {backgroundColor: '#E91E63'}, usedPowerUps.includes('potion') && {opacity: 0.5}]}
                  onPress={handleUsePotion}
                  disabled={wrongCount === 0 || usedPowerUps.includes('potion') || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.potion}</Text></View>
                  <Ionicons name="flask" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.dust > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#9C27B0'}, usedPowerUps.includes('dust') && {opacity: 0.5}]}
                  onPress={handleUseDust}
                  disabled={usedPowerUps.includes('dust') || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.dust}</Text></View>
                  <Ionicons name="hourglass" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.powder > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#00BCD4'}, usedPowerUps.includes('powder') && {opacity: 0.5}]}
                  onPress={handleUsePowder}
                  disabled={usedPowerUps.includes('powder') || isTimerPaused || isTransitioning || gameOver || preGameCountdown !== null}
                >
                  <View style={styles.powerUpQtyBadge}><Text style={styles.powerUpQtyText}>{powerUps.powder}</Text></View>
                  <Ionicons name="snow" size={24} color="#fff" />
                </Pressable>
              )}
              {powerUps.firefly > 0 && (
                <Pressable
                  style={[styles.powerUpBtn, {backgroundColor: '#FFC107'}, usedPowerUps.includes('firefly') && {opacity: 0.5}]}
                  onPress={handleUseFirefly}
                  disabled={usedPowerUps.includes('firefly') || userInput.length >= currentProblem.answer.toString().length || isTransitioning || gameOver || preGameCountdown !== null}
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

      {showFireflyHint && (
        <Animated.View
          entering={ZoomIn.duration(400).withInitialValues({ transform: [{ translateY: 200 }, { translateX: 100 }, { scale: 0.5 }] })}
          exiting={FadeOut.duration(300)}
          style={styles.fireflyAnim}
        >
          <Ionicons name="bulb" size={48} color="#FFC107" />
          <View style={styles.fireflyGlow} />
        </Animated.View>
      )}

      {showPotionHeal && (
        <Animated.View
          entering={FadeIn.duration(300).withInitialValues({ transform: [{ translateY: 20 }, { translateX: 0 }, { scale: 0.5 }] })}
          exiting={FadeOut.duration(500)}
          style={styles.potionHealAnim}
        >
          <Ionicons name="medical" size={40} color="#E91E63" />
          <Ionicons name="heart" size={30} color="#E91E63" style={{ position: 'absolute', top: -20, right: -10, opacity: 0.7 }} />
          <Ionicons name="star" size={20} color="#FFC107" style={{ position: 'absolute', top: 10, left: -15, opacity: 0.8 }} />
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
      
      {/* Quit Confirmation Modal */}
      <Modal
        visible={showQuitModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
          
          <Animated.View 
            entering={FadeInDown.duration(300).easing(Easing.out(Easing.ease))}
            style={styles.modalContainer}
          >
            <View style={[styles.modalHeader, { backgroundColor: Colors.error }]}>
              <Ionicons name="warning" size={28} color="#fff" />
              <Text style={styles.modalTitle}>Surrender?</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Are you sure you want to quit the game? All current progress will be lost!
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={handleCancelQuit}
                >
                  <Text style={styles.cancelBtnText}>Keep Playing</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quitBtn} 
                  onPress={handleConfirmQuit}
                >
                  <Ionicons name="exit" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.quitBtnText}>Quit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

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
  topBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
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
  coinCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  coinCounterText: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: '#B8860B',
  },
  coinPopup: {
    position: 'absolute',
    top: -18,
    right: -10,
  },
  coinPopupText: {
    fontSize: 12,
    fontFamily: 'Fredoka_700Bold',
  },
  livesRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 32,
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
  coinRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  coinRewardText: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
    color: '#B8860B',
  },
  multiplierTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  multiplierTagText: {
    fontSize: 12,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
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
  fireflyAnim: {
    position: 'absolute',
    top: '35%',
    left: '42%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  fireflyGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    zIndex: -1,
  },
  potionHealAnim: {
    position: 'absolute',
    top: '25%',
    left: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  modalTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#fff',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cancelBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#757575',
  },
  quitBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quitBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});
