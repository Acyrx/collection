"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

const fetchCourse = async (supabase: any, id: string) => {
  const { data: rows, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  if (!rows || rows.length === 0) return null;
  const row = rows[0];

  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, description")
    .eq("course_id", id);

  const modulesWithLessons =
    modules?.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: [],
    })) || [];

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
    difficulty: row.difficulty,
    totalDurationHours: row.total_duration_hours || "",
    tags: row.tags || [],
    prerequisites: row.prerequisites || [],
    skillsGained: row.skills_gained || [],
    modules: modulesWithLessons,
    generatedAt: new Date(row.created_at).getTime(),
    image: row.image_base64 || null,
  };
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  try {
    const course = await fetchCourse(supabase, params.id);
    if (!course) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await req.json();
  const { moduleId, lessonId, content, imageBase64 } = body as {
    moduleId: string;
    lessonId: string;
    content?: string;
    imageBase64?: string | null;
  };

  if (!moduleId || !lessonId) {
    return NextResponse.json(
      { error: "moduleId and lessonId are required" },
      { status: 400 }
    );
  }

  try {
    if (content !== undefined) {
      const { error: updateErr } = await supabase
        .from("course_lessons")
        .update({ content })
        .eq("id", lessonId)
        .eq("module_id", moduleId);
      if (updateErr) throw updateErr;
    }

    if (imageBase64 !== undefined) {
      const { error: imgErr } = await supabase
        .from("courses")
        .update({ image_base64: imageBase64 })
        .eq("id", params.id);
      if (imgErr) throw imgErr;
    }

    const course = await fetchCourse(supabase, params.id);
    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

