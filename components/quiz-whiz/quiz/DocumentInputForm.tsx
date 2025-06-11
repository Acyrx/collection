"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUp } from 'lucide-react';

interface DocumentInputFormProps {
  onStartQuiz: (file: File) => void;
  isLoading: boolean;
}

export default function DocumentInputForm({ onStartQuiz, isLoading }: DocumentInputFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      if (file) {
        // TODO: Consider using toast for this warning
        alert("Please select a PDF file.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onStartQuiz(selectedFile);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Quiz Whiz Content</CardTitle>
        <CardDescription className="text-center">
          Upload a PDF document to generate your quiz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload" className="text-lg">PDF Document</Label>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-center">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="border-primary focus:ring-primary flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isLoading}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground pt-1">
                Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {!selectedFile && (
                <p className="text-xs text-muted-foreground pt-1">
                    Please select a PDF file.
                </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
            {isLoading ? (
              <>
                <FileUp className="mr-2 h-4 w-4 animate-pulse" />
                Generating Quiz...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Start Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
