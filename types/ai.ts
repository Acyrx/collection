export interface AITutor {
  id: string;
  title: string;
  description: string;
  category:
    | "voice"
    | "chat"
    | "scraping"
    | "multimedia"
    | "assessment"
    | "creative";
  icon_name?: string;
  color?: string;
  uses_vapi?: boolean;
  voice_provider?: string;
  voice_id?: string;
  voice_stability?: number;
  voice_similarity_boost?: number;
  voice_speed?: number;
  voice_style?: number;
  use_speaker_boost?: boolean;
  model_provider?: string;
  model_name?: string;
  system_prompt?: string;
  first_message?: string;
  route_type?: "ai-character" | "course-generator" | "default";
  route_path?: string;
  course_topics?: string[];
  course_duration?: number;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CreateAITutorInput {
  title: string;
  description: string;
  category:
    | "voice"
    | "chat"
    | "scraping"
    | "multimedia"
    | "assessment"
    | "creative";
  icon_name?: string;
  color?: string;
  uses_vapi?: boolean;
  voice_provider?: string;
  voice_id?: string;
  system_prompt?: string;
  first_message?: string;
  route_type?: "ai-character" | "course-generator" | "default";
  course_topics?: string[];
  course_duration?: number;
}

// AI Character interface (separate from ai_tutors)
export interface AICharacter {
  id: string;
  character_name: string;
  character_bio: string;
  character_era: string;
  character_image_url?: string;
  character_color?: string;
  uses_vapi?: boolean;
  voice_provider?: string;
  voice_id?: string;
  voice_stability?: number;
  voice_similarity_boost?: number;
  voice_speed?: number;
  voice_style?: number;
  use_speaker_boost?: boolean;
  model_provider?: string;
  model_name?: string;
  system_prompt: string;
  first_message: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
