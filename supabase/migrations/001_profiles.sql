-- EduFlow AI — Supabase Database Migration
-- Run this in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query)

-- ============================================================
-- 1. Profiles table (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        text not null default 'teacher' check (role in ('teacher', 'student')),
  institution text not null default 'EduFlow Academy',
  grade       text not null default 'Class 10',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. Row Level Security (RLS)
-- ============================================================
alter table public.profiles enable row level security;

-- Users can read & update their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Service-role key (server-side) bypasses RLS automatically — no extra policy needed.

-- ============================================================
-- 3. Trigger: auto-create profile on new auth user
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role, institution, grade)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
    coalesce(new.raw_user_meta_data->>'institution', 'EduFlow Academy'),
    coalesce(new.raw_user_meta_data->>'grade', 'Class 10')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
