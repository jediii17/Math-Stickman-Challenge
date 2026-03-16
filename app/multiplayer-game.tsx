import React, { useState, useEffect, useRef, useCallback,useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
  Alert,
  BackHandler,
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
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import NumberPad from '@/components/NumberPad';
import ScribbleArea from '@/components/ScribbleArea';
import ArenaStage from '@/components/ArenaStage';
import Stickman from '@/components/Stickman';
import Timer from '@/components/Timer';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayerContext } from '@/contexts/MultiplayerProvider';
import type { BroadcastProblem } from '@/hooks/useMultiplayer';
import { AccessoryType, getSlotForAccessory, useGameState } from '@/hooks/useGameState';
import { supabase } from '@/lib/supabase';
import * as dbLib from '@/lib/db';
import { useComputerOpponent } from '@/hooks/useComputerOpponent';
import {
  generateProblem,
  getTimeLimit,
  simplifyFractionStr,
  calculateQuestionCoins,
  type Difficulty,
  type MathProblem,
} from '@/lib/math-engine';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

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
  const {
    currentRoom,
    leaveRoom,
    subscribeToRoom,
    joinGameChannel,
    leaveGameChannel,
    broadcastQuestion,
    broadcastGameStart,
    receivedProblem,
    gameStarted,
    submitAnswer,
    advanceQuestion,
    resetAnswerTracking,
    opponentAnsweredCurrentQ,
    bothAnsweredSignal,
    matchEnded: matchEndedSignal,
    opponentAccessories: hookOpponentAccessories,
    broadcastAccessories,
    surrenderMatch,
  } = useMultiplayerContext();
  const computer = useComputerOpponent(diff);

  const timeLimit = getTimeLimit(diff, 'survival');
  // ─── Arena sizing: fully adaptive ───
  // Arena height = adaptive % of screen, smaller on compact devices
  const arenaH = Math.max(130, Math.min(240, screenHeight * (screenHeight < 750 ? 0.19 : 0.23)));
  const arenaW = screenWidth - 24;
  // Character size scales proportionally to arena height
  // Stickman canvas: w = size*5.2, h = size*2.55
  // We want the character to fill ~70% of arena height
  const charSize = Math.max(40, Math.min(90, (arenaH * 0.7) / 2.55));
  const charCanvasW = charSize * 5.2;
  const charCanvasH = charSize * 2.55;
  // Scale so two characters fit side by side (each gets ~50% of arena width)
  const scaleByW = (arenaW * 0.5) / charCanvasW;
  const scaleByH = (arenaH * 0.85) / charCanvasH;
  const charScale = Math.min(1.2, scaleByW, scaleByH);

  // ═══ Opponent accessories state (merged hook + DB fallback) ═══
  const [dbOpponentAccessories, setDbOpponentAccessories] = useState<Partial<Record<AccessoryType, string | null>>>({});
  const opponentAccessories = hookOpponentAccessories || dbOpponentAccessories;

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
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);

  const isSmallScreen = screenHeight < 700;
  const isVerySmallScreen = screenHeight < 640;

  // ═══ Coin system (PvP only, not vs computer) ═══
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [lastCoinReward, setLastCoinReward] = useState<{ coins: number; multiplier: number } | null>(null);

  // ═══ New: answer tracking & waiting state (online only) ═══
  const [myAnsweredQ, setMyAnsweredQ] = useState(0);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [scribbleMode, setScribbleMode] = useState(false);
  const myAnsweredQRef = useRef(0);
  const gameOverRef = useRef(false);
  const questionNumRef = useRef(1);
  const opponentAnsweredRef = useRef<typeof opponentAnsweredCurrentQ>(null);
  const triggerAdvanceRef = useRef<(() => void) | null>(null);
  const startTimerRef = useRef<(() => void) | null>(null);

  // Keep refs in sync
  useEffect(() => { myAnsweredQRef.current = myAnsweredQ; }, [myAnsweredQ]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { questionNumRef.current = questionNum; }, [questionNum]);
  useEffect(() => { opponentAnsweredRef.current = opponentAnsweredCurrentQ; }, [opponentAnsweredCurrentQ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const problemScale = useSharedValue(1);

  const pingPlayer = useAudioPlayer(require('@/assets/sounds/balloon-pop.mp3'));

  const goPlayer = useAudioPlayer(require('@/assets/sounds/go.wav'));
  const tickPlayer = useAudioPlayer(require('@/assets/sounds/tick.wav'));
  const victoryPlayer = useAudioPlayer(require('@/assets/sounds/victory.mp3'));
  const loserPlayer = useAudioPlayer(require('@/assets/sounds/loser.mp3'));

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
  const bgmStatus = useAudioPlayerStatus(bgmPlayer);
  const bgmIndexRef = useRef(SOUNDTRACK_ASSETS.indexOf(randomBgmSource));

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
        // Start BGM (no loop — we rotate tracks)
        bgmPlayer.loop = false;
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

  // Stop BGM on game over, play win/lose jingle
  useEffect(() => {
    if (gameOver) {
      gameOverRef.current = true;
      try { bgmPlayer.pause(); } catch (_) {}
      // Play result jingle
      if (winner === 'you') {
        safePlay(victoryPlayer);
      } else {
        safePlay(loserPlayer);
      }
    }
    return () => {
      gameOverRef.current = true;
      try { bgmPlayer.pause(); } catch (_) {}
    };
  }, [gameOver]);

  // Rotate to a new random soundtrack when the current one finishes
  useEffect(() => {
    if (gameOverRef.current) return;
    if (bgmStatus.playing === false && bgmStatus.currentTime > 0 && bgmStatus.duration > 0 && bgmStatus.currentTime >= bgmStatus.duration - 0.5) {
      // Pick a different random track
      let nextIdx = Math.floor(Math.random() * SOUNDTRACK_ASSETS.length);
      if (SOUNDTRACK_ASSETS.length > 1) {
        while (nextIdx === bgmIndexRef.current) {
          nextIdx = Math.floor(Math.random() * SOUNDTRACK_ASSETS.length);
        }
      }
      bgmIndexRef.current = nextIdx;
      try {
        bgmPlayer.replace(SOUNDTRACK_ASSETS[nextIdx]);
        bgmPlayer.volume = 0.3;
        bgmPlayer.play();
      } catch (e) {
        console.warn('BGM rotation failed', e);
      }
    }
  }, [bgmStatus.playing, bgmStatus.currentTime]);

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

  // ═══ Local state for opponent's stats to ensure instant updates from broadcast ═══
  const [opponentScoreLocal, setOpponentScoreLocal] = useState(0);
  const [opponentLivesLocal, setOpponentLivesLocal] = useState(5);

  const opponentLives = isComputer
    ? computer.computerLives
    : opponentLivesLocal;

  const opponentScore = isComputer
    ? computer.computerScore
    : opponentScoreLocal;

  // ─── Opponent accessories reactive fetch ───
  useEffect(() => {
    if (isComputer || !roomId) return;
    const opponentId = isHost ? currentRoom?.guest_id : currentRoom?.host_id;
    if (!opponentId) return;

    supabase
      .from('user_accessories')
      .select('accessory_id, equipped')
      .eq('user_id', opponentId)
      .eq('equipped', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const overrides: Partial<Record<AccessoryType, string | null>> = {
            hair: null, face: null, cheeks: null, mouth: null,
            upper: null, lower: null, shoes: null, balloons: null,
            back: null, tail: null,
          };
          data.forEach((row: any) => {
            const slot = getSlotForAccessory(row.accessory_id);
            if (slot) overrides[slot] = row.accessory_id;
          });
          setDbOpponentAccessories(overrides);
        } else {
          setDbOpponentAccessories({
            hair: null, face: null, cheeks: null, mouth: null,
            upper: null, lower: null, shoes: null, balloons: null,
            back: null, tail: null,
          });
        }
      });
  }, [roomId, isHost, currentRoom?.guest_id, currentRoom?.host_id, isComputer]);

  // Broadcast our own accessories when game starts
  const accessories = useGameState((state) => state.equippedAccessories);
  useEffect(() => {
    if (gameStarted && !isComputer) {
      broadcastAccessories(accessories);
    }
  }, [gameStarted, isComputer, accessories]);

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

  // ═══ Guest: Receive game start signal ═══
  useEffect(() => {
    if (!isHost && !isComputer && gameStarted) {
      setWaitingForStart(false);
    }
  }, [gameStarted, isHost, isComputer]);

  // ═══ Guest: Receive questions via 'question' broadcast ═══
  // Q1: handled here (with countdown). Q2+: backup channel (primary is bothAnsweredSignal).
  // Guard: only process if questionNum > current to prevent double-processing.
  useEffect(() => {
    if (!isHost && !isComputer && receivedProblem && !gameOverRef.current) {
      // Only process if this is a NEWER question than what we currently have
      if (receivedProblem.questionNum > questionNumRef.current) {
        setCurrentProblem({
          display: receivedProblem.display,
          answer: receivedProblem.answer,
          stringAnswer: receivedProblem.stringAnswer,
        } as MathProblem);
        setQuestionNum(receivedProblem.questionNum);
        setUserInput('');
        setFeedback(null);
        setIsTransitioning(false);
        setWaitingForOpponent(false);
        setMyAnsweredQ(0);
        feedbackOpacity.value = 0;
        setTimeLeft(getTimeLimit(diff, 'survival', undefined, receivedProblem.questionNum));
        resetAnswerTracking();
        problemScale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));

        if (receivedProblem.questionNum === 1 && preGameCountdown === null && !gameOver) {
          setPreGameCountdown(3);
        } else {
          startTimerRef.current?.();
        }
      } else if (receivedProblem.questionNum === 1 && questionNumRef.current <= 1 && !currentProblem) {
        // Initial Q1: only process if we don't have a problem yet
        setCurrentProblem({
          display: receivedProblem.display,
          answer: receivedProblem.answer,
          stringAnswer: receivedProblem.stringAnswer,
        } as MathProblem);
        setQuestionNum(1);
        setUserInput('');
        setFeedback(null);
        setIsTransitioning(false);
        setWaitingForOpponent(false);
        feedbackOpacity.value = 0;
        setTimeLeft(getTimeLimit(diff, 'survival', undefined, 1));
        resetAnswerTracking();

        if (preGameCountdown === null && !gameOver) {
          setPreGameCountdown(3);
        }
      }
    }
  }, [receivedProblem]);

  // ═══ Sync local stats with currentRoom only as initial fallback ═══
  // (broadcast values are more accurate; don't overwrite them)
  const hasReceivedBroadcast = useRef(false);
  useEffect(() => {
    if (opponentAnsweredCurrentQ) hasReceivedBroadcast.current = true;
  }, [opponentAnsweredCurrentQ]);

  useEffect(() => {
    if (currentRoom && !hasReceivedBroadcast.current) {
      const dbScore = isHost ? currentRoom.guest_score : currentRoom.host_score;
      const dbLives = isHost ? currentRoom.guest_lives : currentRoom.host_lives;
      setOpponentScoreLocal(dbScore);
      setOpponentLivesLocal(dbLives);
    }
  }, [currentRoom?.guest_score, currentRoom?.host_score, currentRoom?.guest_lives, currentRoom?.host_lives, isHost]);

  // ═══ Guest: Watch for bothAnsweredSignal (advance to next question) ═══
  // This is the PRIMARY mechanism for the guest to receive questions 2+.
  useEffect(() => {
    if (!isHost && !isComputer && bothAnsweredSignal && !gameOverRef.current) {
      // Guard: only process if this is a NEW question (strictly greater than current)
      if (bothAnsweredSignal.questionNum > questionNumRef.current) {
        setCurrentProblem({
          display: bothAnsweredSignal.display,
          answer: bothAnsweredSignal.answer,
          stringAnswer: bothAnsweredSignal.stringAnswer,
        } as MathProblem);
        setQuestionNum(bothAnsweredSignal.questionNum);
        setUserInput('');
        setFeedback(null);
        setIsTransitioning(false);
        setWaitingForOpponent(false);
        setMyAnsweredQ(0); // reset for new question
        feedbackOpacity.value = 0;
        setTimeLeft(getTimeLimit(diff, 'survival', undefined, bothAnsweredSignal.questionNum));
        resetAnswerTracking();
        problemScale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));
        startTimerRef.current?.();
      } else {
        // Same or older question — just clear waiting state
        setWaitingForOpponent(false);
      }
    }
  }, [bothAnsweredSignal, isHost, isComputer, diff, resetAnswerTracking]);

  // ═══ Handle opponent answer broadcast (instant stats + sound + match end) ═══
  useEffect(() => {
    if (opponentAnsweredCurrentQ && !isComputer && !gameOverRef.current) {
      if (opponentAnsweredCurrentQ.questionNum === questionNumRef.current) {
        // Instant update from broadcast
        setOpponentScoreLocal(opponentAnsweredCurrentQ.score);
        setOpponentLivesLocal(opponentAnsweredCurrentQ.livesLeft);

        // Check if the opponent just lost (their lives reached 0) — WE WIN!
        if (opponentAnsweredCurrentQ.matchEnded || opponentAnsweredCurrentQ.livesLeft <= 0) {
          setWaitingForOpponent(false);
          setGameOver(true);
          stopTimer();
          setWinner('you');
          return; // Don't advance — game is over
        }
        
        // Host: if I already answered this question AND opponent just answered, advance now
        if (isHost && myAnsweredQRef.current >= questionNumRef.current) {
          setWaitingForOpponent(false);
          setTimeout(() => { triggerAdvanceRef.current?.(); }, 1200);
        }

        // Play pop sound if they were wrong
        if (!opponentAnsweredCurrentQ.isCorrect) {
          setTimeout(() => safePlay(pingPlayer), 400);
        }
      }
    }
  }, [opponentAnsweredCurrentQ, isComputer, isHost]);



  // ─── Back Button Handling ───
  useEffect(() => {
    const onBackPress = () => {
      if (!gameOver && !waitingForStart) {
        setShowSurrenderConfirm(true);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [gameOver, waitingForStart]);

  const handleSurrender = async () => {
    setShowSurrenderConfirm(false);
    await surrenderMatch();
    setGameOver(true);
    setWinner('opponent');
  };

  // ═══ Match end broadcast (instant game-over on both clients) ═══
  useEffect(() => {
    if (matchEndedSignal && !gameOver) {
      setGameOver(true);
      stopTimer();
      computer.cancelComputerTurn();
      setWaitingForOpponent(false);
      if (matchEndedSignal.winnerId === user?.id) {
        setWinner('you');
      } else {
        setWinner('opponent');
      }
    }
  }, [matchEndedSignal]);

  // ═══ Watch for game over from room state (safety net) ═══
  useEffect(() => {
    if (!isComputer && currentRoom?.status === 'finished' && !gameOver) {
      setGameOver(true);
      stopTimer();
      setWaitingForOpponent(false);
      if (currentRoom.winner_id === user?.id) {
        setWinner('you');
      } else {
        setWinner('opponent');
      }
    }
    if (!isComputer && currentRoom?.status === 'cancelled' && !gameOver) {
      setGameOver(true);
      stopTimer();
      setWaitingForOpponent(false);
      setWinner('you');
    }
  }, [currentRoom?.status, currentRoom?.winner_id, user?.id, isComputer, gameOver]);

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

  // ─── Award coins on game over (winner gets coins) ───
  useEffect(() => {
    if (!gameOver || winner !== 'you' || totalCoinsEarned <= 0) return;
    // Award coins locally
    const { addCoins } = useGameState.getState();
    addCoins(totalCoinsEarned);
    // Persist to DB
    if (user?.id) {
      dbLib.addCoins(user.id, totalCoinsEarned).catch(() => {});
    }
  }, [gameOver]);


  // ═══ Host triggers advance after both players answered ═══
  const triggerAdvance = useCallback(() => {
    if (gameOverRef.current) return;
    const nextNum = questionNumRef.current + 1;
    const newProblem = generateProblem(diff, nextNum);

    const broadcastProblem: BroadcastProblem = {
      display: newProblem.display,
      answer: newProblem.answer,
      stringAnswer: newProblem.stringAnswer,
      questionNum: nextNum,
    };

    // Send to guest + update DB
    advanceQuestion(broadcastProblem);

    // Update local state for host
    setCurrentProblem(newProblem);
    setUserInput('');
    setQuestionNum(nextNum);
    setMyAnsweredQ(0); // reset for new question — will be compared against nextNum
    setTimeLeft(getTimeLimit(diff, 'survival', undefined, nextNum));
    setFeedback(null);
    setIsTransitioning(false);
    setWaitingForOpponent(false);
    feedbackOpacity.value = 0;
    // Reset opponent tracking ref so the host doesn't see stale data from previous question
    opponentAnsweredRef.current = null;
    problemScale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));
    startTimer();
  }, [diff, advanceQuestion, startTimer]);

  // Keep triggerAdvance and startTimer refs in sync
  useEffect(() => { triggerAdvanceRef.current = triggerAdvance; }, [triggerAdvance]);
  useEffect(() => { startTimerRef.current = startTimer; }, [startTimer]);

  // ═══ Safety net: if host is stuck waiting but opponent already answered, unstick ═══
  useEffect(() => {
    if (!isHost || isComputer || !waitingForOpponent || gameOverRef.current) return;

    // First: quick check from local ref (immediate unstick if broadcast arrived)
    const oppAns = opponentAnsweredRef.current;
    if (oppAns && oppAns.questionNum >= questionNumRef.current && myAnsweredQRef.current >= questionNumRef.current) {
      setWaitingForOpponent(false);
      setTimeout(() => triggerAdvanceRef.current?.(), 1200);
      return;
    }

    // Fallback: poll DB every 3 seconds in case the broadcast was missed
    const interval = setInterval(async () => {
      if (gameOverRef.current) return;
      const curQ = questionNumRef.current;
      const { data } = await supabase
        .from('multiplayer_rooms')
        .select('host_answered_q, guest_answered_q, status')
        .eq('id', roomId)
        .single();
      if (data && data.status !== 'finished' && data.status !== 'cancelled') {
        const hostDone = data.host_answered_q >= curQ;
        const guestDone = data.guest_answered_q >= curQ;
        if (hostDone && guestDone) {
          setWaitingForOpponent(false);
          triggerAdvanceRef.current?.();
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waitingForOpponent, isHost, isComputer, roomId]);

  // ═══ Safety net (guest): if stuck waiting, check room state ═══
  // The guest receives questions via two broadcast channels (question + both_answered).
  // If both are missed (very rare), this effect detects the advance via currentRoom realtime updates.
  useEffect(() => {
    if (isHost || isComputer || !waitingForOpponent || gameOverRef.current) return;
    if (!currentRoom) return;

    // If the room's current_question_num has moved past our question, the host already advanced
    if (currentRoom.current_question_num > questionNumRef.current) {
      // Just clear waiting — the question broadcasts should arrive shortly
      // (they travel via a faster channel than Postgres changes)
      setWaitingForOpponent(false);
    }
  }, [waitingForOpponent, isHost, isComputer, currentRoom?.current_question_num]);

  // ═══ After a player answers: decide whether to wait or advance ═══
  const afterMyAnswer = useCallback((didMatchEnd: boolean) => {
    if (didMatchEnd) return; // game over already handled

    if (isComputer) {
      // Computer mode: advance immediately as before
      setTimeout(() => {
        const nextNum = questionNumRef.current + 1;
        const newProblem = generateProblem(diff, nextNum);
        setCurrentProblem(newProblem);
        setUserInput('');
        setQuestionNum(nextNum);
        setTimeLeft(getTimeLimit(diff, 'survival', undefined, nextNum));
        setFeedback(null);
        setIsTransitioning(false);
        feedbackOpacity.value = 0;
        problemScale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));
        startTimer();
        computer.cancelComputerTurn();
        startComputerForQuestion();
      }, 1200);
      return;
    }

    // Online mode
    if (isHost) {
      // Use ref to get the LATEST opponent answer (avoids stale closure)
      const latestOppAns = opponentAnsweredRef.current;
      if (latestOppAns && latestOppAns.questionNum >= questionNumRef.current) {
        // Opponent already answered — advance after a short delay for feedback visibility
        setTimeout(() => triggerAdvance(), 1200);
      } else {
        // Waiting for opponent
        setWaitingForOpponent(true);
      }
    } else {
      // Guest: wait for bothAnsweredSignal from host
      // The receivedProblem effect will handle the advance
      setWaitingForOpponent(true);
    }
  }, [isComputer, isHost, diff, startTimer, triggerAdvance]);

  const handleTimeout = () => {
    // Duplicate guard for online mode
    if (!isComputer && myAnsweredQ >= questionNum) return;

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

    if (isComputer) {
      if (newWrong >= 5) {
        setGameOver(true);
        stopTimer();
        computer.cancelComputerTurn();
        setWinner('opponent');
        return;
      }
      afterMyAnswer(false);
      return;
    }

    // Online mode: mark as answered
    setMyAnsweredQ(questionNum);

    // Calculate accurate local stats for the broadcast
    const localLives = 5 - newWrong; // lives = 5 - total wrong answers
    const localScore = myScore; // score unchanged on wrong answer

    // Submit via hook (handles DB + broadcast)
    submitAnswer({ isHost, questionNum, isCorrect: false, localLives, localScore }).then(({ matchEnded: ended }) => {
      if (newWrong >= 5) {
        // Fix Lose Bug: set game over immediately
        setMyWrong(prev => prev + 1);
        setGameOver(true);
        setWinner('opponent');
        return;
      }
      if (ended) return;
      afterMyAnswer(ended);
    });
  };

  const handleSubmit = () => {
    if (!userInput || isTransitioning || gameOver || !currentProblem) return;

    // Duplicate submission guard for online mode
    if (!isComputer && myAnsweredQ >= questionNum) return;

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

      // Award coins for correct answers
      const coinResult = calculateQuestionCoins(diff, timeLimit, timeLeft, 'survival', questionNum);
      setTotalCoinsEarned((prev) => prev + coinResult.total);
      setLastCoinReward({ coins: coinResult.total, multiplier: coinResult.multiplier });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      const newWrong = myWrong + 1;
      setMyWrong(newWrong);
      setFeedback('wrong');
      setLastCoinReward(null);
      setTimeout(() => safePlay(pingPlayer), 400);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSequence(withSpring(1.2), withSpring(1));

    if (isComputer) {
      // Computer mode: same logic as before
      if (!isCorrect) {
        const newWrong = myWrong + 1;
        if (newWrong >= 5) {
          setGameOver(true);
          stopTimer();
          computer.cancelComputerTurn();
          setWinner('opponent');
          return;
        }
      }
      afterMyAnswer(false);
      return;
    }

    // Online mode: mark as answered
    setMyAnsweredQ(questionNum);

    // Calculate accurate local stats for the broadcast
    const localLives = isCorrect ? (5 - myWrong) : (5 - (myWrong + 1));
    const localScore = isCorrect ? (myScore + 1) : myScore;

    // Submit via hook
    submitAnswer({ isHost, questionNum, isCorrect, localLives, localScore }).then(({ matchEnded: ended }) => {
      if (!isCorrect && (myWrong + 1) >= 5) {
        // Fix Lose Bug: set game over immediately
        setMyWrong(prev => prev + 1);
        setGameOver(true);
        setWinner('opponent');
        return;
      }
      afterMyAnswer(ended);
    });
  };

  const handleNumberPress = (value: string) => {
    if (isTransitioning || gameOver || waitingForOpponent || !currentProblem) return;
    // Block input if already answered this question (online)
    if (!isComputer && myAnsweredQ >= questionNum) return;
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
    if (isTransitioning || gameOver || waitingForOpponent) return;
    if (!isComputer && myAnsweredQ >= questionNum) return;
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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/lobby');
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
          <Animated.View entering={ZoomIn.duration(300)}>
            <MaterialCommunityIcons name="sword-cross" size={64} color="#FF6B6B" />
          </Animated.View>
          <Animated.Text entering={FadeIn.delay(300)} style={styles.waitingText}>
            Waiting for battle to start...
          </Animated.Text>
          {/* <Pressable style={styles.quitBtnLarge} onPress={handleQuit}>
            <Text style={styles.quitBtnLargeText}>Leave</Text>
          </Pressable> */}
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
            {isWinner ? (
              <Ionicons name="trophy" size={64} color="#FFD700" />
            ) : (
              <Ionicons name="sad" size={64} color="#FF6B6B" />
            )}
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
              wrongCount={5 - (isWinner ? (isComputer ? (5 - myWrong) : myLives) : 0)} 
              size={70} 
              forceShowBalloons 
              hideStickman={!isWinner}
              hideBackground={true}
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
            {/* Show coins earned */}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}><Ionicons name="cash" size={16} color="#FFD700" /> Coins Earned</Text>
              <Text style={[styles.statValue, { color: isWinner && totalCoinsEarned > 0 ? '#FFD700' : '#FF6B6B' }]}>
                {isWinner ? `+${totalCoinsEarned}` : '0'}
              </Text>
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
        <Pressable onPress={() => setShowSurrenderConfirm(true)} style={styles.quitBtn}>
          <Ionicons name="flag" size={20} color="#fff" />
        </Pressable>
        <View style={[styles.diffBadge, { backgroundColor: getDiffColor() }]}>
          <Text style={styles.diffText}>
            <MaterialCommunityIcons name="sword-cross" size={14} color="#fff" /> 1v1 {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </Text>
        </View>
        <Timer timeLeft={timeLeft} totalTime={timeLimit} isPaused={false} />
      </View>

      {/* Arena — Battle Stage with Both Stickmen */}
      <View style={[styles.arenaContainer, { height: arenaH }]}>
        {/* Animated battle backdrop */}
        <ArenaStage width={arenaW} height={arenaH} />

        {/* Player Stickman (left) — feet on the floor line */}
        <View style={[styles.arenaCharacter, {
          left: arenaW * 0.03,
          bottom: arenaH * 0.22,
          transform: [{ scale: charScale }],
          transformOrigin: 'bottom left',
        }]}>
          <Stickman wrongCount={myWrong} size={charSize} forceShowBalloons hideBackground />
        </View>

        {/* Opponent Stickman (right) — feet on the floor line */}
        <View style={[styles.arenaCharacter, {
          right: arenaW * 0.03,
          bottom: arenaH * 0.22,
          transform: [{ scale: charScale }],
          transformOrigin: 'bottom right',
        }]}>
          <Stickman
            wrongCount={5 - opponentLives}
            size={charSize}
            forceShowBalloons
            hideBackground
            previewOverrides={isComputer
              ? { hair: null, face: null, cheeks: null, mouth: null, upper: null, lower: null, shoes: null, balloons: null, back: null, tail: null }
              : opponentAccessories}
          />
        </View>

        {/* VS Badge */}
        <View style={[styles.vsBadgeCenter, {
          width: Math.max(36, arenaH * 0.2),
          height: Math.max(36, arenaH * 0.2),
          marginLeft: -Math.max(18, arenaH * 0.1),
          marginTop: -Math.max(18, arenaH * 0.1),
        }]}>
          <LinearGradient colors={['#FF6B6B', '#ee5a24']} style={[styles.vsGradient, {
            width: Math.max(36, arenaH * 0.2),
            height: Math.max(36, arenaH * 0.2),
            borderRadius: Math.max(18, arenaH * 0.1),
          }]}>
            <Text style={[styles.vsText, { fontSize: Math.max(13, arenaH * 0.08) }]}>VS</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.statsRow, isVerySmallScreen && { paddingVertical: 2 }]}>
        {/* Your stats */}
        <View style={styles.statsSide}>
          <Text style={[styles.playerLabel, { color: '#4ECDC4' }, isVerySmallScreen && { fontSize: 9 }]}><Ionicons name="person" size={isVerySmallScreen ? 9 : 11} color="#4ECDC4" /> YOU</Text>
          <View style={styles.livesRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="balloon" size={isVerySmallScreen ? 10 : 12} color="#FF6B6B" style={{ opacity: i < (5 - myWrong) ? 1 : 0.2 }} />
            ))}
          </View>
          <Text style={[styles.scoreText, isVerySmallScreen && { fontSize: 9 }]}>Score: {myScore}</Text>
        </View>
        {/* Opponent stats */}
        <View style={styles.statsSide}>
          <Text style={[styles.playerLabel, { color: '#FF6B6B' }, isVerySmallScreen && { fontSize: 9 }]}>{isComputer ? <><Ionicons name="hardware-chip" size={isVerySmallScreen ? 9 : 11} color="#FF6B6B" /> CPU</> : <><Ionicons name="person" size={isVerySmallScreen ? 9 : 11} color="#FF6B6B" /> OPP</>}</Text>
          <View style={styles.livesRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="balloon" size={isVerySmallScreen ? 10 : 12} color="#FF6B6B" style={{ opacity: i < opponentLives ? 1 : 0.2 }} />
            ))}
          </View>
          <Text style={[styles.scoreText, isVerySmallScreen && { fontSize: 9 }]}>Score: {opponentScore}</Text>
        </View>
      </View>

      {/* Problem Display */}
      <Animated.View style={[
        styles.problemContainer, 
        problemAnimStyle,
        isVerySmallScreen && { paddingVertical: 4 }
      ]}>
        {preGameCountdown === null && (
          <>
            <View style={[styles.questionBadge, isVerySmallScreen && { marginBottom: 2 }]}>
              <Text style={styles.questionBadgeText}>Q{questionNum}</Text>
            </View>
            <Text style={[styles.problemText, isVerySmallScreen && { fontSize: 22 }]}>{currentProblem?.display ?? '...'}</Text>
            <View style={[styles.answerRow, isVerySmallScreen && { paddingVertical: 4, marginTop: 4, minWidth: 80 }]}>
              <Text style={[styles.answerDisplay, isVerySmallScreen && { fontSize: 20 }]}>
                {userInput || '?'}
              </Text>
            </View>
            {feedback && (
              <Animated.View style={[styles.feedbackRow, feedbackAnimStyle, isVerySmallScreen && { marginTop: 2 }]}>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: feedback === 'correct' ? '#4ECDC4' : '#FF6B6B' },
                    isVerySmallScreen && { fontSize: 13 }
                  ]}
                >
                  {getFeedbackText()}
                </Text>
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>

      {/* Number Pad / Scribble Area */}
      {scribbleMode ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
          <ScribbleArea onClose={() => setScribbleMode(false)} />
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
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
              <Ionicons name="pencil" size={18} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.padContainer}>
            <NumberPad
              onPress={handleNumberPress}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              disabled={isTransitioning || gameOver || waitingForOpponent || (!isComputer && myAnsweredQ >= questionNum)}
              isSmallScreen={isSmallScreen}
              screenHeight={screenHeight}
            />
          </View>
        </Animated.View>
      )}

      {/* Waiting for Opponent Overlay */}
      {waitingForOpponent && !gameOver && preGameCountdown === null && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.waitingOverlayContainer}>
            <Animated.View entering={ZoomIn.duration(300)} style={styles.waitingOverlayCard}>
              <Ionicons name="hourglass" size={48} color="#4ECDC4" />
              <Text style={styles.waitingOverlayText}>Waiting for opponent…</Text>
              <Text style={styles.waitingOverlaySubtext}>Your answer has been submitted</Text>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Surrender Confirmation */}
      {showSurrenderConfirm && (
        <View style={styles.waitingOverlayContainer}>
          <Animated.View entering={ZoomIn.duration(300)} style={styles.waitingOverlayCard}>
            <Ionicons name="flag" size={48} color="#FF6B6B" />
            <Text style={styles.waitingOverlayText}>Surrender Match?</Text>
            <Text style={styles.waitingOverlaySubtext}>You will lose the match and all accumulated coins.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable 
                style={[styles.returnBtn, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 0 }]} 
                onPress={() => setShowSurrenderConfirm(false)}
              >
                <Text style={styles.returnBtnText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.returnBtn, { backgroundColor: '#FF6B6B', marginTop: 0 }]} 
                onPress={handleSurrender}
              >
                <Text style={styles.returnBtnText}>Surrender</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Surrender Confirmation */}
      {showSurrenderConfirm && (
        <View style={styles.waitingOverlayContainer}>
          <Animated.View entering={ZoomIn.duration(300)} style={styles.waitingOverlayCard}>
            <Ionicons name="flag" size={48} color="#FF6B6B" />
            <Text style={styles.waitingOverlayText}>Surrender Match?</Text>
            <Text style={styles.waitingOverlaySubtext}>You will lose the match and all accumulated coins.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable 
                style={[styles.returnBtn, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 0 }]} 
                onPress={() => setShowSurrenderConfirm(false)}
              >
                <Text style={styles.returnBtnText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.returnBtn, { backgroundColor: '#FF6B6B', marginTop: 0 }]} 
                onPress={handleSurrender}
              >
                <Text style={styles.returnBtnText}>Surrender</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

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
  arenaContainer: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  arenaCharacter: {
    position: 'absolute',
  },
  arenaCharLeft: {
    left: 0,
    bottom: 0,
  },
  arenaCharRight: {
    right: 0,
    bottom: 0,
  },
  vsBadgeCenter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 10,
    width: 40,
    height: 40,
  },
  playerLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statsSide: {
    alignItems: 'center',
    gap: 1,
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  scribbleToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
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
    height: 180,
    overflow: 'hidden',
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
  // ─── Waiting for Opponent Overlay ───
  waitingOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  waitingOverlayCard: {
    backgroundColor: 'rgba(30,30,60,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.3)',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    gap: 8,
  },
  waitingOverlayEmoji: {
    fontSize: 48,
  },
  waitingOverlayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  waitingOverlaySubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
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
