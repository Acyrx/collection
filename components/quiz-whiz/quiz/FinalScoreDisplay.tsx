"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface FinalScoreDisplayProps {
  score: number;
  totalQuestions: number;
}

export default function FinalScoreDisplay({ score, totalQuestions }: FinalScoreDisplayProps) {
  if (totalQuestions === 0) return null;
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <Card className="w-full max-w-md text-center shadow-xl">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <Award className="w-16 h-16 text-accent" />
        </div>
        <CardTitle className="font-headline text-3xl">Quiz Completed!</CardTitle>
        <CardDescription>Congratulations on finishing the quiz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-5xl font-bold text-primary">{percentage}%</p>
        <p className="text-xl text-muted-foreground">
          You answered {score} out of {totalQuestions} questions correctly.
        </p>
      </CardContent>
    </Card>
  );
}
