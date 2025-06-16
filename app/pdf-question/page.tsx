'use client';

import { useState, useEffect } from 'react';
import { processPdf } from '@/ai/flows/process-pdf';
import { answerQuestions } from '@/ai/flows/answer-questions';
import { AppHeader } from '@/components/pdf-chat/layout/app-header';
import { PdfUploadForm } from '@/components/pdf-chat/pdf/pdf-upload-form';
import { ConversationDisplay, type Message } from '@/components/pdf-chat/qa/conversation-display';
import { QuestionInputForm } from '@/components/pdf-chat/qa/question-input-form';
import { PdfInfoCard } from '@/components/pdf-chat/pdf/pdf-info-card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function HomePage() {
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [processedPdfText, setProcessedPdfText] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handlePdfSubmit = async (dataUri: string) => {
    setIsProcessingPdf(true);
    setConversation([]); // Clear previous conversation

    // Extract filename for display, if possible (simple heuristic)
    try {
      const response = await fetch(dataUri);
      const blob = await response.blob();
      // This is a trick: create a File object to get its name, if it was embedded in data URI or from a File object
      // However, data URIs don't inherently store filenames. This relies on the input to PdfUploadForm being a File.
      // If not, originalFileName might remain null. The PdfUploadForm should ideally pass the filename.
      // For now, this might not work reliably for all data URIs.
      // A better approach is to pass filename from PdfUploadForm along with dataUri.
      // Let's assume PdfUploadForm can be modified or we just don't display filename.
      // For simplicity, we'll skip sophisticated filename extraction here.
    } catch (e) { /* ignore, filename not critical */ }


    try {
      const result = await processPdf({ pdfDataUri: dataUri });
      setPdfDataUri(dataUri);
      setProcessedPdfText(result.processedText);
      toast({
        title: 'PDF Processed',
        description: 'Your PDF has been successfully processed. You can now ask questions.',
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Processing Error',
        description: 'Failed to process the PDF. Please try again or use a different file.',
      });
      setPdfDataUri(null); // Ensure reset if processing fails
      setProcessedPdfText(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    if (!processedPdfText) {
      toast({
        variant: 'destructive',
        title: 'No PDF Loaded',
        description: 'Please upload and process a PDF before asking questions.',
      });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    
    // Add user message and a temporary loading message for AI
    const loadingAiMessageId = crypto.randomUUID();
    const loadingAiMessage: Message = {
      id: loadingAiMessageId,
      role: 'ai',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true,
    };

    setConversation((prev) => [...prev, userMessage, loadingAiMessage]);
    setIsAnsweringQuestion(true);

    try {
      const result = await answerQuestions({ question, pdfContent: processedPdfText });
      const aiResponseMessage: Message = {
        id: crypto.randomUUID(), // Or use loadingAiMessageId if preferred to replace
        role: 'ai',
        content: result.answer,
        timestamp: new Date(),
      };
      // Replace loading message with actual AI response
      setConversation((prev) => prev.map(msg => msg.id === loadingAiMessageId ? aiResponseMessage : msg ));

    } catch (error) {
      console.error('Error answering question:', error);
      const errorAiMessage: Message = {
        id: crypto.randomUUID(), // Or use loadingAiMessageId
        role: 'ai',
        content: 'Sorry, I encountered an error trying to answer that question. Please try again.',
        timestamp: new Date(),
      };
      setConversation((prev) => prev.map(msg => msg.id === loadingAiMessageId ? errorAiMessage : msg ));
      toast({
        variant: 'destructive',
        title: 'Error Answering Question',
        description: 'An AI error occurred. Please try asking a different question.',
      });
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  const handleReset = () => {
    setPdfDataUri(null);
    setOriginalFileName(null);
    setProcessedPdfText(null);
    setConversation([]);
    setIsProcessingPdf(false);
    setIsAnsweringQuestion(false);
    toast({
      title: 'Application Reset',
      description: 'The document and conversation have been cleared.',
    });
  };

  if (!isClient) {
    // Render skeleton or loading state for SSR/initial load
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-36 rounded" />
            </div>
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </header>
        <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
          <Skeleton className="w-full max-w-lg h-96 rounded-lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onReset={handleReset} isResetEnabled={!!pdfDataUri} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        {!processedPdfText ? (
          <div className="w-full max-w-lg mt-8 sm:mt-12">
            <PdfUploadForm onPdfSubmit={handlePdfSubmit} isProcessing={isProcessingPdf} />
          </div>
        ) : (
          <div className="w-full max-w-3xl flex flex-col space-y-4 flex-grow h-full">
            <PdfInfoCard fileName={originalFileName || undefined} />
            <ConversationDisplay messages={conversation} />
            <QuestionInputForm onSubmitQuestion={handleQuestionSubmit} isAnswering={isAnsweringQuestion} />
          </div>
        )}
      </main>
    </div>
  );
}
