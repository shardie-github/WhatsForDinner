-- Create profiles table
create table profiles (
  id uuid primary key references auth.users,
  name text,
  preferences jsonb
);

-- Create pantry_items table
create table pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  ingredient text not null,
  quantity int default 1
);

-- Create recipes table
create table recipes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  title text,
  details jsonb,
  calories int,
  time text
);

-- Create favorites table
create table favorites (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  recipe_id bigint references recipes(id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table pantry_items enable row level security;
alter table recipes enable row level security;
alter table favorites enable row level security;

-- Create policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own pantry items" on pantry_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own pantry items" on pantry_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pantry items" on pantry_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own pantry items" on pantry_items
  for delete using (auth.uid() = user_id);

create policy "Users can view own recipes" on recipes
  for select using (auth.uid() = user_id);

create policy "Users can insert own recipes" on recipes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recipes" on recipes
  for update using (auth.uid() = user_id);

create policy "Users can delete own recipes" on recipes
  for delete using (auth.uid() = user_id);

create policy "Users can view own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on favorites
  for delete using (auth.uid() = user_id);