'use server';

/**
 * @fileOverview A flow to analyze if the content scraped from a URL is primarily educational.
 *
 * - analyzeEducationalContent - A function that analyzes the content and determines if it's educational.
 * - AnalyzeEducationalContentInput - The input type for the analyzeEducationalContent function.
 * - AnalyzeEducationalContentOutput - The return type for the analyzeEducationalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEducationalContentInputSchema = z.object({
  content: z
    .string()
    .describe('The content scraped from the URL to be analyzed.'),
  url: z.string().url().describe('The URL the content was scraped from.')
});
export type AnalyzeEducationalContentInput = z.infer<
  typeof AnalyzeEducationalContentInputSchema
>;

const AnalyzeEducationalContentOutputSchema = z.object({
  isEducational: z
    .boolean()
    .describe('Whether the content is primarily educational.'),
  reason: z
    .string()
    .describe('The reason why the content is educational or not.'),
});
export type AnalyzeEducationalContentOutput = z.infer<
  typeof AnalyzeEducationalContentOutputSchema
>;

export async function analyzeEducationalContent(
  input: AnalyzeEducationalContentInput
): Promise<AnalyzeEducationalContentOutput> {
  return analyzeEducationalContentFlow(input);
}

const analyzeEducationalContentPrompt = ai.definePrompt({
  name: 'analyzeEducationalContentPrompt',
  input: {schema: AnalyzeEducationalContentInputSchema},
  output: {schema: AnalyzeEducationalContentOutputSchema},
  prompt: `You are an AI expert in content analysis.
  Your task is to analyze the content scraped from a given URL and determine if it is primarily educational.
  Respond with a boolean value indicating whether the content is educational and provide a brief explanation for your decision.

  URL: {{{url}}}
  Content: {{{content}}}
  `,
});

const analyzeEducationalContentFlow = ai.defineFlow(
  {
    name: 'analyzeEducationalContentFlow',
    inputSchema: AnalyzeEducationalContentInputSchema,
    outputSchema: AnalyzeEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeEducationalContentPrompt(input);
    return output!;
  }
);
