import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

type PdfInfoCardProps = {
  fileName?: string; // Optional: display the name of the loaded PDF
};

export function PdfInfoCard({ fileName }: PdfInfoCardProps) {
  return (
    <Card className="w-full max-w-2xl mb-6 bg-primary/5 border-primary/20 shadow-md">
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0" />
        <div>
          <CardTitle className="font-headline text-xl text-primary">Document Ready</CardTitle>
          <CardDescription className="text-primary/80">
            {fileName ? `"${fileName}" is loaded. ` : 'Your PDF is loaded. '}
            You can now ask questions below.
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
