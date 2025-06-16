
"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2 } from "lucide-react";
import { transcribeAudioFromFile, type TranscribeAudioInput } from '@/ai/flows/transcribe-audio';
import { TranscriptionResult } from './TranscriptionResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

export default function FileTranscriptionTab() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Max file size: 50MB (adjust as needed)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit.");
        setFile(null);
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setError(null); 
      setTranscription(""); // Clear previous transcription
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
      toast({
        title: "No File Selected",
        description: "Please select an audio or video file to transcribe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscription("");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const audioDataUri = e.target?.result as string;
        if (!audioDataUri) {
          throw new Error("Failed to read file data.");
        }
        
        const input: TranscribeAudioInput = { audioDataUri };
        const result = await transcribeAudioFromFile(input);
        setTranscription(result.transcription);
        toast({
          title: "Transcription Complete",
          description: "Your file has been successfully transcribed.",
        });
      } catch (err: any) {
        console.error("Transcription error (inside onload):", err);
        const errorMessage = err.message || "An unknown error occurred during transcription.";
        setError(errorMessage);
        toast({
          title: "Transcription Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("File reading error:");
      const errorMessage = "Error reading file. Please try again.";
      setError(errorMessage);
      toast({
        title: "File Read Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Upload Audio/Video File</CardTitle>
          <CardDescription>
            Select an audio or video file (e.g., MP3, WAV, MP4, MOV) to transcribe. Max 50MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file-upload" className="font-medium">Choose File</Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept="audio/*,video/*" 
              onChange={handleFileChange} 
              className="border-input focus:ring-accent file:text-sm file:font-semibold file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-3 file:py-1.5 hover:file:bg-primary/20"
              aria-describedby="file-upload-help"
            />
            <p id="file-upload-help" className="text-sm text-muted-foreground">
              {file ? `Selected: ${file.name}` : "No file chosen."}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading || !file} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Transcribe File
          </Button>
        </CardContent>
      </Card>

      <TranscriptionResult
        title="File Transcription Result"
        transcription={transcription}
        isLoading={isLoading}
        error={error}
        onRetry={handleSubmit}
      />
    </div>
  );
}
