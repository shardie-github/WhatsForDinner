-- ============================================================================
-- PART 8: COMMUNITY PORTAL SCHEMA - Run after Part 7
-- ============================================================================

-- Create community_posts table for user-generated content
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  post_type text not null check (post_type in (
    'recipe', 'guide', 'tip', 'story', 'question', 'discussion'
  )),
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks', 
    'cooking_tips', 'kitchen_hacks', 'food_science', 'dietary', 'general'
  )),
  tags text[] default '{}',
  images jsonb default '[]',
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  servings int,
  ingredients jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  status text default 'draft' check (status in ('draft', 'published', 'archived', 'flagged')),
  is_featured boolean default false,
  view_count int default 0,
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create community_votes table for voting system
CREATE TABLE IF NOT EXISTS community_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote', 'like', 'dislike')),
  created_at timestamp with time zone default now(),
  unique(user_id, post_id, vote_type)
);

-- Create community_comments table for discussions
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  parent_id uuid references community_comments(id) on delete cascade,
  content text not null,
  is_approved boolean default true,
  like_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create community_follows table for user relationships
CREATE TABLE IF NOT EXISTS community_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Create community_bookmarks table for saved content
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Create community_reports table for content moderation
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  comment_id uuid references community_comments(id) on delete cascade,
  reason text not null check (reason in (
    'spam', 'inappropriate', 'harassment', 'misinformation', 'copyright', 'other'
  )),
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create community_achievements table for gamification
CREATE TABLE IF NOT EXISTS community_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in (
    'first_post', 'popular_recipe', 'helpful_comment', 'top_contributor',
    'recipe_master', 'community_helper', 'viral_content', 'expert_chef'
  )),
  title text not null,
  description text,
  badge_icon text,
  points int default 0,
  earned_at timestamp with time zone default now()
);

-- Create community_leaderboard table for rankings
CREATE TABLE IF NOT EXISTS community_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total_points int default 0,
  posts_count int default 0,
  comments_count int default 0,
  likes_received int default 0,
  followers_count int default 0,
  rank_position int,
  period text not null check (period in ('weekly', 'monthly', 'all_time')),
  updated_at timestamp with time zone default now()
);

-- Create community_events table for challenges and campaigns
CREATE TABLE IF NOT EXISTS community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null check (event_type in (
    'recipe_challenge', 'cooking_contest', 'hackathon', 'feature_request', 'beta_test'
  )),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  rules text,
  prizes jsonb default '[]',
  max_participants int,
  current_participants int default 0,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create community_event_submissions table for event participation
CREATE TABLE IF NOT EXISTS community_event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references community_events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  submission_data jsonb default '{}',
  status text default 'submitted' check (status in ('submitted', 'reviewed', 'winner', 'runner_up')),
  score numeric(5,2),
  feedback text,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);
