'use client';

import type React from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const PdfUploadSchema = z.object({
  pdfFile: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, 'A PDF file is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
});

type PdfUploadFormValues = z.infer<typeof PdfUploadSchema>;

type PdfUploadFormProps = {
  onPdfSubmit: (dataUri: string) => Promise<void>;
  isProcessing: boolean;
};

export function PdfUploadForm({ onPdfSubmit, isProcessing }: PdfUploadFormProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PdfUploadFormValues>({
    resolver: zodResolver(PdfUploadSchema),
  });

  const onSubmit: SubmitHandler<PdfUploadFormValues> = async (data) => {
    const file = data.pdfFile[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        await onPdfSubmit(dataUri);
      } else {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the PDF file. Please try again.",
        });
      }
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "An error occurred while reading the file.",
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      form.setValue('pdfFile', files, { shouldValidate: true });
    } else {
      setSelectedFileName(null);
      form.setValue('pdfFile', undefined, { shouldValidate: true });
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
          <UploadCloud className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl">Upload Your PDF</CardTitle>
        <CardDescription>
          Securely upload a PDF document to start asking questions about its content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pdfFile"
              render={() => (
                <FormItem>
                  <FormLabel htmlFor="pdfFile-input" className="sr-only">PDF File</FormLabel>
                  <FormControl>
                    <Label 
                      htmlFor="pdfFile-input"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/70 border-primary/30 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF (MAX. 5MB)</p>
                        {selectedFileName && <p className="text-xs text-primary mt-1">{selectedFileName}</p>}
                      </div>
                      <Input 
                        id="pdfFile-input" 
                        type="file" 
                        className="hidden" 
                        accept={ACCEPTED_FILE_TYPES.join(',')}
                        onChange={handleFileChange}
                        disabled={isProcessing}
                      />
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isProcessing || !form.formState.isValid}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process PDF'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
