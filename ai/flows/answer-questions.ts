
'use server';

/**
 * @fileOverview Answers questions about the content of an uploaded PDF document.
 *
 * - answerQuestions - A function that takes a question and PDF content as input and returns an answer.
 * - AnswerQuestionsInput - The input type for the answerQuestions function.
 * - AnswerQuestionsOutput - The return type for the answerQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  pdfContent: z.string().describe('The content of the PDF document.'),
});

export type AnswerQuestionsInput = z.infer<typeof AnswerQuestionsInputSchema>;

const AnswerQuestionsOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      'The answer to the question based on the PDF content, including a reference to the page number where the information was found, if available. For example: "The capital is Paris. (Reference: Page 5)" or "The information is XYZ. (Reference: Page number not found in text)"'
    ),
});

export type AnswerQuestionsOutput = z.infer<typeof AnswerQuestionsOutputSchema>;

export async function answerQuestions(input: AnswerQuestionsInput): Promise<AnswerQuestionsOutput> {
  return answerQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsPrompt',
  input: {schema: AnswerQuestionsInputSchema},
  output: {schema: AnswerQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to answer questions based on the content of a provided PDF document.
Your primary task is to answer the user's question accurately using the PDF content.
After providing the answer, you MUST include a reference to the specific page number(s) from which the information was drawn.
If page numbers are not explicitly available or discernible in the provided text, state that the page number could not be determined.
Format the reference clearly at the end of your answer, for example: "The answer is XYZ. (Reference: Page 3)" or "The answer is ABC. (Reference: Page number not found in text)".

PDF Content:
{{{pdfContent}}}

Question:
{{{question}}}

Answer:`,
});

const answerQuestionsFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFlow',
    inputSchema: AnswerQuestionsInputSchema,
    outputSchema: AnswerQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
