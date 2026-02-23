export type Difficulty = 'easy' | 'average' | 'difficult';
export type GameMode = 'survival' | 'classic';
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'fraction_add' | 'fraction_subtract';

export interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  display: string;
  topic: string;
  // For fraction problems, store extra info for display and verification
  fractionAnswer?: { numerator: number; denominator: number };
  stringAnswer?: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function getTopicName(op: Operation): string {
  switch (op) {
    case 'add': return 'Addition';
    case 'subtract': return 'Subtraction';
    case 'multiply': return 'Multiplication';
    case 'divide': return 'Division';
    case 'fraction_add': return 'Fraction Addition';
    case 'fraction_subtract': return 'Fraction Subtraction';
  }
}

// ─── GCD for fraction simplification ───
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// ─── Basic arithmetic generators ───

function generateAddition(difficulty: Difficulty): MathProblem {
  let num1: number, num2: number;
  switch (difficulty) {
    case 'easy':
      num1 = randomInt(1, 9);
      num2 = randomInt(1, 9);
      break;
    case 'average':
      num1 = randomInt(10, 99);
      num2 = randomInt(10, 99);
      break;
    case 'difficult':
      num1 = randomInt(100, 999);
      num2 = randomInt(100, 999);
      break;
  }
  return {
    num1, num2, operation: 'add',
    answer: num1 + num2,
    display: `${num1} + ${num2}`,
    topic: getTopicName('add'),
  };
}

function generateSubtraction(difficulty: Difficulty): MathProblem {
  let num1: number, num2: number;
  switch (difficulty) {
    case 'easy':
      num1 = randomInt(2, 9);
      num2 = randomInt(1, num1);
      break;
    case 'average':
      num1 = randomInt(20, 99);
      num2 = randomInt(10, num1);
      break;
    case 'difficult':
      num1 = randomInt(200, 999);
      num2 = randomInt(100, num1);
      break;
  }
  return {
    num1, num2, operation: 'subtract',
    answer: num1 - num2,
    display: `${num1} - ${num2}`,
    topic: getTopicName('subtract'),
  };
}

function generateMultiplication(difficulty: Difficulty): MathProblem {
  let num1: number, num2: number;
  switch (difficulty) {
    case 'easy':
      num1 = randomInt(1, 9);
      num2 = randomInt(1, 9);
      break;
    case 'average':
      num1 = randomInt(10, 99);
      num2 = randomInt(2, 9);
      break;
    case 'difficult':
      num1 = randomInt(100, 999);
      num2 = randomInt(2, 9);
      break;
  }
  return {
    num1, num2, operation: 'multiply',
    answer: num1 * num2,
    display: `${num1} × ${num2}`,
    topic: getTopicName('multiply'),
  };
}

function generateDivision(difficulty: Difficulty): MathProblem {
  let num1: number, num2: number, answer: number;
  switch (difficulty) {
    case 'easy':
      num2 = randomInt(1, 9);
      answer = randomInt(1, 9);
      num1 = num2 * answer;
      break;
    case 'average':
      num2 = randomInt(2, 9);
      answer = randomInt(10, 99);
      num1 = num2 * answer;
      break;
    case 'difficult':
      num2 = randomInt(2, 9);
      answer = randomInt(100, 999);
      num1 = num2 * answer;
      break;
  }
  return {
    num1, num2, operation: 'divide',
    answer,
    display: `${num1} ÷ ${num2}`,
    topic: getTopicName('divide'),
  };
}

// ─── Fraction generators ───

