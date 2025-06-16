
"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Youtube, Loader2 } from "lucide-react";
import { transcribeAudioFromYoutube, type TranscribeAudioFromYoutubeInput } from '@/ai/flows/transcribe-youtube';
import { TranscriptionResult } from './TranscriptionResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

// Basic YouTube URL validation
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&\S*)?$/;


export default function YoutubeTranscriptionTab() {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const { toast } = useToast();

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeLink(event.target.value);
    if (error) setError(null); // Clear error when user types
    setTranscription(""); // Clear previous transcription
  };
  
  const handleSubmit = async () => {
    if (!youtubeLink.trim()) {
      setError("Please enter a YouTube video link.");
      toast({
        title: "No Link Provided",
        description: "Please enter a valid YouTube video link.",
        variant: "destructive",
      });
      return;
    }

    if (!YOUTUBE_URL_REGEX.test(youtubeLink)) {
        setError("Invalid YouTube URL format. Please provide a valid video link.");
        toast({
          title: "Invalid URL",
          description: "The YouTube link format is incorrect.",
          variant: "destructive",
        });
        return;
    }


    setIsLoading(true);
    setError(null);
    setTranscription("");

    try {
      const input: TranscribeAudioFromYoutubeInput = { youtubeLink };
      const result = await transcribeAudioFromYoutube(input);
      setTranscription(result.transcription);
      toast({
        title: "Transcription Complete",
        description: "The YouTube video has been successfully transcribed.",
      });
    } catch (err: any) {
      console.error("Transcription error:", err);
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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Transcribe from YouTube</CardTitle>
          <CardDescription>
            Enter a link to a YouTube video to transcribe its audio content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="youtube-link" className="font-medium">YouTube Video Link</Label>
            <Input 
              id="youtube-link" 
              type="url" 
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
              value={youtubeLink}
              onChange={handleLinkChange}
              className="border-input focus:ring-accent"
              aria-label="YouTube video link"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Youtube className="mr-2 h-4 w-4" />
            )}
            Transcribe Video
          </Button>
        </CardContent>
      </Card>

      <TranscriptionResult
        title="YouTube Transcription Result"
        transcription={transcription}
        isLoading={isLoading}
        error={error}
        onRetry={handleSubmit}
      />
    </div>
  );
}
