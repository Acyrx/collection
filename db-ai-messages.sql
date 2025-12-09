-- Create ai_chat_messages table to store AI assistant conversation history
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_tutor_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_ai_tutor_id ON public.ai_chat_messages(ai_tutor_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON public.ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own AI chat messages" ON public.ai_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI chat messages" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chat messages" ON public.ai_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