/** Similar fractions: same denominator */
function generateSimilarFractionAdd(): MathProblem {
  const denom = randomInt(2, 9);
  const n1 = randomInt(1, denom - 1);
  const n2 = randomInt(1, denom - 1);
  const ansNum = n1 + n2;
  const g = gcd(ansNum, denom);
  const simpNum = ansNum / g;
  const simpDen = denom / g;
  return {
    num1: n1, num2: n2, operation: 'fraction_add',
    answer: simpNum / simpDen, 
    display: `${n1}/${denom} + ${n2}/${denom}`,
    topic: getTopicName('fraction_add'),
    fractionAnswer: { numerator: simpNum, denominator: simpDen },
    stringAnswer: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`,
  };
}

function generateSimilarFractionSub(): MathProblem {
  const denom = randomInt(2, 9);
  let n1 = randomInt(2, denom);
  let n2 = randomInt(1, n1 - 1 || 1);
  if (n1 <= n2) { [n1, n2] = [n2, n1]; }
  if (n1 === n2) { n1 = n2 + 1; }
  const ansNum = n1 - n2;
  const g = gcd(ansNum, denom);
  const simpNum = ansNum / g;
  const simpDen = denom / g;
  return {
    num1: n1, num2: n2, operation: 'fraction_subtract',
    answer: simpNum / simpDen,
    display: `${n1}/${denom} - ${n2}/${denom}`,
    topic: getTopicName('fraction_subtract'),
    fractionAnswer: { numerator: simpNum, denominator: simpDen },
    stringAnswer: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`,
  };
}

/** Dissimilar fractions: different denominators */
function generateDissimilarFractionAdd(): MathProblem {
  const d1 = randomInt(2, 6);
  let d2 = randomInt(2, 6);
  while (d2 === d1) d2 = randomInt(2, 6);
  const n1 = randomInt(1, d1 - 1);
  const n2 = randomInt(1, d2 - 1);
  const commonDen = lcm(d1, d2);
  const ansNum = n1 * (commonDen / d1) + n2 * (commonDen / d2);
  const g = gcd(ansNum, commonDen);
  const simpNum = ansNum / g;
  const simpDen = commonDen / g;
  return {
    num1: n1, num2: n2, operation: 'fraction_add',
    answer: simpNum / simpDen,
    display: `${n1}/${d1} + ${n2}/${d2}`,
    topic: 'Dissimilar Fraction Addition',
    fractionAnswer: { numerator: simpNum, denominator: simpDen },
    stringAnswer: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`,
  };
}

function generateDissimilarFractionSub(): MathProblem {
  const d1 = randomInt(2, 6);
  let d2 = randomInt(2, 6);
  while (d2 === d1) d2 = randomInt(2, 6);
  const commonDen = lcm(d1, d2);
  // Ensure positive result
  let n1 = randomInt(1, d1 - 1);
  let n2 = randomInt(1, d2 - 1);
  const val1 = n1 * (commonDen / d1);
  const val2 = n2 * (commonDen / d2);
  if (val1 < val2) { [n1, n2] = [n2, n1]; } // swap to keep positive
  const realN1 = val1 >= val2 ? n1 : n2;
  const realD1 = val1 >= val2 ? d1 : d2;
  const realN2 = val1 >= val2 ? n2 : n1;
  const realD2 = val1 >= val2 ? d2 : d1;
  const commonDen2 = lcm(realD1, realD2);
  const ansNum = realN1 * (commonDen2 / realD1) - realN2 * (commonDen2 / realD2);
  if (ansNum <= 0) {
    // Fallback to similar fraction
    return generateSimilarFractionSub();
  }
  const g = gcd(ansNum, commonDen2);
  const simpNum = ansNum / g;
  const simpDen = commonDen2 / g;
  return {
    num1: realN1, num2: realN2, operation: 'fraction_subtract',
    answer: simpNum / simpDen,
    display: `${realN1}/${realD1} - ${realN2}/${realD2}`,
    topic: 'Dissimilar Fraction Subtraction',
    fractionAnswer: { numerator: simpNum, denominator: simpDen },
    stringAnswer: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`,
  };
}

// ─── Main generators ───

