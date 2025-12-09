"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/utils/supabase/server";

export interface AIMessage {
  id: string;
  ai_tutor_id: string;
  user_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function saveAIMessage(
  aiTutorId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to save messages");
  }

  const { data, error } = await supabase
    .from("ai_chat_messages")
    .insert({
      ai_tutor_id: aiTutorId,
      user_id: user.id,
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving AI message:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function saveAIMessages(
  aiTutorId: string,
  sessionId: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to save messages");
  }

  const messagesToInsert = messages.map((msg) => ({
    ai_tutor_id: aiTutorId,
    user_id: user.id,
    session_id: sessionId,
    role: msg.role,
    content: msg.content,
  }));

  const { error } = await supabase
    .from("ai_chat_messages")
    .insert(messagesToInsert);

  if (error) {
    console.error("Error saving AI messages:", error.message);
    throw new Error(error.message);
  }

  return true;
}

export async function getAIHistory(
  aiTutorId: string,
  sessionId?: string
): Promise<AIMessage[]> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return [];

  let query = supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("ai_tutor_id", aiTutorId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching AI history:", error.message);
    return [];
  }

  return data || [];
}

