"use server";

import { createClient, getUser } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateCompanionData {
  title: string;
  topic: string;
  subject: string;
  duration: number;
  voice: string;
  style: string;
  audience: string;
  color?: string;
}

export interface Companion {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  subject: string;
  duration: number;
  color: string | null;
  style: string | null;
  voice: string | null;
  audience: string | null;
  created_at: string;
  bookmarked?: boolean;
}

// Create a new companion
export async function createCompanion(formData: CreateCompanionData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to create a companion");
  }

  const { data, error } = await supabase
    .from("companions")
    .insert({
      ...formData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating companion:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/");
  return data;
}

// Get all companions for the current user
export async function getUserCompanions(): Promise<Companion[]> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    return [];
  }

  const { data: companions, error } = await supabase
    .from("companions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching companions:", error.message);
    return [];
  }

  // Get bookmarks for the user
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("companion_id")
    .eq("user_id", user.id);

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.companion_id) || []);

  return companions.map((c) => ({
    ...c,
    bookmarked: bookmarkedIds.has(c.id),
  }));
}

// Get a single companion
export async function getCompanion(id: string): Promise<Companion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching companion:", error.message);
    return null;
  }

  return data;
}

// Delete a companion
export async function deleteCompanion(id: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to delete a companion");
  }

  const { error } = await supabase
    .from("companions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  return true;
}

// Add to session history (recently searched/viewed) - max 4 per user
export async function addToSessionHistory(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return;

  // First, check how many entries the user has
  const { data: existingEntries } = await supabase
    .from("session_history")
    .select("id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // If companion already in history, update its timestamp
  const { data: existing } = await supabase
    .from("session_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("companion_id", companionId)
    .single();

  if (existing) {
    // Update timestamp to move it to front
    await supabase.from("session_history").delete().eq("id", existing.id);
  }

  // If user has 4 or more entries, delete the oldest one(s)
  if (existingEntries && existingEntries.length >= 4) {
    const entriesToDelete = existingEntries.slice(
      0,
      existingEntries.length - 3
    );
    for (const entry of entriesToDelete) {
      await supabase.from("session_history").delete().eq("id", entry.id);
    }
  }

  // Insert new entry
  await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: user.id,
  });

  revalidatePath("/");
}

