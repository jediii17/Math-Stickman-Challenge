import React, { useState, useEffect, useRef, useCallback,useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import NumberPad from '@/components/NumberPad';
import Stickman from '@/components/Stickman';
import Timer from '@/components/Timer';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayer, BroadcastProblem } from '@/hooks/useMultiplayer';
import { useComputerOpponent } from '@/hooks/useComputerOpponent';
import {
  generateProblem,
  getTimeLimit,
  simplifyFractionStr,
  type Difficulty,
  type MathProblem,
} from '@/lib/math-engine';
import { useAudioPlayer } from 'expo-audio';

export default function MultiplayerGameScreen() {
  const params = useLocalSearchParams<{
    roomId: string;
    difficulty: string;
    isHost: string;
    isComputer: string;
  }>();

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const roomId = parseInt(params.roomId || '0', 10);
  const diff = (params.difficulty as Difficulty) || 'easy';
  const isHost = params.isHost === 'true';
  const isComputer = params.isComputer === 'true';

  const { user } = useAuth();
  const multiplayer = useMultiplayer(user?.id ?? null, user?.username ?? null);
  const computer = useComputerOpponent(diff);

  const {
    currentRoom,
    reportLifeLost,
    reportCorrectAnswer,
    leaveRoom,
    subscribeToRoom,
    joinGameChannel,
    leaveGameChannel,
    broadcastQuestion,
    broadcastGameStart,
    receivedProblem,
    gameStarted,
  } = multiplayer;

  const timeLimit = getTimeLimit(diff, 'survival');
  const stickmanSize = Math.min(130, Math.max(80, screenHeight * 0.16));

  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [myWrong, setMyWrong] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'you' | 'opponent' | null>(null);
  const [waitingForStart, setWaitingForStart] = useState(!isComputer);
  const [preGameCountdown, setPreGameCountdown] = useState<number | 'GO' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const problemScale = useSharedValue(1);

  const pingPlayer = useAudioPlayer(require('@/assets/sounds/balloon-pop.mp3'));

  const goPlayer = useAudioPlayer(require('@/assets/sounds/go.wav'));
  const tickPlayer = useAudioPlayer(require('@/assets/sounds/tick.wav'));

  const SOUNDTRACK_ASSETS = [
  require('@/assets/sounds/soundtrack_1.mp3'),
  require('@/assets/sounds/soundtrack_2.mp3'),
  require('@/assets/sounds/soundtrack_3.mp3'),
  require('@/assets/sounds/soundtrack_4.mp3'),
  require('@/assets/sounds/soundtrack_5.mp3'),
  require('@/assets/sounds/soundtrack_6.mp3'),
  require('@/assets/sounds/soundtrack_7.mp3'),
  require('@/assets/sounds/soundtrack_8.mp3'),
  require('@/assets/sounds/soundtrack_9.mp3'),
  require('@/assets/sounds/soundtrack_10.mp3'),
  require('@/assets/sounds/soundtrack_11.mp3'),
  require('@/assets/sounds/soundtrack_12.mp3'),
  require('@/assets/sounds/soundtrack_13.mp3'),
  require('@/assets/sounds/soundtrack_14.mp3'),
  require('@/assets/sounds/soundtrack_15.mp3'),
  require('@/assets/sounds/soundtrack_16.mp3'),
  require('@/assets/sounds/soundtrack_17.mp3'),
  require('@/assets/sounds/soundtrack_18.mp3'),
  require('@/assets/sounds/soundtrack_19.mp3'),
  require('@/assets/sounds/soundtrack_20.mp3'),
];

// Pick a random BGM once per game mount
  const randomBgmSource = useMemo(() => SOUNDTRACK_ASSETS[Math.floor(Math.random() * SOUNDTRACK_ASSETS.length)], []);
  const bgmPlayer = useAudioPlayer(randomBgmSource);

  const safePlay = useCallback((player: any) => {
    try {
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch (err) {
      console.warn('Audio play failed', err);
    }
  }, []);

  // Pre-game countdown effect
  useEffect(() => {
    if (preGameCountdown === null) return;
    if (preGameCountdown === 'GO') {
      safePlay(goPlayer);
      const t = setTimeout(() => {
        setPreGameCountdown(null);
        startTimer();
        // Start BGM
        bgmPlayer.loop = true;
        bgmPlayer.volume = 0.3;
        safePlay(bgmPlayer);
      }, 600);
      return () => clearTimeout(t);
    }
    if (typeof preGameCountdown === 'number' && preGameCountdown > 0) {
      safePlay(tickPlayer);
      const t = setTimeout(() => {
        if (preGameCountdown === 1) setPreGameCountdown('GO');
        else setPreGameCountdown(preGameCountdown - 1);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [preGameCountdown]);

  // Stop BGM on game over or unmount
  useEffect(() => {
    if (gameOver) {
      try { bgmPlayer.pause(); } catch (_) {}
    }
    return () => {
      try { bgmPlayer.pause(); } catch (_) {}
    };
  }, [gameOver]);

  // Tick sound for last 5 seconds
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && preGameCountdown === null && !gameOver && !waitingForStart) {
      safePlay(tickPlayer);
    }
  }, [timeLeft, preGameCountdown, gameOver, waitingForStart]);

  // ═══ Derived state ═══
  const myLives = isComputer
    ? 5 - myWrong
    : isHost
      ? (currentRoom?.host_lives ?? 5)
      : (currentRoom?.guest_lives ?? 5);

  const opponentLives = isComputer
    ? computer.computerLives
    : isHost
      ? (currentRoom?.guest_lives ?? 5)
      : (currentRoom?.host_lives ?? 5);

  const opponentScore = isComputer
    ? computer.computerScore
    : isHost
      ? (currentRoom?.guest_score ?? 0)
      : (currentRoom?.host_score ?? 0);

  // ═══ Initialize channels on mount ═══
  useEffect(() => {
    if (!isComputer && roomId > 0) {
      subscribeToRoom(roomId);
      joinGameChannel(roomId);
    }
    return () => {
      if (!isComputer) {
        leaveGameChannel();
      }
    };
  }, [roomId, isComputer]);

  // ═══ Host: Start game after short delay ═══
  useEffect(() => {
    if (isComputer) {
      // Computer mode: start immediately
      setWaitingForStart(false);
      setPreGameCountdown(3);
      const problem = generateProblem(diff, 1);
      setCurrentProblem(problem);
      // Timer and computer turn will start when countdown finishes
    } else if (isHost && currentRoom?.status === 'playing') {
      // Host: broadcast game start + first question
      const timer = setTimeout(() => {
        broadcastGameStart();
        setWaitingForStart(false);
        setPreGameCountdown(3);
        const problem = generateProblem(diff, 1);
        setCurrentProblem(problem);
        broadcastQuestion({
          display: problem.display,
          answer: problem.answer,
          stringAnswer: problem.stringAnswer,
          questionNum: 1,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComputer, isHost, currentRoom?.status]);

  // ═══ Guest: Receive game start and questions ═══
  useEffect(() => {
    if (!isHost && !isComputer && gameStarted) {
      setWaitingForStart(false);
    }
  }, [gameStarted, isHost, isComputer]);

  useEffect(() => {
    if (!isHost && !isComputer && receivedProblem) {
      setCurrentProblem({
        display: receivedProblem.display,
        answer: receivedProblem.answer,
        stringAnswer: receivedProblem.stringAnswer,
      } as MathProblem);
      setQuestionNum(receivedProblem.questionNum);
      setUserInput('');
      setFeedback(null);
      setIsTransitioning(false);
      feedbackOpacity.value = 0;
      setTimeLeft(getTimeLimit(diff, 'survival', undefined, receivedProblem.questionNum));
      
      if (receivedProblem.questionNum === 1 && preGameCountdown === null && !gameOver) {
        setPreGameCountdown(3);
      } else {
        startTimer();
      }
    }
  }, [receivedProblem]);

  // ═══ Watch for game over from room state (online) ═══
  useEffect(() => {
    if (!isComputer && currentRoom?.status === 'finished' && !gameOver) {
      setGameOver(true);
      stopTimer();
      computer.cancelComputerTurn();
      if (currentRoom.winner_id === user?.id) {
        setWinner('you');
      } else {
        setWinner('opponent');
      }
    }
    if (!isComputer && currentRoom?.status === 'cancelled' && !gameOver) {
      setGameOver(true);
      stopTimer();
      setWinner('you');
    }
  }, [currentRoom?.status]);

  // ═══ Watch for computer game over ═══
  useEffect(() => {
    if (isComputer && computer.computerLives <= 0 && !gameOver) {
      setGameOver(true);
      stopTimer();
      setWinner('you');
    }
  }, [computer.computerLives]);

  const startComputerForQuestion = useCallback(() => {
    if (!isComputer) return;
    computer.startComputerTurn((correct) => {
      // Computer answered — this just tracks computer's lives locally
      // The UI updates from computerLives/computerScore state
    });
  }, [isComputer, computer.startComputerTurn]);

  // ═══ Timer ═══
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // If computer mode, start their thinking logic when timer actually starts
    if (isComputer && !gameOver) {
      startComputerForQuestion();
    }
  }, [isComputer, gameOver, startComputerForQuestion]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  // Timeout handler
  useEffect(() => {
    if (timeLeft === 0 && !isTransitioning && !gameOver && currentProblem) {
      handleTimeout();
    }
  }, [timeLeft, isTransitioning, gameOver, currentProblem]);


  const handleTimeout = () => {
    stopTimer();
    setIsTransitioning(true);
    const newWrong = myWrong + 1;
    setMyWrong(newWrong);
    setFeedback('timeout');
    setTimeout(() => safePlay(pingPlayer), 400);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSequence(withSpring(1.2), withSpring(1));

    if (!isComputer) {
      reportLifeLost(isHost);
    }

    if (newWrong >= 5) {
      setGameOver(true);
      stopTimer();
      computer.cancelComputerTurn();
      if (isComputer) {
        setWinner('opponent');
      }
      // For online, the DB update in reportLifeLost will set finished + winner
      return;
    }

    setTimeout(() => nextQuestion(), 1500);
  };

  const handleSubmit = () => {
    if (!userInput || isTransitioning || gameOver || !currentProblem) return;
    stopTimer();
    setIsTransitioning(true);

    let isCorrect = false;
    if (currentProblem.stringAnswer) {
      const trimmedInput = userInput.trim();
      if (trimmedInput === currentProblem.stringAnswer) {
        isCorrect = true;
      } else {
        const simplifiedInput = simplifyFractionStr(trimmedInput);
        if (simplifiedInput !== null && simplifiedInput === currentProblem.stringAnswer) {
          isCorrect = true;
        } else if (trimmedInput.includes('/')) {
          const parts = trimmedInput.split('/');
          if (parts.length === 2) {
            const num = parseInt(parts[0], 10);
            const den = parseInt(parts[1], 10);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              if (Math.abs(num / den - currentProblem.answer) < 0.0001) {
                isCorrect = true;
              }
            }
          }
        }
      }
    } else {
      const cleanInput = userInput.replace(/ /g, '');
      isCorrect = parseInt(cleanInput, 10) === currentProblem.answer;
    }

    if (isCorrect) {
      setMyScore((prev) => prev + 1);
      setFeedback('correct');
      if (!isComputer) reportCorrectAnswer(isHost);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      const newWrong = myWrong + 1;
      setMyWrong(newWrong);
      setFeedback('wrong');
      setTimeout(() => safePlay(pingPlayer), 400);
      if (!isComputer) reportLifeLost(isHost);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      if (newWrong >= 5) {
        setGameOver(true);
        stopTimer();
        computer.cancelComputerTurn();
        if (isComputer) setWinner('opponent');
        return;
      }
    }

    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSequence(withSpring(1.2), withSpring(1));

    setTimeout(() => nextQuestion(), 1200);
  };

  const nextQuestion = () => {
    const nextNum = questionNum + 1;

    if (isComputer || isHost) {
      const newProblem = generateProblem(diff, nextNum);
      setCurrentProblem(newProblem);

      if (!isComputer) {
        broadcastQuestion({
          display: newProblem.display,
          answer: newProblem.answer,
          stringAnswer: newProblem.stringAnswer,
          questionNum: nextNum,
        });
      }

      // Host/Computer: reset UI and start timer immediately
      setUserInput('');
      setQuestionNum(nextNum);
      setTimeLeft(getTimeLimit(diff, 'survival', undefined, nextNum));
      setFeedback(null);
      setIsTransitioning(false);
      feedbackOpacity.value = 0;
      problemScale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));
      startTimer();

      if (isComputer) {
        computer.cancelComputerTurn();
        startComputerForQuestion();
      }
    } else {
      // Guest: reset UI only. Timer, timeLeft, and problem will be
      // set when the broadcast arrives via the receivedProblem useEffect.
      setUserInput('');
      setFeedback(null);
      setIsTransitioning(false);
      feedbackOpacity.value = 0;
    }
  };

  const handleNumberPress = (value: string) => {
    if (isTransitioning || gameOver || !currentProblem) return;
    if (value === '/' && userInput.includes('/')) return;
    const ansStr = currentProblem.stringAnswer || currentProblem.answer.toString();
    const cleanInput = userInput.replace(/ /g, '');
    if (cleanInput.length < ansStr.length + 2) {
      setUserInput((prev) => {
        const chars = prev.padEnd(ansStr.length, ' ').split('');
        const firstEmpty = chars.findIndex((c) => c === ' ' || c === '_');
        if (firstEmpty !== -1) {
          chars[firstEmpty] = value;
          return chars.join('');
        }
        return prev + value;
      });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleDelete = () => {
    if (isTransitioning || gameOver) return;
    setUserInput((prev) => {
      if (prev.includes(' ')) {
        const chars = prev.split('');
        for (let i = chars.length - 1; i >= 0; i--) {
          if (chars[i] !== ' ' && chars[i] !== '_') {
            chars[i] = ' ';
            break;
          }
        }
        const result = chars.join('');
        return result.trim() === '' ? '' : result.replace(/ +$/, '');
      }
      return prev.slice(0, -1);
    });
  };

  const handleQuit = async () => {
    stopTimer();
    computer.cancelComputerTurn();
    if (!isComputer) {
      await leaveRoom();
      leaveGameChannel();
    }
    router.replace('/lobby');
  };

  const feedbackAnimStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const problemAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: problemScale.value }],
  }));

  const getFeedbackText = () => {
    if (!currentProblem) return '';
    if (feedback === 'correct') return 'Correct!';
    const correctAnswer = currentProblem.stringAnswer || currentProblem.answer;
    if (feedback === 'wrong') return `Wrong! Answer: ${correctAnswer}`;
    if (feedback === 'timeout') return `Time's up! Answer: ${correctAnswer}`;
    return '';
  };

  const getDiffColor = () => {
    switch (diff) {
      case 'easy': return Colors.primary;
      case 'average': return Colors.secondary;
      case 'hard': return Colors.error;
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // ─── Waiting Screen ───
  if (waitingForStart) {
    return (
      <LinearGradient colors={['#1a0533', '#0d1b2a', '#1b2838']} style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.waitingContainer}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Text style={styles.waitingEmoji}>⚔️</Text>
          </Animated.View>
          <Animated.Text entering={FadeIn.delay(300)} style={styles.waitingText}>
            Waiting for battle to start...
          </Animated.Text>
          <Pressable style={styles.quitBtnLarge} onPress={handleQuit}>
            <Text style={styles.quitBtnLargeText}>Leave</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ─── Game Over Screen ───
  if (gameOver) {
    const isWinner = winner === 'you';
    return (
      <LinearGradient colors={['#1a0533', '#0d1b2a', '#1b2838']} style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.gameOverContainer}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Text style={styles.gameOverEmoji}>{isWinner ? '🏆' : '😢'}</Text>
          </Animated.View>
          <Animated.Text
            entering={FadeIn.delay(300)}
            style={[styles.gameOverTitle, { color: isWinner ? '#4ECDC4' : '#FF6B6B' }]}
          >
            {isWinner ? 'You Won!' : 'You Lost!'}
          </Animated.Text>

          {/* Winner/Loser Stickman */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.gameOverStickman}>
            <Stickman 
              wrongCount={5 - (isWinner ? (5 - myWrong) : 0)} 
              size={120} 
              forceShowBalloons 
              hideStickman={!isWinner}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(500)} style={styles.gameOverStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Your Score</Text>
              <Text style={styles.statValue}>{myScore}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Opponent Score</Text>
              <Text style={styles.statValue}>{opponentScore}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Your Balloons Left</Text>
              <Text style={styles.statValue}>{isComputer ? 5 - myWrong : myLives}</Text>
            </View>
          </Animated.View>
          <Pressable style={styles.returnBtn} onPress={() => router.replace('/lobby')}>
            <Text style={styles.returnBtnText}>Return to Lobby</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ─── Game UI ───
  return (
    <LinearGradient
      colors={['#1a0533', '#0d1b2a', '#1b2838']}
      style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleQuit} style={styles.quitBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={[styles.diffBadge, { backgroundColor: getDiffColor() }]}>
          <Text style={styles.diffText}>
            ⚔️ 1v1 {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </Text>
        </View>
        <Timer timeLeft={timeLeft} totalTime={timeLimit} isPaused={false} />
      </View>

      {/* Arena Row — Dual Stickman with Balloons */}
      <View style={styles.arenaRow}>
        {/* My Side */}
        <View style={styles.playerSide}>
          <LinearGradient
            colors={['rgba(78,205,196,0.15)', 'rgba(78,205,196,0.05)']}
            style={styles.playerCard}
          >
            <Text style={styles.playerLabel}>👤 You</Text>
            <View style={styles.stickmanWrapper}>
              <Stickman wrongCount={myWrong} size={stickmanSize} forceShowBalloons />
            </View>
            <View style={styles.livesRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={{ fontSize: 14, opacity: i < (5 - myWrong) ? 1 : 0.2 }}>
                  🎈
                </Text>
              ))}
            </View>
            <Text style={styles.scoreText}>Score: {myScore}</Text>
          </LinearGradient>
        </View>

        {/* VS Badge */}
        <View style={styles.vsBadge}>
          <LinearGradient colors={['#FF6B6B', '#ee5a24']} style={styles.vsGradient}>
            <Text style={styles.vsText}>VS</Text>
          </LinearGradient>
        </View>

        {/* Opponent Side */}
        <View style={styles.playerSide}>
          <LinearGradient
            colors={['rgba(255,107,107,0.15)', 'rgba(255,107,107,0.05)']}
            style={styles.playerCard}
          >
            <Text style={styles.playerLabel}>
              {isComputer ? '🤖 CPU' : '👤 Opponent'}
            </Text>
            <View style={styles.stickmanWrapper}>
              <Stickman
                wrongCount={5 - opponentLives}
                size={stickmanSize}
                forceShowBalloons
                previewOverrides={isComputer ? {
                  hair: null, face: null, cheeks: null, mouth: null, upper: null, lower: null, shoes: null, balloons: null, back: null, tail: null
                } : undefined}
              />
            </View>
            <View style={styles.livesRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={{ fontSize: 14, opacity: i < opponentLives ? 1 : 0.2 }}>
                  🎈
                </Text>
              ))}
            </View>
            <Text style={styles.scoreText}>Score: {opponentScore}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Problem Display */}
      <Animated.View style={[styles.problemContainer, problemAnimStyle]}>
        {preGameCountdown === null && (
          <>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>Q{questionNum}</Text>
            </View>
            <Text style={styles.problemText}>{currentProblem?.display ?? '...'}</Text>
            <View style={styles.answerRow}>
              <Text style={styles.answerDisplay}>
                {userInput || '?'}
              </Text>
            </View>
            {feedback && (
              <Animated.View style={[styles.feedbackRow, feedbackAnimStyle]}>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: feedback === 'correct' ? '#4ECDC4' : '#FF6B6B' },
                  ]}
                >
                  {getFeedbackText()}
                </Text>
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>

      {/* Number Pad */}
      <View style={styles.padContainer}>
        <NumberPad
          onPress={handleNumberPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={isTransitioning || gameOver}
        />
      </View>

      {/* Countdown Overlay */}
      {preGameCountdown !== null && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.countdownContainer}>
             <Animated.View 
              key={preGameCountdown}
              entering={ZoomIn.duration(400)}
              style={styles.countdownCircle}
            >
              <Text style={styles.countdownText}>{preGameCountdown}</Text>
            </Animated.View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Top Bar ───
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diffText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  // ─── Arena ───
  arenaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  playerSide: {
    flex: 1,
  },
  playerCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stickmanWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livesRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  vsBadge: {
    width: 40,
    height: 40,
    zIndex: 10,
    marginHorizontal: -5,
  },
  vsGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  vsText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  // ─── Problem ───
  problemContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  questionBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  questionBadgeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  problemText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  answerRow: {
    marginTop: 6,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(78,205,196,0.5)',
  },
  answerDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 4,
  },
  feedbackRow: {
    marginTop: 6,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  padContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  // ─── Game Over ───
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  gameOverEmoji: {
    fontSize: 64,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '900',
  },
  gameOverStickman: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverStats: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  returnBtn: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  returnBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // ─── Waiting ───
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  waitingEmoji: {
    fontSize: 64,
  },
  waitingText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  quitBtnLarge: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    marginTop: 16,
  },
  quitBtnLargeText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '700',
  },
  // ─── Countdown ───
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 4,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
  },
});
