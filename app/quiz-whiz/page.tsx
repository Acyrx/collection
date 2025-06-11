import QuizContainer from '@/components/quiz-whiz/quiz/QuizContainer';
import { BrainCircuit } from 'lucide-react';

export default function QuizPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
           <BrainCircuit className="h-12 w-12 text-primary mr-3" />
           <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">
            Quiz Whiz
           </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Your Interactive AI-Powered Quiz Assistant
        </p>
      </header>
      <QuizContainer />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Quiz Whiz. Powered by AI.</p>
      </footer>
    </main>
  );
}
