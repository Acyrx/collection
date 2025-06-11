'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const QuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.').max(500, 'Question is too long.'),
});

type QuestionFormValues = z.infer<typeof QuestionSchema>;

type QuestionInputFormProps = {
  onSubmitQuestion: (question: string) => Promise<void>;
  isAnswering: boolean;
};

export function QuestionInputForm({ onSubmitQuestion, isAnswering }: QuestionInputFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: '',
    },
  });

  const handleSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
    await onSubmitQuestion(data.question);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start space-x-2 pt-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ask a question about your PDF..."
                  className="text-base md:text-sm"
                  disabled={isAnswering}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" disabled={isAnswering || !form.formState.isValid} aria-label="Send question">
          {isAnswering ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </Form>
  );
}
