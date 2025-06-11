'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

type ConversationDisplayProps = {
  messages: Message[];
};

export function ConversationDisplay({ messages }: ConversationDisplayProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] w-full rounded-md border shadow-inner bg-background" ref={scrollAreaRef}>
       <div className="p-4 space-y-6" ref={viewportRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-end space-x-3 animate-in fade-in-50 slide-in-from-bottom-5 duration-300',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'ai' && (
              <Avatar className="h-8 w-8 self-start shadow">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <Card
              className={cn(
                'max-w-[70%] rounded-2xl shadow-md',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground rounded-bl-none'
              )}
            >
              <CardContent className="p-3 text-sm">
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  // Using <pre> for preserving whitespace, useful for multi-line answers
                  <pre className="whitespace-pre-wrap font-body">{message.content}</pre>
                )}
              </CardContent>
            </Card>
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 self-start shadow">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Bot className="h-16 w-16 mb-4 text-primary/50" />
            <p className="text-lg font-medium">Ready to answer your questions!</p>
            <p className="text-sm">Once your PDF is processed, ask me anything about its content.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
