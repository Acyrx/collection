"use client";

import type { QuizState } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowRightCircle, CheckCheck, RefreshCw } from 'lucide-react';

interface QuizControlsProps {
  quizState: QuizState;
  onNextQuestion: () => void;
  onShowResults: () => void;
  onRetakeQuiz: () => void;
  isLastQuestion: boolean;
  isLoading: boolean;
}

export default function QuizControls({
  quizState,
  onNextQuestion,
  onShowResults,
  onRetakeQuiz,
  isLastQuestion,
  isLoading,
}: QuizControlsProps) {
  if (quizState === 'answer_feedback') {
    return (
      <Button onClick={isLastQuestion ? onShowResults : onNextQuestion} className="w-full sm:w-auto mt-6" disabled={isLoading}>
        {isLastQuestion ? <CheckCheck className="mr-2 h-4 w-4" /> : <ArrowRightCircle className="mr-2 h-4 w-4" />}
        {isLastQuestion ? 'Show Results' : 'Next Question'}
      </Button>
    );
  }

  if (quizState === 'completed') {
    return (
      <Button onClick={onRetakeQuiz} className="w-full sm:w-auto mt-8" disabled={isLoading}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Retake Quiz
      </Button>
    );
  }

  return null;
}
