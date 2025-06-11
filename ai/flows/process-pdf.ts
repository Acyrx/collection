'use server';

/**
 * @fileOverview Processes the uploaded PDF content, extracts text, and prepares it for semantic analysis using Gen AI.
 *
 * - processPdf - A function that handles the PDF processing.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessPdfInput = z.infer<typeof ProcessPdfInputSchema>;

const ProcessPdfOutputSchema = z.object({
  processedText: z
    .string()
    .describe('The extracted and processed text content from the PDF.'),
});
export type ProcessPdfOutput = z.infer<typeof ProcessPdfOutputSchema>;

export async function processPdf(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  return processPdfFlow(input);
}

const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfInputSchema},
  output: {schema: ProcessPdfOutputSchema},
  prompt: `You are an expert in processing PDF documents and extracting their content.

  Your task is to extract the text from the given PDF document and prepare it for semantic analysis. The PDF document is provided as a data URI.

  Here is the PDF document:

  {{media url=pdfDataUri}}

  Return the extracted text in the 'processedText' field.`, 
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async input => {
    const {output} = await processPdfPrompt(input);
    return output!;
  }
);
