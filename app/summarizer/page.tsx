'use client';

import { useState, type ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { summarizePdf, type SummarizePdfOutput } from '@/ai/flows/summarize-pdf';
import { fileToDataUri } from '@/lib/file-utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SummaryCard } from '@/components/summarize/SummaryCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, AlertCircle, Sparkles } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  pdfFile: z
    .custom<FileList>()
    .refine((fileList) => fileList && fileList.length > 0, 'PDF file is required.')
    .transform((fileList) => fileList[0])
    .refine((file) => file.type === 'application/pdf', 'File must be a PDF.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / (1024*1024)}MB.`),
});

type FormValues = z.infer<typeof formSchema>;

export default function PdfSummarizerPage() {
  const [processing, setProcessing] = useState(false);
  const [summaryData, setSummaryData] = useState<SummarizePdfOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdfFile: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setProcessing(true);
    setError(null);
    setSummaryData(null);

    try {
      const pdfFile = data.pdfFile;
      if (!pdfFile) {
        throw new Error('No file selected');
      }

      const pdfDataUri = await fileToDataUri(pdfFile);
      const result = await summarizePdf({ pdfDataUri });
      setSummaryData(result);
      toast({
        title: 'Success!',
        description: 'Your PDF has been summarized.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Summarization error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to summarize PDF: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8" />
            <CardTitle className="font-headline text-3xl">PDF Summarizer AI</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 pt-2">
            Upload your PDF to get a concise summary and key insights powered by AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pdfFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Upload PDF</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={processing} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-5 w-5" />
                    Summarize PDF
                  </>
                )}
              </Button>
            </form>
          </Form>

          {error && (
            <Alert variant="destructive" className="mt-6 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summaryData && !processing && (
            <div className="mt-8">
              <SummaryCard summaryData={summaryData} />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-secondary/50 border-t">
          <p className="text-xs text-muted-foreground text-center w-full">
            Ensure your PDF is clear and machine-readable for best results. Max file size: 5MB.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