// Get recent session history (max 4)
export async function getRecentSessions(): Promise<Companion[]> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return [];

  const { data, error } = await supabase
    .from("session_history")
    .select(
      `
      companion_id,
      companions:companion_id (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching recent sessions:", error.message);
    return [];
  }

  return data
    .map(({ companions }) => companions as unknown as Companion)
    .filter(Boolean);
}

// Toggle bookmark
export async function toggleBookmark(
  companionId: string,
  isBookmarked: boolean
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to bookmark");
  }

  if (isBookmarked) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("companion_id", companionId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  } else {
    // Add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      companion_id: companionId,
      user_id: user.id,
    });

    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}

// Search companions with filters
export async function searchCompanions({
  query,
  subject,
}: {
  query?: string;
  subject?: string;
}): Promise<Companion[]> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return [];

  let dbQuery = supabase.from("companions").select("*").eq("user_id", user.id);

  if (subject && subject !== "all") {
    dbQuery = dbQuery.ilike("subject", `%${subject}%`);
  }

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,topic.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error searching companions:", error.message);
    return [];
  }

  // Get bookmarks
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("companion_id")
    .eq("user_id", user.id);

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.companion_id) || []);

  return data.map((c) => ({
    ...c,
    bookmarked: bookmarkedIds.has(c.id),
  }));
}

export interface ChatMessage {
  id: string;
  companion_id: string;
  user_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function saveChatMessage(
  companionId: string,
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
    .from("chat_messages")
    .insert({
      companion_id: companionId,
      user_id: user.id,
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function saveChatMessages(
  companionId: string,
  sessionId: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to save messages");
  }

  const messagesToInsert = messages.map((msg) => ({
    companion_id: companionId,
    user_id: user.id,
    session_id: sessionId,
    role: msg.role,
    content: msg.content,
  }));

  const { error } = await supabase
    .from("chat_messages")
    .insert(messagesToInsert);

  if (error) {
    console.error("Error saving messages:", error.message);
    throw new Error(error.message);
  }

  return true;
}

export async function getChatHistory(
  companionId: string,
  sessionId?: string
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return [];

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching chat history:", error.message);
    return [];
  }

  return data || [];
}

export async function getCompanionSessions(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("session_id, created_at")
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error.message);
    return [];
  }

  // Group by session_id and get unique sessions
  const sessionsMap = new Map<string, string>();
  data?.forEach((msg) => {
    if (!sessionsMap.has(msg.session_id)) {
      sessionsMap.set(msg.session_id, msg.created_at);
    }
  });

  return Array.from(sessionsMap.entries()).map(([sessionId, createdAt]) => ({
    session_id: sessionId,
    created_at: createdAt,
  }));
}

// Get all chat messages for a specific companion
export async function getChatMessages(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to view messages");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error.message);
    throw new Error(error.message);
  }

  // Format the data to match the Message interface
  const formattedMessages = (data || []).map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    sessionId: msg.session_id,
  }));

  return formattedMessages;
}

// Get chat messages for a specific session
export async function getChatMessagesBySession(
  companionId: string,
  sessionId: string
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to view messages");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("companion_id", companionId)
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching session messages:", error.message);
    throw new Error(error.message);
  }

  const formattedMessages = (data || []).map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    sessionId: msg.session_id,
  }));

  return formattedMessages;
}

// Get chat statistics for a companion
export async function getChatStatistics(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to view statistics");
  }

  // Get total messages count
  const { count: totalMessages, error: countError } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("companion_id", companionId)
    .eq("user_id", user.id);

  if (countError) {
    console.error("Error counting messages:", countError.message);
    throw new Error(countError.message);
  }

  // Get user messages count
  const { count: userMessages, error: userError } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .eq("role", "user");

  if (userError) {
    console.error("Error counting user messages:", userError.message);
    throw new Error(userError.message);
  }

  // Get assistant messages count
  const { count: assistantMessages, error: assistantError } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .eq("role", "assistant");

  if (assistantError) {
    console.error("Error counting assistant messages:", assistantError.message);
    throw new Error(assistantError.message);
  }

  // Get unique session count
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("chat_messages")
    .select("session_id")
    .eq("companion_id", companionId)
    .eq("user_id", user.id);

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError.message);
    throw new Error(sessionsError.message);
  }

  const uniqueSessions = new Set(
    (sessionsData || []).map((msg) => msg.session_id)
  );

  // Get first and last message dates
  const { data: datesData, error: datesError } = await supabase
    .from("chat_messages")
    .select("created_at")
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (datesError) {
    console.error("Error fetching dates:", datesError.message);
    throw new Error(datesError.message);
  }

  const firstMessageDate =
    datesData && datesData.length > 0
      ? new Date(datesData[0].created_at)
      : null;

  const { data: lastDateData, error: lastDateError } = await supabase
    .from("chat_messages")
    .select("created_at")
    .eq("companion_id", companionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (lastDateError) {
    console.error("Error fetching last date:", lastDateError.message);
    throw new Error(lastDateError.message);
  }

  const lastMessageDate =
    lastDateData && lastDateData.length > 0
      ? new Date(lastDateData[0].created_at)
      : null;

  return {
    totalMessages: totalMessages || 0,
    userMessages: userMessages || 0,
    assistantMessages: assistantMessages || 0,
    sessionCount: uniqueSessions.size,
    firstMessageDate,
    lastMessageDate,
  };
}

// Delete chat messages for a companion (cleanup)
export async function deleteChatMessages(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to delete messages");
  }

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting messages:", error.message);
    throw new Error(error.message);
  }

  return true;
}

// Update companion duration (call this when session ends)
export async function updateCompanionDuration(
  companionId: string,
  durationSeconds: number
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to update duration");
  }

  const { error } = await supabase
    .from("companions")
    .update({
      total_duration: supabase.raw(
        `COALESCE(total_duration, 0) + ${durationSeconds}`
      ),
    })
    .eq("id", companionId);

  if (error) {
    console.error("Error updating duration:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return true;
}

// Get companion with statistics
export async function getCompanionWithStats(companionId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to view companion");
  }

  // Get companion data
  const { data: companion, error: companionError } = await supabase
    .from("companions")
    .select("*")
    .eq("id", companionId)
    .single();

  if (companionError) {
    console.error("Error fetching companion:", companionError.message);
    throw new Error(companionError.message);
  }

  // Get chat statistics
  const stats = await getChatStatistics(companionId);

  return {
    ...companion,
    stats,
  };
}

// Get all companions with their session counts for the current user
export async function getUserCompanionsWithStats() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("You must be logged in to view companions");
  }

  // Get companions that the user has chatted with
  const { data: companions, error: companionsError } = await supabase
    .from("companions")
    .select("*");

  if (companionsError) {
    console.error("Error fetching companions:", companionsError.message);
    throw new Error(companionsError.message);
  }

  // Get session counts for each companion
  const companionsWithStats = await Promise.all(
    companions.map(async (companion) => {
      const stats = await getChatStatistics(companion.id);
      return {
        ...companion,
        stats,
      };
    })
  );

  return companionsWithStats;
}
