-- EduFlow AI — App Tables Migration
-- Run AFTER 001_profiles.sql in Supabase SQL Editor

-- 1. Lessons
create table if not exists public.lessons (
  id                uuid primary key default gen_random_uuid(),
  teacher_id        uuid not null references auth.users (id) on delete cascade,
  subject           text not null,
  syllabus_file_name text default '',
  syllabus_text     text default '',
  overview          text default '',
  plan              jsonb not null default '[]',
  language          text not null default 'en',
  created_at        timestamptz not null default now()
);
alter table public.lessons enable row level security;
create policy "lessons: teacher owns" on public.lessons for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "lessons: student read" on public.lessons for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'student'));

-- 2. Quizzes
create table if not exists public.quizzes (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references auth.users (id) on delete cascade,
  topic           text not null,
  difficulty      text not null default 'medium',
  status          text not null default 'published',
  assigned_grade  text not null default 'Class 10',
  questions       jsonb not null default '[]',
  created_at      timestamptz not null default now()
);
alter table public.quizzes enable row level security;
create policy "quizzes: teacher owns" on public.quizzes for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "quizzes: student read published" on public.quizzes for select using (status = 'published');

-- 3. Attempts
create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users (id) on delete cascade,
  student_name text not null default 'Student',
  quiz_id      uuid not null references public.quizzes (id) on delete cascade,
  topic        text not null default '',
  answers      jsonb not null default '[]',
  total_score  integer not null default 0,
  max_score    integer not null default 0,
  percentage   integer not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.attempts enable row level security;
create policy "attempts: student own" on public.attempts for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "attempts: teacher read own quizzes" on public.attempts for select using (exists (select 1 from public.quizzes where quizzes.id = attempts.quiz_id and quizzes.teacher_id = auth.uid()));

-- 4. Flashcards
create table if not exists public.flashcards (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'Study Deck',
  summary    text not null default '',
  cards      jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.flashcards enable row level security;
create policy "flashcards: student owns" on public.flashcards for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
