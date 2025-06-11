'use server';
/**
 * @fileOverview Extracts keywords and their frequencies from a given text.
 *
 * - extractKeywords - A function that handles the keyword extraction process.
 * - ExtractKeywordsInput - The input type for the extractKeywords function.
 * - ExtractKeywordsOutput - The return type for the extractKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeywordsInputSchema = z.object({
  text: z.string().describe('The text from which to extract keywords.'),
});
export type ExtractKeywordsInput = z.infer<typeof ExtractKeywordsInputSchema>;

const ExtractKeywordsOutputSchema = z.array(
  z.object({
    keyword: z.string().describe('The extracted keyword.'),
    frequency: z.number().describe('The number of times the keyword appears in the text.'),
  })
);
export type ExtractKeywordsOutput = z.infer<typeof ExtractKeywordsOutputSchema>;

export async function extractKeywords(input: ExtractKeywordsInput): Promise<ExtractKeywordsOutput> {
  return extractKeywordsFlow(input);
}

const extractKeywordsPrompt = ai.definePrompt({
  name: 'extractKeywordsPrompt',
  input: {schema: ExtractKeywordsInputSchema},
  output: {schema: ExtractKeywordsOutputSchema},
  prompt: `You are an expert at extracting keywords from text.

  Given the following text, extract a list of keywords and their frequencies.
  Return a JSON array of objects, where each object has a "keyword" and a "frequency" field.

  Text: {{{text}}}`,
});

const extractKeywordsFlow = ai.defineFlow(
  {
    name: 'extractKeywordsFlow',
    inputSchema: ExtractKeywordsInputSchema,
    outputSchema: ExtractKeywordsOutputSchema,
  },
  async input => {
    const {output} = await extractKeywordsPrompt(input);
    return output!;
  }
);
