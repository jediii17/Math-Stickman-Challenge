export type Difficulty = 'easy' | 'average' | 'difficult';
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  display: string;
  topic: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTopicName(op: Operation): string {
  switch (op) {
    case 'add': return 'Addition';
    case 'subtract': return 'Subtraction';
    case 'multiply': return 'Multiplication';
    case 'divide': return 'Division';
  }
}

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
    num1,
    num2,
    operation: 'add',
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
    num1,
    num2,
    operation: 'subtract',
    answer: num1 - num2,
    display: `${num1} - ${num2}`,
    topic: getTopicName('subtract'),
  };
}

function generateMultiplication(_difficulty: Difficulty): MathProblem {
  const num1 = randomInt(1, 9);
  const num2 = randomInt(1, 9);
  return {
    num1,
    num2,
    operation: 'multiply',
    answer: num1 * num2,
    display: `${num1} x ${num2}`,
    topic: getTopicName('multiply'),
  };
}

function generateDivision(_difficulty: Difficulty): MathProblem {
  const num2 = randomInt(1, 9);
  const answer = randomInt(1, 9);
  const num1 = num2 * answer;
  return {
    num1,
    num2,
    operation: 'divide',
    answer,
    display: `${num1} \u00F7 ${num2}`,
    topic: getTopicName('divide'),
  };
}

export function generateProblem(difficulty: Difficulty): MathProblem {
  const operations: Operation[] = ['add', 'subtract', 'multiply', 'divide'];
  const op = operations[randomInt(0, operations.length - 1)];

  switch (op) {
    case 'add': return generateAddition(difficulty);
    case 'subtract': return generateSubtraction(difficulty);
    case 'multiply': return generateMultiplication(difficulty);
    case 'divide': return generateDivision(difficulty);
  }
}

export function getTimeLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 60;
    case 'average': return 45;
    case 'difficult': return 30;
  }
}

export function getTotalQuestions(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 10;
    case 'average': return 12;
    case 'difficult': return 15;
  }
}
