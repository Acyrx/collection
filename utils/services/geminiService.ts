import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, Difficulty, Lesson } from "@/types/course";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// 1. Course Structure Schema (Skeleton)
const courseStructureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Professional, engaging course title",
    },
    description: {
      type: Type.STRING,
      description: "Comprehensive course overview",
    },
    targetAudience: { type: Type.STRING, description: "Who this is for" },
    totalDurationHours: { type: Type.STRING, description: "e.g. '20-25'" },
    prerequisites: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Required prior knowledge",
    },
    skillsGained: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of skills students will master",
    },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    modules: {
      type: Type.ARRAY,
      description: "List of 4-8 comprehensive modules",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                estimatedMinutes: { type: Type.INTEGER },
              },
              required: [
                "title",
                "description",
                "keyTakeaways",
                "estimatedMinutes",
              ],
            },
          },
        },
        required: ["title", "description", "lessons"],
      },
    },
  },
  required: [
    "title",
    "description",
    "targetAudience",
    "modules",
    "tags",
    "prerequisites",
    "skillsGained",
  ],
};

// 2. Lesson Content Schema (Deep Dive)
const lessonContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    markdownContent: {
      type: Type.STRING,
      description:
        "Rich markdown content. Include: 1) Concept Deep Dive, 2) Real-World Analogy, 3) Code/Examples, 4) Interactive 'Try it yourself' prompt.",
    },
  },
  required: ["markdownContent"],
};

export const generateCourseStructure = async (
  topic: string,
  difficulty: Difficulty
): Promise<Omit<Course, "id" | "generatedAt">> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are a world-class Professor and Curriculum Architect at a top university.
    Design a comprehensive, "Coursera-quality" course structure.
    
    Topic: "${topic}"
    Level: "${difficulty}"
    
    Guidelines:
    1. Structure: Logical flow (Foundations -> Advanced -> Mastery).
    2. Depth: Create 5-8 modules. Each module should have 3-5 lessons.
    3. Tone: Professional, encouraging, and authoritative.
    4. Metadata: List specific prerequisites and tangible skills gained.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a full course structure for ${topic}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: courseStructureSchema,
        temperature: 0.3,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Generate IDs for UI tracking
      data.modules = data.modules.map((m: any, i: number) => ({
        ...m,
        id: `mod-${i}`,
        lessons: m.lessons.map((l: any, j: number) => ({
          ...l,
          id: `mod-${i}-less-${j}`,
          content: undefined, // Content is loaded later
        })),
      }));
      return data;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini Structure Error:", error);
    throw new Error("Failed to generate course curriculum.");
  }
};

export const generateLessonContent = async (
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  difficulty: string
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are an expert tutor writing a deep-dive lesson for the course: "${courseTitle}".
    Current Module: "${moduleTitle}"
    Lesson Topic: "${lessonTitle}"
    Difficulty: "${difficulty}"

    Your Goal: Write a comprehensive, engaging, and interactive lesson in Markdown format.
    
    Structure Required:
    1. **Introduction**: Hook the student.
    2. **Core Concept**: Explain clearly with "First Principles".
    3. **Real-World Analogy**: Connect the concept to something relatable.
    4. **In-Depth Examples**: 
       - If coding: Provide code blocks with comments.
       - If non-coding: Provide case studies.
    5. **Interactive Checkpoint**: A question or thought experiment.
    6. **Summary**: Quick recap.
    
    Format: Use headers (##), bolding, lists, and code blocks. Make it look like a high-quality blog post or textbook chapter.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Write the full lesson content for "${lessonTitle}".`,
      config: {
        systemInstruction,
        responseMimeType: "application/json", // Using JSON to wrap the MD string safely
        responseSchema: lessonContentSchema,
        temperature: 0.5,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.markdownContent;
    }
    return "Failed to generate lesson content.";
  } catch (error) {
    console.error("Gemini Lesson Content Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const askAiTutor = async (
  context: string,
  question: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are a friendly, intelligent AI Tutor. 
    The student is currently reading a lesson.
    
    Context (Lesson Content):
    ${context.substring(0, 5000)}... (truncated)
    
    Answer the student's question based on the context. 
    Be helpful, concise, and offer examples if asked.
    If the user asks for a quiz, generate a quick 1-question multiple choice quiz.
    If the user asks for "more examples", provide 2 distinct, new examples not in the text.
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: { systemInstruction },
      history: history as any,
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};

export const generateConceptImage = async (
  concept: string
): Promise<string | null> => {
  // Uses the image generation model
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: `Create a clear, educational diagram or illustration explaining this concept: "${concept}". Style: Clean, modern, textbook quality.`,
          },
        ],
      },
    });

    // Find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Gen Error", e);
    return null;
  }
};
