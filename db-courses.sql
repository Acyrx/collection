-- Courses, modules, lessons schema for Beetle course generator
create extension if not exists "uuid-ossp";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  target_audience text,
  difficulty text not null,
  total_duration_hours text,
  tags text[],
  prerequisites text[],
  skills_gained text[],
  image_base64 text,
  created_at timestamptz default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade,
  title text not null,
  description text not null,
  key_takeaways text[],
  estimated_minutes int,
  content text,
  created_at timestamptz default now()
);

create index if not exists idx_courses_difficulty on public.courses(difficulty);
create index if not exists idx_course_modules_course_id on public.course_modules(course_id);
create index if not exists idx_course_lessons_module_id on public.course_lessons(module_id);

