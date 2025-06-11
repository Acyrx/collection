import { FileText, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AppHeaderProps = {
  onReset: () => void;
  isResetEnabled: boolean;
};

export function AppHeader({ onReset, isResetEnabled }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">PDF Insight</h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={!isResetEnabled}
          aria-label="Reset Application"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
