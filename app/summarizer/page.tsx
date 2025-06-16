'use client';

import { useState, type ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { summarizePdf, type SummarizePdfOutput } from '@/ai/flows/summarize';
import { fileToDataUri } from '@/lib/file-utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SummaryCard } from '@/components/summarize/SummaryCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, AlertCircle, Sparkles, BookOpen, FileText, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isHovered, setIsHovered] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Sparkles className="h-8 w-8" />
              </div>
              <CardTitle className="font-bold text-3xl md:text-4xl tracking-tight">
                AI-Powered PDF Summarizer
              </CardTitle>
              <CardDescription className="text-white/90 text-lg max-w-lg">
                Transform lengthy documents into concise summaries with our advanced AI technology
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-6 flex md:flex-row sm:flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pdfFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-gray-700">
                            Upload your PDF
                          </FormLabel>
                          <FormControl>
                            <div 
                              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                                form.getValues('pdfFile') 
                                  ? 'border-green-500 bg-green-50' 
                                  : isHovered 
                                    ? 'border-indigo-400 bg-indigo-50' 
                                    : 'border-gray-300 hover:border-indigo-300'
                              }`}
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                              onClick={() => document.querySelector('input[type="file"]')?.click()}
                            >
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <FileText className={`h-10 w-10 ${
                                  form.getValues('pdfFile') ? 'text-green-500' : 'text-indigo-500'
                                }`} />
                                <p className="text-sm text-gray-600">
                                  {form.getValues('pdfFile') 
                                    ? `Selected: ${form.getValues('pdfFile').name}`
                                    : 'Click to browse or drag & drop'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  PDF files up to 5MB
                                </p>
                              </div>
                              <Input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.files)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <motion.div whileHover={{ scale: 1.01 }}>
                      <Button 
                        type="submit" 
                        disabled={processing} 
                        className={`w-full py-7 rounded-xl text-lg font-semibold shadow-lg transition-all ${
                          processing 
                            ? 'bg-indigo-400' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Analyzing Document...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-3 h-5 w-5" />
                            Generate AI Summary
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      <Alert variant="destructive" className="rounded-xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Processing Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-indigo-600" />
                  How It Works
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-700">
                      Upload your PDF document (research papers, reports, articles)
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-700">
                      Our AI analyzes the content and identifies key points
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-700">
                      Receive a concise summary with main ideas and insights
                    </p>
                  </li>
                </ul>
                
                <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                    Pro Tip
                  </h4>
                  <p className="text-sm text-gray-600">
                    For best results, use well-structured documents with clear headings. 
                    The AI performs best on academic papers, business reports, and news articles.
                  </p>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {summaryData && !processing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 ml-4 max-w-4xl"
                >
                  <SummaryCard summaryData={summaryData} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure processing • No files stored permanently • Powered by advanced AI</p>
        </div>
      </motion.div>
    </div>
  );
}