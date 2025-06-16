// Summarizes scraped educational content from a given URL.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEducationalContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the educational content to summarize.'),
  scrapedContent: z.string().describe('The scraped content from the URL.'),
});
export type SummarizeEducationalContentInput = z.infer<typeof SummarizeEducationalContentInputSchema>;

const SummarizeEducationalContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the educational content.'),
});
export type SummarizeEducationalContentOutput = z.infer<typeof SummarizeEducationalContentOutputSchema>;

export async function summarizeEducationalContent(
  input: SummarizeEducationalContentInput
): Promise<SummarizeEducationalContentOutput> {
  return summarizeEducationalContentFlow(input);
}

const summarizeEducationalContentPrompt = ai.definePrompt({
  name: 'summarizeEducationalContentPrompt',
  input: {schema: SummarizeEducationalContentInputSchema},
  output: {schema: SummarizeEducationalContentOutputSchema},
  prompt: `Summarize the following educational content from {{url}}:\n\n{{scrapedContent}}`,
});

const summarizeEducationalContentFlow = ai.defineFlow(
  {
    name: 'summarizeEducationalContentFlow',
    inputSchema: SummarizeEducationalContentInputSchema,
    outputSchema: SummarizeEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await summarizeEducationalContentPrompt(input);
    return output!;
  }
);
