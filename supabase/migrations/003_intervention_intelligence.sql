-- EduFlow AI — Learning Intervention Intelligence Platform Migration
-- Run AFTER 001_profiles.sql and 002_app_tables.sql in Supabase SQL Editor

-- 1. Curriculums Table
create table if not exists public.curriculums (
  id              text primary key,
  institution     text not null default 'Default Institution',
  subject         text not null,
  version         text not null default 'v1.0',
  stats           jsonb not null default '{}',
  chapters        jsonb not null default '[]',
  published_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
alter table public.curriculums enable row level security;
create policy "curriculums: read authenticated" on public.curriculums for select using (auth.role() = 'authenticated');
create policy "curriculums: teacher write" on public.curriculums for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

-- 2. Concepts Table
create table if not exists public.concepts (
  id              text primary key,
  curriculum_id   text references public.curriculums(id) on delete cascade,
  name            text not null,
  topic           text not null default '',
  chapter         text not null default '',
  competency      text not null default '',
  cognitive_level text not null default 'Conceptual',
  prerequisites   jsonb not null default '[]',
  misconceptions  jsonb not null default '[]',
  sources         jsonb not null default '[]',
  created_at      timestamptz not null default now()
);
alter table public.concepts enable row level security;
create policy "concepts: read authenticated" on public.concepts for select using (auth.role() = 'authenticated');

-- 3. Interventions Table
create table if not exists public.interventions (
  id                 text primary key,
  teacher_id         uuid not null references auth.users(id) on delete cascade,
  student_id         uuid not null references auth.users(id) on delete cascade,
  student_name       text not null default 'Student',
  concept_id         text not null,
  concept_name       text not null,
  topic              text not null default '',
  status             text not null default 'pending', -- 'pending' | 'completed'
  pre_mastery_score  integer not null default 40,
  post_mastery_score integer default null,
  mastery_delta      integer default null,
  misconception      text default '',
  custom_notes       text default '',
  assigned_at        timestamptz not null default now(),
  completed_at       timestamptz default null
);
alter table public.interventions enable row level security;
create policy "interventions: teacher manage own" on public.interventions for all using (auth.uid() = teacher_id);
create policy "interventions: student view own" on public.interventions for select using (auth.uid() = student_id);
create policy "interventions: student update own" on public.interventions for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- 4. Learning Evidence Graph Table
create table if not exists public.learning_evidence (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references auth.users(id) on delete cascade,
  student_name    text not null default 'Student',
  quiz_id         text not null,
  question_index  integer not null default 0,
  question_text   text not null,
  concept_id      text not null,
  concept_name    text not null,
  competency      text default '',
  cognitive_level text not null default 'Recall',
  difficulty      text not null default 'medium',
  student_answer  text default '',
  correct_answer  text default '',
  is_correct      boolean not null default false,
  score           integer not null default 0,
  max_score       integer not null default 5,
  created_at      timestamptz not null default now()
);
alter table public.learning_evidence enable row level security;
create policy "learning_evidence: student manage own" on public.learning_evidence for all using (auth.uid() = student_id);
create policy "learning_evidence: teacher read all" on public.learning_evidence for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'));

-- Indexes for lightning fast analytics aggregation
create index if not exists idx_evidence_student_concept on public.learning_evidence(student_id, concept_id);
create index if not exists idx_interventions_teacher on public.interventions(teacher_id);
create index if not exists idx_interventions_student on public.interventions(student_id);
