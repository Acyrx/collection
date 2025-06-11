
"use client";

import { useState, useEffect } from 'react';
import type { QuizQuestion, UserQuizAnswer, QuizEvaluation, QuizState } from '@/types/quiz';
import { generateQuizQuestions, type GenerateQuizQuestionsInput } from '@/ai/flows/generate-quiz-questions';
import { evaluateQuizAnswer, type EvaluateQuizAnswerOutput } from '@/ai/flows/evaluate-quiz-answer';
import DocumentInputForm from './DocumentInputForm';
import QuestionDisplay from './QuestionDisplay';
import AnswerFeedback from './AnswerFeedback';
import ScoreDisplay from './ScoreDisplay';
import QuizControls from './QuizControls';
import FinalScoreDisplay from './FinalScoreDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  } catch (e) {
    console.error("Failed to set pdf.js workerSrc with new URL, falling back to CDN or default. Error:", e);
    const workerVersion = pdfjsLib.version || '4.4.175';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.mjs`;
  }
}


const MAX_QUESTIONS = 10;

export default function QuizContainer() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, EvaluateQuizAnswerOutput | null>>({});
  const [score, setScore] = useState<number>(0);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;

  const handleStartQuiz = async (file: File | null) => {
    if (!file) {
      toast({ title: "No File Selected", description: "Please select a PDF file to start the quiz.", variant: "destructive" });
      return;
    }
    
    setIsLoadingAi(true);
    setQuizState('generating_questions');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      
      const pagesContent: GenerateQuizQuestionsInput['pages'] = [];
      let documentIsEmpty = true;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as any).str).join(' ');
        if (pageText.trim()) {
          documentIsEmpty = false;
        }
        pagesContent.push({ pageNumber: i, content: pageText });
      }

      if (documentIsEmpty) {
        toast({ title: "Empty or Unreadable PDF", description: "The PDF appears to be empty or its text could not be extracted. Please try a different file.", variant: "destructive" });
        setQuizState('idle');
        setIsLoadingAi(false);
        return;
      }
      
      const result = await generateQuizQuestions({ pages: pagesContent });
      if (result.questions && result.questions.length > 0) {
        const formattedQuestions: QuizQuestion[] = result.questions.slice(0, MAX_QUESTIONS).map((qData, index) => ({
          id: `q-${index}`,
          text: qData.questionText,
          correctAnswer: qData.correctAnswer,
          pageNumber: qData.pageNumber,
        }));
        setQuestions(formattedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswers({});
        setEvaluations({});
        setQuizState('active_question');
      } else {
        toast({ title: "No Questions Generated", description: "The AI couldn't generate questions from the PDF content. Please try a different PDF or check if the PDF contains enough text.", variant: "destructive" });
        setQuizState('idle');
      }
    } catch (error) {
      console.error("Error processing PDF or generating questions:", error);
      let errorMessage = "Failed to process PDF or generate quiz questions. Please try again.";
      if (error instanceof Error) {
          if ((error as any).name === 'PasswordException' || (error as any).message?.includes('PasswordException')) {
              errorMessage = "The PDF is password protected. Please provide a PDF without password protection.";
          } else if ((error as any).message?.includes('Invalid PDF structure')) {
              errorMessage = "The PDF file seems to be corrupted or has an invalid structure.";
          } else if ((error as any).message?.includes('workerSrc')) {
             errorMessage = "Failed to load the PDF processing component. Please check your internet connection or try refreshing the page."
          }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setQuizState('idle');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setIsLoadingAi(true);
    setQuizState('evaluating_answer');
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    try {
      const evalResult = await evaluateQuizAnswer({
        question: currentQuestion.text,
        userAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer, // Use the actual correct answer
      });
      setEvaluations(prev => ({ ...prev, [currentQuestion.id]: evalResult }));
      if (evalResult.isCorrect) {
        setScore(prevScore => prevScore + 1);
      }
      setQuizState('answer_feedback');
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast({ title: "Error", description: "Failed to evaluate your answer. Please try again.", variant: "destructive" });
      setEvaluations(prev => ({ ...prev, [currentQuestion.id]: { isCorrect: false, correctAnswer: currentQuestion.correctAnswer, explanation: "Could not connect to evaluation service."} }));
      setQuizState('answer_feedback');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setQuizState('active_question');
    } else {
      setQuizState('completed');
    }
  };
  
  const handleShowResults = () => {
    setQuizState('completed');
  };

  const handleRetakeQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers({});
    setEvaluations({});
    setQuizState('idle');
  };
  
  const questionsAnswered = Object.keys(userAnswers).length;

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-screen">
      {quizState === 'idle' && (
        <DocumentInputForm onStartQuiz={handleStartQuiz} isLoading={isLoadingAi} />
      )}

      {(quizState === 'generating_questions' || (isLoadingAi && (quizState === 'evaluating_answer' || quizState === 'active_question'))) && (
        <div className="flex flex-col items-center justify-center text-center p-10 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-xl font-medium text-primary">
            {quizState === 'generating_questions' ? 'Generating your quiz from PDF...' : 'Thinking...'}
          </p>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {(quizState === 'active_question' || quizState === 'evaluating_answer' || quizState === 'answer_feedback') && currentQuestion && !isLoadingAi && (
        <Card className="w-full max-w-2xl shadow-xl animate-fadeIn">
          <CardHeader>
             <ScoreDisplay score={score} questionsAnswered={questionsAnswered - (quizState === 'active_question' || quizState === 'evaluating_answer' ? 1:0) } totalQuestions={questions.length} />
          </CardHeader>
          <CardContent className="space-y-6">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onSubmitAnswer={handleSubmitAnswer}
              isEvaluating={quizState === 'evaluating_answer' || isLoadingAi}
              isFeedbackState={quizState === 'answer_feedback'}
              initialAnswer={userAnswers[currentQuestion.id] || ''}
            />
            {quizState === 'answer_feedback' && currentEvaluation && (
              <AnswerFeedback 
                evaluation={currentEvaluation} 
                pageNumber={currentQuestion?.pageNumber}
              />
            )}
            <QuizControls
              quizState={quizState}
              onNextQuestion={handleNextQuestion}
              onShowResults={handleShowResults}
              onRetakeQuiz={handleRetakeQuiz}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
              isLoading={isLoadingAi}
            />
          </CardContent>
        </Card>
      )}

      {quizState === 'completed' && (
         <div className="flex flex-col items-center space-y-8 animate-fadeIn">
            <FinalScoreDisplay score={score} totalQuestions={questions.length} />
            <QuizControls
              quizState={quizState}
              onNextQuestion={handleNextQuestion}
              onShowResults={handleShowResults}
              onRetakeQuiz={handleRetakeQuiz}
              isLastQuestion={true} 
              isLoading={isLoadingAi}
            />
        </div>
      )}
      
      {quizState !== 'idle' && quizState !== 'generating_questions' && questions.length === 0 && !isLoadingAi && (
         <Card className="w-full max-w-lg shadow-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="font-headline text-2xl text-destructive mb-2">Quiz Generation Failed</CardTitle>
            <p className="text-muted-foreground mb-6">
              We couldn't generate any questions from the provided PDF. This could be due to an issue with the file, or the AI couldn't find suitable content. Please try again with a different PDF.
            </p>
            <Button onClick={handleRetakeQuiz}>Try Again</Button>
        </Card>
      )}
    </div>
  );
}

