export interface Question {
  id: string; // e.g. "S1-Q1"
  setNum: number;
  qNum: number;
  question: string;
  options: { [key: string]: string }; // A, B, C, D
  correct: string; // "A" | "B" | "C" | "D"
  correctText: string;
  explanation: string;
}

export interface MistakeLog {
  id: string; // unique log ID
  questionId: string; // e.g. "S1-Q1"
  setNum: number;
  qNum: number;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: string;
  selectedAnswer: string;
  explanation: string;
  timestamp: string; // ISO string
}

export interface ExamAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  flaggedCount: number;
  guessCount: number;
  correctCount: number;
  mistakes: string[]; // List of questionIds that were wrong
}
