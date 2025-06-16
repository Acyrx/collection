'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, Info, SearchIcon } from 'lucide-react';
import { scrapeAndAnalyzeUrl, type ScrapeResult } from '@/lib/actions/actions';
import { useToast } from "@/hooks/use-toast";


type FormState =
  | { type: 'idle' }
  | { type: 'loading' }
  | ({ type: 'result' } & ScrapeResult);

export default function EduScraperClientPage() {
  const [url, setUrl] = useState('');
  const [formState, setFormState] = useState<FormState>({ type: 'idle' });
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Basic client-side URL validation
      new URL(url);
    } catch (_) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setFormState({ type: 'loading' });
    try {
      const result = await scrapeAndAnalyzeUrl(url);
      setFormState({ type: 'result', ...result });
      if (!result.success) {
         toast({
            title: "Processing Error",
            description: result.error,
            variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setFormState({ type: 'result', success: false, error: errorMessage });
      toast({
        title: "Application Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <main className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">EduScraper</h1>
          <p className="text-muted-foreground mt-2">
            Enter a URL to scrape its content and analyze if it's primarily educational.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Submit URL for Analysis</CardTitle>
            <CardDescription>Provide a web page URL to begin the scraping and analysis process.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="url"
                placeholder="e.g., https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={formState.type === 'loading'}
                aria-label="URL to scrape"
                className="text-base"
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={formState.type === 'loading'}
              >
                {formState.type === 'loading' ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-5 w-5" />
                )}
                Scrape & Analyze
              </Button>
            </form>
          </CardContent>
        </Card>

        {formState.type === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-3 text-center p-6 rounded-lg bg-card shadow-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">Analyzing Content</p>
            <p className="text-muted-foreground">Please wait, this may take a few moments...</p>
          </div>
        )}

        {formState.type === 'result' && !formState.success && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        {formState.type === 'result' && formState.success && formState.educational && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <CheckCircle className="mr-2 h-6 w-6" />
                Educational Content Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{formState.summary}</p>
            </CardContent>
          </Card>
        )}

        {formState.type === 'result' && formState.success && !formState.educational && (
           <Alert className="border-accent text-accent shadow-md bg-accent/5">
            <Info className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent font-semibold">Content Analysis Result</AlertTitle>
            <AlertDescription className="text-accent/90">{formState.reason}</AlertDescription>
          </Alert>
        )}
      </main>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduScraper. Built with passion and AI.</p>
      </footer>
    </div>
  );
}
