'use server';

/**
 * @fileOverview A quiz answer evaluation AI agent.
 *
 * - evaluateQuizAnswer - A function that handles the quiz answer evaluation process.
 * - EvaluateQuizAnswerInput - The input type for the evaluateQuizAnswer function.
 * - EvaluateQuizAnswerOutput - The return type for the evaluateQuizAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateQuizAnswerInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  userAnswer: z.string().describe('The user\u2019s answer to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type EvaluateQuizAnswerInput = z.infer<typeof EvaluateQuizAnswerInputSchema>;

const EvaluateQuizAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user answered the question correctly.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  explanation: z
    .string()
    .describe('An explanation of why the user\u2019s answer was incorrect, if applicable.'),
});
export type EvaluateQuizAnswerOutput = z.infer<typeof EvaluateQuizAnswerOutputSchema>;

export async function evaluateQuizAnswer(input: EvaluateQuizAnswerInput): Promise<EvaluateQuizAnswerOutput> {
  return evaluateQuizAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateQuizAnswerPrompt',
  input: {schema: EvaluateQuizAnswerInputSchema},
  output: {schema: EvaluateQuizAnswerOutputSchema},
  prompt: `You are an expert quiz grader. You will evaluate the user's answer to a quiz question and determine if it is correct or incorrect.

Question: {{{question}}}
User's Answer: {{{userAnswer}}}
Correct Answer: {{{correctAnswer}}}

You will then provide the following information:

*   isCorrect: Whether the user answered the question correctly. Set to true if the user's answer is correct, and false otherwise.
*   correctAnswer: The correct answer to the question. Always provide the correct answer.
*   explanation: If the user's answer is incorrect, provide an explanation of why the user's answer was incorrect. If the user's answer is correct, this field should be left blank.
`,
});

const evaluateQuizAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateQuizAnswerFlow',
    inputSchema: EvaluateQuizAnswerInputSchema,
    outputSchema: EvaluateQuizAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
