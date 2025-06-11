import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions.ts';
import '@/ai/flows/process-pdf.ts';
import '@/ai/flows/summarize-pdf.ts';
import '@/ai/flows/extract-keywords.ts';
import '@/ai/flows/evaluate-quiz-answer.ts';
import '@/ai/flows/generate-quiz-questions.ts';