/** Generate a problem for Survival mode */
export function generateProblem(difficulty: Difficulty): MathProblem {
  let operations: (() => MathProblem)[];

  switch (difficulty) {
    case 'easy':
      operations = [
        () => generateAddition('easy'),
        () => generateSubtraction('easy'),
        () => generateMultiplication('easy'),
        () => generateDivision('easy'),
      ];
      break;
    case 'average':
      operations = [
        () => generateAddition('average'),
        () => generateSubtraction('average'),
        () => generateMultiplication('average'),
        () => generateDivision('average'),
        () => generateSimilarFractionAdd(),
        () => generateSimilarFractionSub(),
      ];
      break;
    case 'difficult':
      operations = [
        () => generateAddition('difficult'),
        () => generateSubtraction('difficult'),
        () => generateMultiplication('difficult'),
        () => generateDivision('difficult'),
        () => generateSimilarFractionAdd(),
        () => generateSimilarFractionSub(),
        () => generateDissimilarFractionAdd(),
        () => generateDissimilarFractionSub(),
      ];
      break;
  }

  return pickRandom(operations)();
}

/** Get the difficulty label for a classic level */
export function getClassicDifficulty(level: number): Difficulty {
  if (level <= 25) return 'easy';
  if (level <= 50) return 'average';
  return 'difficult';
}

/** Get the hardness multiplier based on level seasons (every 25 levels) */
export function getSeasonalHardness(level: number): number {
  return Math.floor((level - 1) / 25);
}

/** Generate a problem for Classic mode based on level */
export function generateClassicProblem(level: number): MathProblem {
  const hardness = getSeasonalHardness(level);
  const diff = getClassicDifficulty(level);
  
  // Custom logic for Season 4 (Level 76+) to make it fraction-heavy
  if (level >= 76) {
    const roll = Math.random();
    if (roll < 0.75) {
      // 75% chance of fractions in Season 4
      const fracOps = [
        () => generateSimilarFractionAdd(),
        () => generateSimilarFractionSub(),
        () => generateDissimilarFractionAdd(),
        () => generateDissimilarFractionSub(),
      ];
      return pickRandom(fracOps)();
    }
  }

  // Basic generation based on difficulty
  const baseProblem = generateProblem(diff);
  
  // Apply seasonal hardness: slightly increase numbers if hardness > some threshold
  if (hardness > 0 && !baseProblem.stringAnswer) {
    const scale = 1 + (hardness * 0.1); 
    baseProblem.num1 = Math.round(baseProblem.num1 * scale);
    baseProblem.num2 = Math.round(baseProblem.num2 * scale);
    
    // Recalculate answer based on operation
    switch (baseProblem.operation) {
      case 'add': baseProblem.answer = baseProblem.num1 + baseProblem.num2; break;
      case 'subtract': baseProblem.answer = baseProblem.num1 - baseProblem.num2; break;
      case 'multiply': baseProblem.answer = baseProblem.num1 * baseProblem.num2; break;
      case 'divide': 
        baseProblem.num1 = baseProblem.num2 * baseProblem.answer; 
        break;
    }
    baseProblem.display = baseProblem.display.replace(/\d+/, baseProblem.num1.toString()).replace(/\d+$/, baseProblem.num2.toString());
  }
  
  return baseProblem;
}

// ─── Time & question config ───

export function getTimeLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 15;
    case 'average': return 30;
    case 'difficult': return 60;
  }
}

export function getTotalQuestions(_difficulty: Difficulty): number {
  // Classic mode: always 10 per level
  return 10;
}

// ─── Coin calculation ───

export function getBaseCoinReward(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'average': return 2;
    case 'difficult': return 3;
  }
}

/**
 * Calculate coin multiplier based on % of time used.
 * ≤25% time used = 3×, 26-50% = 2×, >50% = 1×
 */
export function getCoinMultiplier(timeLimit: number, timeLeft: number): number {
  const timeUsed = timeLimit - timeLeft;
  const pctUsed = timeUsed / timeLimit;
  if (pctUsed <= 0.25) return 3;
  if (pctUsed <= 0.50) return 2;
  return 1;
}

export function calculateQuestionCoins(difficulty: Difficulty, timeLimit: number, timeLeft: number): { base: number; multiplier: number; total: number } {
  const base = getBaseCoinReward(difficulty);
  const multiplier = getCoinMultiplier(timeLimit, timeLeft);
  return { base, multiplier, total: base * multiplier };
}
