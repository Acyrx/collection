
"use client";

import type { EvaluateQuizAnswerOutput } from '@/ai/flows/evaluate-quiz-answer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Info, HelpCircle } from 'lucide-react';

interface AnswerFeedbackProps {
  evaluation: EvaluateQuizAnswerOutput | null;
  pageNumber?: number;
}

export default function AnswerFeedback({ evaluation, pageNumber }: AnswerFeedbackProps) {
  if (!evaluation) return null;

  const { isCorrect, correctAnswer, explanation } = evaluation;

  return (
    <Alert variant={isCorrect ? 'default' : 'destructive'} className={`mt-6 rounded-lg shadow-md ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      {isCorrect ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
      <AlertTitle className={`font-headline text-xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </AlertTitle>
      <AlertDescription className={`space-y-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
        {correctAnswer && (
          <p>
            <strong className="font-medium">Correct Answer:</strong> <span className="font-code">{correctAnswer}</span>
          </p>
        )}
        {explanation && (
          <p>
            <strong className="font-medium">Explanation:</strong> {explanation}
          </p>
        )}
         {!explanation && !isCorrect && (
          <p>
            The AI determined your answer was not quite right.
          </p>
        )}
        {pageNumber !== undefined && pageNumber !== null && (
          <p className="mt-2">
            <Info className={`inline-block h-4 w-4 mr-1 align-text-bottom ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
            <strong className="font-medium">Reference:</strong> See page {pageNumber} of the document.
          </p>
        )}
        {!correctAnswer && (
             <p className="mt-2 flex items-center">
                <HelpCircle className={`inline-block h-4 w-4 mr-1 align-text-bottom ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                The AI did not provide a specific correct answer for this question.
            </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
