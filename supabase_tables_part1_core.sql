-- ============================================================================
-- PART 1: CORE TABLES - Run this first
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key references auth.users,
  name text,
  preferences jsonb
);

-- Create pantry_items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  ingredient text not null,
  quantity int default 1
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  title text,
  details jsonb,
  calories int,
  time text
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  recipe_id bigint references recipes(id)
);
