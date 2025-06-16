"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, FileText, ListVideo, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranscriptionResultProps {
  transcription: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  title: string;
}

export function TranscriptionResult({
  transcription: initialTranscription,
  isLoading,
  error,
  onRetry,
  title
}: TranscriptionResultProps) {
  const [editedTranscription, setEditedTranscription] = useState(initialTranscription);

  useEffect(() => {
    setEditedTranscription(initialTranscription);
  }, [initialTranscription]);

  const handleDownload = (format: "txt" | "srt") => {
    let content = editedTranscription;
    let filename = "transcription";
    let mimeType = "text/plain";

    if (format === "srt") {
      // Simplified SRT: Full text as one segment with placeholder duration
      const duration = "00:05:00,000"; // 5 minutes placeholder
      content = `1\n00:00:00,000 --> ${duration}\n${editedTranscription.replace(/\n\n/g, '\n')}\n`;
      filename += ".srt";
      mimeType = "application/x-subrip";
    } else {
      filename += ".txt";
    }

    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 rounded-md border border-dashed">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="mt-4 text-muted-foreground">Transcription in progress...</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {onRetry && (
                 <Button variant="link" onClick={onRetry} className="p-0 h-auto mt-2 text-destructive-foreground">
                   Try again?
                 </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && initialTranscription && (
          <>
            <Textarea
              value={editedTranscription}
              onChange={(e) => setEditedTranscription(e.target.value)}
              placeholder="Transcription will appear here..."
              rows={15}
              className="border-input focus:ring-accent font-body"
              aria-label="Transcription text"
            />
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
              <Button onClick={() => handleDownload("txt")} variant="outline" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                <FileText className="mr-2 h-4 w-4" /> Download .txt
              </Button>
              <Button onClick={() => handleDownload("srt")} variant="outline" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                <ListVideo className="mr-2 h-4 w-4" /> Download .srt
              </Button>
            </div>
          </>
        )}
         {!isLoading && !error && !initialTranscription && (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-md border border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your transcription will appear here once processed.</p>
                <p className="text-sm text-muted-foreground mt-1">Upload a file or provide a YouTube link to get started.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
