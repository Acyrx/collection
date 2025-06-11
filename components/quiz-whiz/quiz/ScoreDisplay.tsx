"use client";

import { Progress } from '@/components/ui/progress';

interface ScoreDisplayProps {
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export default function ScoreDisplay({ score, questionsAnswered, totalQuestions }: ScoreDisplayProps) {
  if (totalQuestions === 0) return null;
  
  const percentage = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;
  const progressPercentage = Math.round((questionsAnswered / totalQuestions) * 100);

  return (
    <div className="w-full space-y-3 p-4 bg-secondary/50 rounded-lg shadow">
      <div className="flex justify-between items-center font-medium">
        <span className="text-lg font-headline">Current Score</span>
        <span className="text-lg text-primary">{score} / {questionsAnswered} correct</span>
      </div>
      {questionsAnswered > 0 && (
         <div className="flex justify-between items-center">
            <span>Overall Accuracy:</span>
            <span className="text-primary font-semibold">{percentage}%</span>
         </div>
      )}
      <Progress value={progressPercentage} className="w-full h-3 [&>div]:bg-primary" />
      <p className="text-sm text-muted-foreground text-right">
        {questionsAnswered} of {totalQuestions} questions answered
      </p>
    </div>
  );
}
