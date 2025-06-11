"use client";

import { useState, useEffect } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

interface QuestionDisplayProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => void;
  isEvaluating: boolean;
  isFeedbackState: boolean;
  initialAnswer?: string;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  isEvaluating,
  isFeedbackState,
  initialAnswer = '',
}: QuestionDisplayProps) {
  const [userAnswer, setUserAnswer] = useState(initialAnswer);

  useEffect(() => {
    setUserAnswer(initialAnswer);
  }, [question, initialAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim() && !isFeedbackState) {
      onSubmitAnswer(userAnswer.trim());
    }
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="font-headline text-2xl">
        Question {questionNumber} of {totalQuestions}
      </h2>
      <p className="text-lg whitespace-pre-wrap">{question.text}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="user-answer" className="text-md sr-only">Your Answer</Label>
          <Input
            id="user-answer"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isEvaluating || isFeedbackState}
            className="text-base py-2 px-3"
          />
        </div>
        {!isFeedbackState && (
          <Button type="submit" disabled={isEvaluating || !userAnswer.trim()} className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
          </Button>
        )}
      </form>
    </div>
  );
}
