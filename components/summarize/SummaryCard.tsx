import type { SummarizePdfOutput } from '@/ai/flows/summarize-pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SummaryCardProps {
  summaryData: SummarizePdfOutput;
}

export function SummaryCard({ summaryData }: SummaryCardProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 rounded-md border p-4">
          <p className="text-foreground/90 leading-relaxed">{summaryData.summary}</p>
        </ScrollArea>
      </CardContent>

      <CardHeader>
        <CardTitle className="font-headline text-2xl">Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 rounded-md border p-4">
          {summaryData.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summaryData.keywords.map((keywordObj, index) => (
                <Badge key={index} variant="secondary" className="font-code text-sm px-3 py-1">
                  {keywordObj.word} ({keywordObj.frequency})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No keywords extracted.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
