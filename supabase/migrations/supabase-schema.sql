-- =============================================
-- Math Time Attack — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Drop dependent tables first (to avoid FK errors)
drop table if exists public.user_accessories cascade;
drop table if exists public.game_sessions cascade;
drop table if exists public.user_powerups cascade;

-- Drop parent table last
drop table if exists public.profiles cascade;

-- 1. Profiles table (linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  coins integer not null default 0,
  recovery_phrase_hash text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. User Accessories table
create table if not exists public.user_accessories (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  accessory_id text not null,
  equipped boolean not null default false,
  purchased_at timestamptz not null default now(),
  unique(user_id, accessory_id)
);

alter table public.user_accessories enable row level security;

create policy "Users can read own accessories"
  on public.user_accessories for select
  using (auth.uid() = user_id);

create policy "Users can insert own accessories"
  on public.user_accessories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accessories"
  on public.user_accessories for update
  using (auth.uid() = user_id);

-- 3. Game Sessions table
create table if not exists public.game_sessions (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  difficulty text not null,
  score integer not null,
  total_questions integer not null,
  wrong_count integer not null,
  coins_earned integer not null,
  played_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

create policy "Users can read own game sessions"
  on public.game_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own game sessions"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

-- 4. User Power-Ups table
create table if not exists public.user_powerups (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  potion integer not null default 0,
  dust integer not null default 0,
  powder integer not null default 0,
  firefly integer not null default 0
);

alter table public.user_powerups enable row level security;

create policy "Users can read own powerups"
  on public.user_powerups for select
  using (auth.uid() = user_id);

create policy "Users can insert own powerups"
  on public.user_powerups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own powerups"
  on public.user_powerups for update
  using (auth.uid() = user_id);
