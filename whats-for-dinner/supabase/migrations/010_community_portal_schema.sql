-- Community Portal Schema Migration
-- This migration creates tables for community features, recipe submissions, voting, and content management

-- Create community_posts table for user-generated content
create table community_posts (
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
create table community_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote', 'like', 'dislike')),
  created_at timestamp with time zone default now(),
  unique(user_id, post_id, vote_type)
);

-- Create community_comments table for discussions
create table community_comments (
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
create table community_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Create community_bookmarks table for saved content
create table community_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Create community_reports table for content moderation
create table community_reports (
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
create table community_achievements (
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
create table community_leaderboard (
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
create table community_events (
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
create table community_event_submissions (
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

-- Create indexes for performance
create index idx_community_posts_author on community_posts(author_id);
create index idx_community_posts_type on community_posts(post_type);
create index idx_community_posts_category on community_posts(category);
create index idx_community_posts_status on community_posts(status);
create index idx_community_posts_featured on community_posts(is_featured);
create index idx_community_posts_created on community_posts(created_at);
create index idx_community_posts_likes on community_posts(like_count);

create index idx_community_votes_user on community_votes(user_id);
create index idx_community_votes_post on community_votes(post_id);
create index idx_community_votes_type on community_votes(vote_type);

create index idx_community_comments_post on community_comments(post_id);
create index idx_community_comments_author on community_comments(author_id);
create index idx_community_comments_parent on community_comments(parent_id);
create index idx_community_comments_created on community_comments(created_at);

create index idx_community_follows_follower on community_follows(follower_id);
create index idx_community_follows_following on community_follows(following_id);

create index idx_community_bookmarks_user on community_bookmarks(user_id);
create index idx_community_bookmarks_post on community_bookmarks(post_id);

create index idx_community_reports_post on community_reports(post_id);
create index idx_community_reports_comment on community_reports(comment_id);
create index idx_community_reports_status on community_reports(status);

create index idx_community_achievements_user on community_achievements(user_id);
create index idx_community_achievements_type on community_achievements(achievement_type);

create index idx_community_leaderboard_user on community_leaderboard(user_id);
create index idx_community_leaderboard_period on community_leaderboard(period);
create index idx_community_leaderboard_rank on community_leaderboard(rank_position);

create index idx_community_events_type on community_events(event_type);
create index idx_community_events_status on community_events(status);
create index idx_community_events_dates on community_events(start_date, end_date);

create index idx_community_event_submissions_event on community_event_submissions(event_id);
create index idx_community_event_submissions_user on community_event_submissions(user_id);
create index idx_community_event_submissions_status on community_event_submissions(status);

-- Enable Row Level Security
alter table community_posts enable row level security;
alter table community_votes enable row level security;
alter table community_comments enable row level security;
alter table community_follows enable row level security;
alter table community_bookmarks enable row level security;
alter table community_reports enable row level security;
alter table community_achievements enable row level security;
alter table community_leaderboard enable row level security;
alter table community_events enable row level security;
alter table community_event_submissions enable row level security;

-- RLS Policies for community_posts
create policy "Anyone can view published posts" on community_posts
  for select using (status = 'published');

create policy "Users can view their own posts" on community_posts
  for select using (auth.uid() = author_id);

create policy "Users can create posts" on community_posts
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts" on community_posts
  for update using (auth.uid() = author_id);

create policy "Users can delete their own posts" on community_posts
  for delete using (auth.uid() = author_id);

-- RLS Policies for community_votes
create policy "Users can view votes" on community_votes
  for select using (true);

create policy "Users can create votes" on community_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own votes" on community_votes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own votes" on community_votes
  for delete using (auth.uid() = user_id);

-- RLS Policies for community_comments
create policy "Anyone can view approved comments" on community_comments
  for select using (is_approved = true);

create policy "Users can view their own comments" on community_comments
  for select using (auth.uid() = author_id);

create policy "Users can create comments" on community_comments
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own comments" on community_comments
  for update using (auth.uid() = author_id);

create policy "Users can delete their own comments" on community_comments
  for delete using (auth.uid() = author_id);

-- RLS Policies for community_follows
create policy "Users can view follows" on community_follows
  for select using (true);

create policy "Users can create follows" on community_follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can delete their own follows" on community_follows
  for delete using (auth.uid() = follower_id);

-- RLS Policies for community_bookmarks
create policy "Users can view their own bookmarks" on community_bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can create bookmarks" on community_bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on community_bookmarks
  for delete using (auth.uid() = user_id);

-- RLS Policies for community_reports
create policy "Users can create reports" on community_reports
  for insert with check (auth.uid() = reporter_id);

create policy "Users can view their own reports" on community_reports
  for select using (auth.uid() = reporter_id);

-- RLS Policies for community_achievements
create policy "Users can view their own achievements" on community_achievements
  for select using (auth.uid() = user_id);

create policy "Anyone can view public achievements" on community_achievements
  for select using (true);

-- RLS Policies for community_leaderboard
create policy "Anyone can view leaderboard" on community_leaderboard
  for select using (true);

-- RLS Policies for community_events
create policy "Anyone can view active events" on community_events
  for select using (status in ('upcoming', 'active'));

create policy "Users can create events" on community_events
  for insert with check (auth.uid() = created_by);

-- RLS Policies for community_event_submissions
create policy "Users can view their own submissions" on community_event_submissions
  for select using (auth.uid() = user_id);

create policy "Users can create submissions" on community_event_submissions
  for insert with check (auth.uid() = user_id);

-- Functions for community features

-- Function to update post vote counts
create or replace function update_post_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count + 1 
      where id = NEW.post_id;
    elsif NEW.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count - 1 
      where id = NEW.post_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- Handle vote type changes
    if OLD.vote_type in ('upvote', 'like') and NEW.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count - 2 
      where id = NEW.post_id;
    elsif OLD.vote_type in ('downvote', 'dislike') and NEW.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count + 2 
      where id = NEW.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count - 1 
      where id = OLD.post_id;
    elsif OLD.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count + 1 
      where id = OLD.post_id;
    end if;
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

-- Create trigger for vote count updates
create trigger update_post_vote_counts_trigger
  after insert or update or delete on community_votes
  for each row execute function update_post_vote_counts();

-- Function to update comment count
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts 
    set comment_count = comment_count + 1 
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts 
    set comment_count = comment_count - 1 
    where id = OLD.post_id;
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

-- Create trigger for comment count updates
create trigger update_post_comment_count_trigger
  after insert or delete on community_comments
  for each row execute function update_post_comment_count();

-- Function to calculate user points
create or replace function calculate_user_points(user_id_param uuid)
returns int as $$
declare
  total_points int := 0;
begin
  -- Points from posts (likes received)
  select coalesce(sum(like_count), 0) into total_points
  from community_posts
  where author_id = user_id_param and status = 'published';
  
  -- Points from achievements
  total_points := total_points + coalesce((
    select sum(points) 
    from community_achievements 
    where user_id = user_id_param
  ), 0);
  
  return total_points;
end;
$$ language plpgsql security definer;

-- Function to update leaderboard
create or replace function update_leaderboard()
returns void as $$
begin
  -- Clear current leaderboard
  delete from community_leaderboard;
  
  -- Recalculate and insert leaderboard data
  insert into community_leaderboard (user_id, total_points, posts_count, comments_count, likes_received, followers_count, period)
  select 
    u.id as user_id,
    calculate_user_points(u.id) as total_points,
    coalesce(p.posts_count, 0) as posts_count,
    coalesce(c.comments_count, 0) as comments_count,
    coalesce(p.likes_received, 0) as likes_received,
    coalesce(f.followers_count, 0) as followers_count,
    'all_time' as period
  from auth.users u
  left join (
    select 
      author_id,
      count(*) as posts_count,
      sum(like_count) as likes_received
    from community_posts
    where status = 'published'
    group by author_id
  ) p on u.id = p.author_id
  left join (
    select 
      author_id,
      count(*) as comments_count
    from community_comments
    where is_approved = true
    group by author_id
  ) c on u.id = c.author_id
  left join (
    select 
      following_id,
      count(*) as followers_count
    from community_follows
    group by following_id
  ) f on u.id = f.following_id
  where calculate_user_points(u.id) > 0
  order by total_points desc;
  
  -- Update rank positions
  update community_leaderboard
  set rank_position = subquery.rank
  from (
    select id, row_number() over (order by total_points desc) as rank
    from community_leaderboard
  ) subquery
  where community_leaderboard.id = subquery.id;
end;
$$ language plpgsql security definer;

-- Function to check and award achievements
create or replace function check_achievements(user_id_param uuid)
returns void as $$
begin
  -- First post achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'first_post') then
    if exists (select 1 from community_posts where author_id = user_id_param and status = 'published') then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'first_post', 'First Post', 'Congratulations on your first community post!', 10);
    end if;
  end if;
  
  -- Popular recipe achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'popular_recipe') then
    if exists (select 1 from community_posts where author_id = user_id_param and like_count >= 50 and post_type = 'recipe') then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'popular_recipe', 'Popular Recipe', 'Your recipe has received 50+ likes!', 50);
    end if;
  end if;
  
  -- Top contributor achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'top_contributor') then
    if calculate_user_points(user_id_param) >= 500 then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'top_contributor', 'Top Contributor', 'You have earned 500+ community points!', 100);
    end if;
  end if;
end;
$$ language plpgsql security definer;
