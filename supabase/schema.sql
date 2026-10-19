-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR SPOTIFY WEB CLONE
-- ====================================================================
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query

-- 1. PROFILES TABLE (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update their own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Function to handle new user registration from Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. LIKED SONGS TABLE
create table if not exists public.liked_songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_id text not null,
  track_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, track_id)
);

alter table public.liked_songs enable row level security;

create policy "Users can view their own liked songs" on public.liked_songs
  for select using ((select auth.uid()) = user_id);

create policy "Users can add liked songs" on public.liked_songs
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can remove liked songs" on public.liked_songs
  for delete using ((select auth.uid()) = user_id);

-- 3. PLAYLISTS TABLE
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.playlists enable row level security;

create policy "Users can view their own playlists" on public.playlists
  for select using ((select auth.uid()) = user_id);

create policy "Users can create playlists" on public.playlists
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own playlists" on public.playlists
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own playlists" on public.playlists
  for delete using ((select auth.uid()) = user_id);

-- 4. PLAYLIST TRACKS TABLE
create table if not exists public.playlist_tracks (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id text not null,
  track_data jsonb not null,
  position int default 0,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (playlist_id, track_id)
);

alter table public.playlist_tracks enable row level security;

create policy "Users can view tracks in their playlists" on public.playlist_tracks
  for select using (
    exists (
      select 1 from public.playlists
      where public.playlists.id = public.playlist_tracks.playlist_id
      and public.playlists.user_id = (select auth.uid())
    )
  );

create policy "Users can add tracks to their playlists" on public.playlist_tracks
  for insert with check (
    exists (
      select 1 from public.playlists
      where public.playlists.id = public.playlist_tracks.playlist_id
      and public.playlists.user_id = (select auth.uid())
    )
  );

create policy "Users can remove tracks from their playlists" on public.playlist_tracks
  for delete using (
    exists (
      select 1 from public.playlists
      where public.playlists.id = public.playlist_tracks.playlist_id
      and public.playlists.user_id = (select auth.uid())
    )
  );
