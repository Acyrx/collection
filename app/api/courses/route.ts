"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateCourseStructure } from "@/utils/services/geminiService";
import { Course, Difficulty } from "@/types/course";
import { v4 as uuidv4 } from "uuid";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  target_audience: string | null;
  difficulty: string;
  total_duration_hours: string | null;
  tags: string[] | null;
  prerequisites: string[] | null;
  skills_gained: string[] | null;
  image_base64: string | null;
  created_at: string;
};

const toCourse = async (supabase: any, row: CourseRow): Promise<Course> => {
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, description")
    .eq("course_id", row.id);

  const modulesWithLessons =
    modules?.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: [],
    })) || [];

  // load lessons for all modules
  if (modulesWithLessons.length > 0) {
    const moduleIds = modulesWithLessons.map((m: any) => m.id);
    const { data: lessons } = await supabase
      .from("course_lessons")
      .select(
        "id, module_id, title, description, key_takeaways, estimated_minutes, content"
      )
      .in("module_id", moduleIds);

    lessons?.forEach((l: any) => {
      const mod = modulesWithLessons.find((m: any) => m.id === l.module_id);
      if (mod) {
        mod.lessons.push({
          id: l.id,
          title: l.title,
          description: l.description,
          keyTakeaways: l.key_takeaways || [],
          estimatedMinutes: l.estimated_minutes || 0,
          content: l.content || undefined,
        });
      }
    });
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetAudience: row.target_audience || "",
    difficulty: row.difficulty as Difficulty,
    totalDurationHours: row.total_duration_hours || "",
    tags: row.tags || [],
    prerequisites: row.prerequisites || [],
    skillsGained: row.skills_gained || [],
    modules: modulesWithLessons,
    generatedAt: new Date(row.created_at).getTime(),
  };
};

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const courses = await Promise.all(
    (data || []).map((row: CourseRow) => toCourse(supabase, row))
  );
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { query, difficulty } = body as { query: string; difficulty: Difficulty };

  if (!query || !difficulty) {
    return NextResponse.json(
      { error: "query and difficulty are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check existing by title and difficulty
  const { data: existing } = await supabase
    .from("courses")
    .select("*")
    .ilike("title", `%${query}%`)
    .eq("difficulty", difficulty)
    .limit(1);

  if (existing && existing.length > 0) {
    const course = await toCourse(supabase, existing[0] as CourseRow);
    return NextResponse.json({ course, isNew: false });
  }

  // Generate new course
  try {
    const generated = await generateCourseStructure(query, difficulty);
    const courseId = uuidv4();

    const { error: courseErr } = await supabase.from("courses").insert({
      id: courseId,
      title: generated.title,
      description: generated.description,
      target_audience: generated.targetAudience,
      difficulty,
      total_duration_hours: generated.totalDurationHours,
      tags: generated.tags || [],
      prerequisites: generated.prerequisites || [],
      skills_gained: generated.skillsGained || [],
    });

    if (courseErr) throw courseErr;

    // Insert modules and lessons
    for (const m of generated.modules) {
      const moduleId = uuidv4();
      const { error: modErr } = await supabase.from("course_modules").insert({
        id: moduleId,
        course_id: courseId,
        title: m.title,
        description: m.description,
      });
      if (modErr) throw modErr;

      const lessons = m.lessons.map((l) => ({
        id: uuidv4(),
        module_id: moduleId,
        title: l.title,
        description: l.description,
        key_takeaways: l.keyTakeaways || [],
        estimated_minutes: l.estimatedMinutes || 0,
      }));

      const { error: lessonsErr } = await supabase
        .from("course_lessons")
        .insert(lessons);
      if (lessonsErr) throw lessonsErr;
    }

    const course = await toCourse(supabase, {
      id: courseId,
      title: generated.title,
      description: generated.description,
      target_audience: generated.targetAudience,
      difficulty,
      total_duration_hours: generated.totalDurationHours,
      tags: generated.tags || [],
      prerequisites: generated.prerequisites || [],
      skills_gained: generated.skillsGained || [],
      image_base64: null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ course, isNew: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to generate course" },
      { status: 500 }
    );
  }
}

