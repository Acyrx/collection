import { Course, Difficulty } from "@/types/course";

const API_BASE = "/api/courses";

export const searchOrGenerateCourse = async (
  query: string,
  difficulty: Difficulty,
  onStatusUpdate: (msg: string) => void
): Promise<{ course: Course; isNew: boolean }> => {
  onStatusUpdate("Scanning course library...");

  // First, try to find an existing course without prompting AI
  const existing = await getAllCourses();
  const match = existing.find(
    (c) =>
      (c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) &&
      c.difficulty === difficulty
  );
  if (match) {
    onStatusUpdate("Match found in library.");
    return { course: match, isNew: false };
  }

  // Otherwise, generate and persist via API
  onStatusUpdate("Generating new course...");
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, difficulty }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to generate course");
  }

  const data = await res.json();
  return { course: data.course as Course, isNew: data.isNew as boolean };
};

export const getAllCourses = async (): Promise<Course[]> => {
  const res = await fetch(API_BASE, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load courses");
  }
  const data = await res.json();
  return (data.courses || []) as Course[];
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const res = await fetch(`${API_BASE}/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.course as Course) || null;
};

export const updateCourseLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
  content: string
) => {
  const res = await fetch(`${API_BASE}/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, lessonId, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update lesson");
  }
  const data = await res.json();
  return data.course as Course;
};
