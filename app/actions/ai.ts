"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/utils/supabase/server";
import { AICharacter, AITutor } from "@/types/ai";

// Get all active AI tutors
export async function getAllAITutors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_tutors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as AITutor[];
}

// Get AI tutor by ID
export async function getAITutor(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_tutors")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) throw new Error(error.message);
  return data as AITutor;
}

// Get AI tutors by category
export async function getAITutorsByCategory(category: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_tutors")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data as AITutor[];
}

// Get all AI characters from ai_characters table
export async function getAICharacters() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data as AICharacter[];
}

// Get AI character by slug
export async function getAICharacterBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw new Error(error.message);
  return data as AICharacter;
}

// Get AI character by ID
export async function getAICharacterById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_characters")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) throw new Error(error.message);
  return data as AICharacter;
}
