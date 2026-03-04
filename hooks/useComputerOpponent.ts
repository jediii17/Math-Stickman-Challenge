import { useState, useRef, useCallback } from 'react';
import type { Difficulty } from '@/lib/math-engine';

/**
 * Simulates a computer opponent for 1v1 mode.
 * The computer "answers" each question after a random delay,
 * with accuracy based on difficulty.
 */

interface ComputerOpponentState {
  computerLives: number;
  computerScore: number;
}

const DIFFICULTY_CONFIG = {
  easy: { minDelay: 4000, maxDelay: 8000, correctRate: 0.70 },
  average: { minDelay: 3000, maxDelay: 6000, correctRate: 0.60 },
  hard: { minDelay: 2000, maxDelay: 5000, correctRate: 0.50 },
};

export function useComputerOpponent(difficulty: Difficulty) {
  const [computerLives, setComputerLives] = useState(5);
  const [computerScore, setComputerScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const livesRef = useRef(5);

  // Keep ref in sync
  const updateLives = useCallback((newLives: number) => {
    livesRef.current = newLives;
    setComputerLives(newLives);
  }, []);

  /**
   * Start the computer's "thinking" for the current question.
   * Returns a cleanup function to cancel the timer.
   * onResult is called with true (correct) or false (wrong).
   */
  const startComputerTurn = useCallback((onResult: (correct: boolean) => void) => {
    if (livesRef.current <= 0) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (livesRef.current <= 0) return;

      const isCorrect = Math.random() < config.correctRate;

      if (isCorrect) {
        setComputerScore((prev) => prev + 1);
        onResult(true);
      } else {
        const newLives = livesRef.current - 1;
        updateLives(newLives);
        onResult(false);
      }
    }, delay);
  }, [difficulty, updateLives]);

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
  }, [cancelComputerTurn, updateLives]);

  return {
    computerLives,
    computerScore,
    startComputerTurn,
    cancelComputerTurn,
    resetComputer,
  };
}
