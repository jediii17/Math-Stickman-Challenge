-- =============================================
-- 1v1 Multiplayer Rooms
-- =============================================

create table if not exists public.multiplayer_rooms (
  id bigint primary key generated always as identity,
  host_id uuid not null references public.profiles(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  status text not null default 'inviting'
    check (status in ('inviting', 'waiting', 'playing', 'finished', 'cancelled')),
  difficulty text not null default 'easy'
    check (difficulty in ('easy', 'average', 'hard')),
  host_lives integer not null default 5,
  guest_lives integer not null default 5,
  host_score integer not null default 0,
  guest_score integer not null default 0,
  winner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.multiplayer_rooms enable row level security;

-- Players can read rooms where they are host or guest
create policy "Players can read own rooms"
  on public.multiplayer_rooms for select
  using (auth.uid() = host_id or auth.uid() = guest_id);

-- Host can insert new rooms
create policy "Host can create rooms"
  on public.multiplayer_rooms for insert
  with check (auth.uid() = host_id);

-- Host can update their own rooms
create policy "Host can update own rooms"
  on public.multiplayer_rooms for update
  using (auth.uid() = host_id);

-- Guest can update rooms they are invited to (accept/decline)
create policy "Guest can update invited rooms"
  on public.multiplayer_rooms for update
  using (auth.uid() = guest_id);

-- Host can delete their own rooms
create policy "Host can delete own rooms"
  on public.multiplayer_rooms for delete
  using (auth.uid() = host_id);

-- Auto-update updated_at on row changes
create or replace function public.handle_multiplayer_rooms_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_multiplayer_rooms_updated
  before update on public.multiplayer_rooms
  for each row execute procedure public.handle_multiplayer_rooms_updated_at();

-- Enable realtime for this table
alter publication supabase_realtime add table public.multiplayer_rooms;
