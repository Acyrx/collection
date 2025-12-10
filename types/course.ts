export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  id: string;
  title: string;
  description: string; // Short summary
  keyTakeaways: string[];
  estimatedMinutes: number;
  content?: string; // Markdown content (loaded on demand)
  isGenerating?: boolean; // UI state for content generation
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  difficulty: Difficulty;
  totalDurationHours: string;
  modules: Module[];
  generatedAt: number;
  tags: string[];
  prerequisites?: string[]; // New: List of prerequisites
  skillsGained?: string[]; // New: Skills list
}

export interface SearchState {
  query: string;
  difficulty: Difficulty;
  isSearching: boolean;
  statusMessage: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text?: string;
  image?: string; // Base64 string
  type?: "text" | "image";
}
