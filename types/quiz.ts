
import type { EvaluateQuizAnswerOutput } from '@/ai/flows/evaluate-quiz-answer';

export interface QuizQuestion {
  id: string;
  text: string;
  correctAnswer: string; // Actual correct answer provided by question generation
  pageNumber?: number;    // Page number reference from the document
}

export interface UserQuizAnswer {
  questionId: string;
  answer: string;
}

export interface QuizEvaluation {
  questionId: string;
  evaluationData: EvaluateQuizAnswerOutput;
}

export type QuizState = 
  | 'idle' 
  | 'generating_questions' 
  | 'active_question' 
  | 'evaluating_answer' 
  | 'answer_feedback' 
  | 'completed';

