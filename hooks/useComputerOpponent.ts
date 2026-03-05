import { useState, useRef, useCallback } from 'react';
import type { Difficulty } from '@/lib/math-engine';

/**
 * Simulates a computer opponent for 1v1 mode.
 * The computer "answers" each question after a dynamic delay,
 * with accuracy, speed, and streaks that adapt based on difficulty
 * and question progression — creating a more realistic opponent.
 *
 * ── Difficulty Profiles ──
 *   Easy:    Consistent but beatable. Slower responses, occasional mistakes.
 *   Average: Competitive mid-range. Speeds up over time, moderate accuracy.
 *   Hard:    Aggressive and fast. High accuracy, gets tougher each question.
 *
 * ── Progressive Scaling ──
 *   As questions progress, the CPU gradually improves (within bounds)
 *   to keep matches feeling dynamic rather than flat.
 *
 * ── Streak Mechanics ──
 *   CPU can go on correct/wrong streaks for realism (humans cluster).
 *   A correct streak slightly boosts the chance of the next being correct,
 *   and vice versa — capped to prevent runaway behavior.
 */

interface DifficultyConfig {
  /** Base answer delay range (ms) — CPU picks a random time in [min, max] */
  minDelay: number;
  maxDelay: number;
  /** Base probability of answering correctly (0-1) */
  baseAccuracy: number;
  /** Max accuracy the CPU can reach through progression (0-1) */
  maxAccuracy: number;
  /** How much accuracy improves per question (additive) */
  accuracyGrowth: number;
  /** Delay reduction per question (ms) — CPU speeds up over time */
  speedGrowth: number;
  /** Minimum possible delay (ms) — floor so the CPU never becomes instant */
  minPossibleDelay: number;
  /** Streak momentum factor: how much a streak influences the next answer */
  streakMomentum: number;
  /** Max streak bonus/penalty applied to accuracy */
  maxStreakEffect: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    minDelay: 5000,
    maxDelay: 9000,
    baseAccuracy: 0.55,
    maxAccuracy: 0.72,
    accuracyGrowth: 0.012,
    speedGrowth: 80,
    minPossibleDelay: 3500,
    streakMomentum: 0.04,
    maxStreakEffect: 0.08,
  },
  average: {
    minDelay: 3500,
    maxDelay: 7000,
    baseAccuracy: 0.65,
    maxAccuracy: 0.82,
    accuracyGrowth: 0.015,
    speedGrowth: 120,
    minPossibleDelay: 2200,
    streakMomentum: 0.05,
    maxStreakEffect: 0.12,
  },
  hard: {
    minDelay: 2000,
    maxDelay: 4500,
    baseAccuracy: 0.78,
    maxAccuracy: 0.92,
    accuracyGrowth: 0.018,
    speedGrowth: 150,
    minPossibleDelay: 1200,
    streakMomentum: 0.06,
    maxStreakEffect: 0.15,
  },
};

export function useComputerOpponent(difficulty: Difficulty) {
  const [computerLives, setComputerLives] = useState(5);
  const [computerScore, setComputerScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const livesRef = useRef(5);
  const questionCountRef = useRef(0);
  const streakRef = useRef(0); // positive = correct streak, negative = wrong streak

  // Keep ref in sync
  const updateLives = useCallback((newLives: number) => {
    livesRef.current = newLives;
    setComputerLives(newLives);
  }, []);

  /**
   * Calculates the CPU's effective accuracy for the current question,
   * factoring in progressive scaling and streak momentum.
   */
  const getEffectiveAccuracy = useCallback((config: DifficultyConfig, qNum: number, streak: number): number => {
    // Progressive accuracy: starts at baseAccuracy, grows per question
    const progressBonus = Math.min(
      config.maxAccuracy - config.baseAccuracy,
      config.accuracyGrowth * (qNum - 1)
    );
    let accuracy = config.baseAccuracy + progressBonus;

    // Streak momentum: correct streaks boost accuracy, wrong streaks reduce it
    const streakEffect = Math.min(
      config.maxStreakEffect,
      Math.abs(streak) * config.streakMomentum
    );
    if (streak > 0) {
      accuracy += streakEffect;
    } else if (streak < 0) {
      accuracy -= streakEffect;
    }

    // Clamp to [0.15, maxAccuracy] — never impossibly perfect or useless
    return Math.max(0.15, Math.min(config.maxAccuracy, accuracy));
  }, []);

  /**
   * Calculates the CPU's answer delay for the current question,
   * getting faster as questions progress.
   */
  const getDelay = useCallback((config: DifficultyConfig, qNum: number): number => {
    const speedReduction = config.speedGrowth * (qNum - 1);
    const adjustedMin = Math.max(config.minPossibleDelay, config.minDelay - speedReduction);
    const adjustedMax = Math.max(adjustedMin + 500, config.maxDelay - speedReduction);

    // Add slight randomness jitter (±15%) for realism
    const baseDelay = adjustedMin + Math.random() * (adjustedMax - adjustedMin);
    const jitter = baseDelay * (0.85 + Math.random() * 0.30);
    return Math.max(config.minPossibleDelay, jitter);
  }, []);

  /**
   * Start the computer's "thinking" for the current question.
   * onResult is called with true (correct) or false (wrong).
   */
  const startComputerTurn = useCallback((onResult: (correct: boolean) => void) => {
    if (livesRef.current <= 0) return;

    questionCountRef.current += 1;
    const qNum = questionCountRef.current;
    const config = DIFFICULTY_CONFIGS[difficulty];

    const delay = getDelay(config, qNum);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (livesRef.current <= 0) return;

      const accuracy = getEffectiveAccuracy(config, qNum, streakRef.current);
      const isCorrect = Math.random() < accuracy;

      if (isCorrect) {
        // Update streak: extend correct streak or reset
        streakRef.current = Math.max(1, streakRef.current + 1);
        setComputerScore((prev) => prev + 1);
        onResult(true);
      } else {
        // Update streak: extend wrong streak or reset
        streakRef.current = Math.min(-1, streakRef.current - 1);
        const newLives = livesRef.current - 1;
        updateLives(newLives);
        onResult(false);
      }
    }, delay);
  }, [difficulty, updateLives, getEffectiveAccuracy, getDelay]);

  const cancelComputerTurn = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetComputer = useCallback(() => {
    cancelComputerTurn();
    updateLives(5);
    setComputerScore(0);
    questionCountRef.current = 0;
    streakRef.current = 0;
  }, [cancelComputerTurn, updateLives]);

  return {
    computerLives,
    computerScore,
    startComputerTurn,
    cancelComputerTurn,
    resetComputer,
  };
}
