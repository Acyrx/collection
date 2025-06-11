'use server';

/**
 * @fileOverview PDF summarization AI agent.
 *
 * - summarizePdf - A function that handles the PDF summarization process.
 * - SummarizePdfInput - The input type for the summarizePdf function.
 * - SummarizePdfOutput - The return type for the summarizePdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type SummarizePdfInput = z.infer<typeof SummarizePdfInputSchema>;

const SummarizePdfOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document.'),
  keywords: z.array(z.object({word: z.string(), frequency: z.number()})).describe('Keywords with their occurrence frequencies.'),
});
export type SummarizePdfOutput = z.infer<typeof SummarizePdfOutputSchema>;

export async function summarizePdf(input: SummarizePdfInput): Promise<SummarizePdfOutput> {
  return summarizePdfFlow(input);
}

const summarizePdfPrompt = ai.definePrompt({
  name: 'summarizePdfPrompt',
  input: {schema: SummarizePdfInputSchema},
  output: {schema: SummarizePdfOutputSchema},
  prompt: `You are an expert AI assistant specializing in summarizing PDF documents and extracting key information.

You will receive a PDF document as input. Your task is to:

1.  Provide a concise and meaningful summary of the PDF's content.
2.  Identify and list the keywords that reflect the key topics discussed in the PDF, along with their occurrence frequencies.

Here is the PDF document:

{{media url=pdfDataUri}}`,
});

const summarizePdfFlow = ai.defineFlow(
  {
    name: 'summarizePdfFlow',
    inputSchema: SummarizePdfInputSchema,
    outputSchema: SummarizePdfOutputSchema,
  },
  async input => {
    const {output} = await summarizePdfPrompt(input);
    return output!;
  }
);
