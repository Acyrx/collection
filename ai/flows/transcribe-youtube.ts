'use server';

/**
 * @fileOverview A flow for transcribing audio from YouTube videos.
 *
 * - transcribeAudioFromYoutube - A function that handles the transcription process.
 * - TranscribeAudioFromYoutubeInput - The input type for the transcribeAudioFromYoutube function.
 * - TranscribeAudioFromYoutubeOutput - The return type for the transcribeAudioFromYoutube function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioFromYoutubeInputSchema = z.object({
  youtubeLink: z.string().describe('The link to the YouTube video to transcribe.'),
});
export type TranscribeAudioFromYoutubeInput = z.infer<
  typeof TranscribeAudioFromYoutubeInputSchema
>;

const TranscribeAudioFromYoutubeOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the YouTube video.'),
});
export type TranscribeAudioFromYoutubeOutput = z.infer<
  typeof TranscribeAudioFromYoutubeOutputSchema
>;

export async function transcribeAudioFromYoutube(
  input: TranscribeAudioFromYoutubeInput
): Promise<TranscribeAudioFromYoutubeOutput> {
  return transcribeAudioFromYoutubeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeAudioFromYoutubePrompt',
  input: {schema: TranscribeAudioFromYoutubeInputSchema},
  output: {schema: TranscribeAudioFromYoutubeOutputSchema},
  prompt: `You are an AI expert in transcribing audio to text. Please transcribe the audio from the following YouTube video: {{{youtubeLink}}}. Provide only the transcription. Do not include any additional information or context.`,
});

const transcribeAudioFromYoutubeFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFromYoutubeFlow',
    inputSchema: TranscribeAudioFromYoutubeInputSchema,
    outputSchema: TranscribeAudioFromYoutubeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
