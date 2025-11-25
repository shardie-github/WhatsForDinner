-- Chef Marketplace Schema Migration
-- This migration creates tables for partner onboarding, recipe packs, branded offers, and analytics

-- Create chef_profiles table for partner chefs
create table chef_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chef_name text not null,
  bio text,
  specialties text[] default '{}',
  experience_years int default 0,
  certifications text[] default '{}',
  social_links jsonb default '{}',
  profile_image_url text,
  cover_image_url text,
  is_verified boolean default false,
  is_featured boolean default false,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  total_sales int default 0,
  revenue_earned numeric(10,2) default 0.0,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create recipe_packs table for chef's recipe collections
create table recipe_packs (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks',
    'breakfast', 'lunch', 'dinner', 'holiday', 'seasonal', 'dietary'
  )),
  difficulty_level text not null check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  total_servings int,
  price_usd numeric(10,2) not null,
  currency text default 'USD',
  images jsonb default '[]',
  tags text[] default '{}',
  ingredients_list jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  dietary_restrictions text[] default '{}',
  cooking_methods text[] default '{}',
  equipment_needed text[] default '{}',
  skill_level_required text check (skill_level_required in ('beginner', 'intermediate', 'advanced')),
  is_featured boolean default false,
  is_published boolean default false,
  view_count int default 0,
  purchase_count int default 0,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create recipe_pack_reviews table for customer feedback
create table recipe_pack_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  images jsonb default '[]',
  is_verified_purchase boolean default false,
  helpful_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chef_offers table for branded offers and promotions
create table chef_offers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  offer_type text not null check (offer_type in (
    'discount', 'bundle', 'free_shipping', 'early_bird', 'seasonal', 'limited_time'
  )),
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  minimum_purchase numeric(10,2),
  max_uses int,
  current_uses int default 0,
  valid_from timestamp with time zone not null,
  valid_until timestamp with time zone not null,
  is_active boolean default true,
  terms_conditions text,
  created_at timestamp with time zone default now()
);

-- Create chef_analytics table for performance tracking
create table chef_analytics (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'views', 'purchases', 'revenue', 'ratings', 'followers', 'engagement'
  )),
  metric_value numeric(15,2) not null,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_earnings table for revenue tracking
create table chef_earnings (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  sale_id uuid not null,
  gross_amount numeric(10,2) not null,
  platform_fee_percent numeric(5,2) not null,
  platform_fee_amount numeric(10,2) not null,
  net_amount numeric(10,2) not null,
  currency text default 'USD',
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create chef_followers table for chef following system
create table chef_followers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(chef_id, user_id)
);

-- Create chef_notifications table for chef updates
create table chef_notifications (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'new_follower', 'new_review', 'new_purchase', 'earnings_update', 'offer_expiring'
  )),
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_verification_documents table for verification process
create table chef_verification_documents (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  document_type text not null check (document_type in (
    'identity', 'certification', 'portfolio', 'business_license', 'tax_document'
  )),
  document_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_chef_profiles_user on chef_profiles(user_id);
create index idx_chef_profiles_status on chef_profiles(status);
create index idx_chef_profiles_verified on chef_profiles(is_verified);
create index idx_chef_profiles_featured on chef_profiles(is_featured);
create index idx_chef_profiles_rating on chef_profiles(rating);

create index idx_recipe_packs_chef on recipe_packs(chef_id);
create index idx_recipe_packs_category on recipe_packs(category);
create index idx_recipe_packs_difficulty on recipe_packs(difficulty_level);
create index idx_recipe_packs_published on recipe_packs(is_published);
create index idx_recipe_packs_featured on recipe_packs(is_featured);
create index idx_recipe_packs_price on recipe_packs(price_usd);
create index idx_recipe_packs_rating on recipe_packs(rating);

create index idx_recipe_pack_reviews_pack on recipe_pack_reviews(recipe_pack_id);
create index idx_recipe_pack_reviews_user on recipe_pack_reviews(user_id);
create index idx_recipe_pack_reviews_rating on recipe_pack_reviews(rating);

create index idx_chef_offers_chef on chef_offers(chef_id);
create index idx_chef_offers_type on chef_offers(offer_type);
create index idx_chef_offers_active on chef_offers(is_active);
create index idx_chef_offers_valid on chef_offers(valid_from, valid_until);

create index idx_chef_analytics_chef on chef_analytics(chef_id);
create index idx_chef_analytics_type on chef_analytics(metric_type);
create index idx_chef_analytics_period on chef_analytics(period_start, period_end);

create index idx_chef_earnings_chef on chef_earnings(chef_id);
create index idx_chef_earnings_pack on chef_earnings(recipe_pack_id);
create index idx_chef_earnings_status on chef_earnings(payment_status);
create index idx_chef_earnings_created on chef_earnings(created_at);

create index idx_chef_followers_chef on chef_followers(chef_id);
create index idx_chef_followers_user on chef_followers(user_id);

create index idx_chef_notifications_chef on chef_notifications(chef_id);
create index idx_chef_notifications_type on chef_notifications(notification_type);
create index idx_chef_notifications_read on chef_notifications(is_read);

create index idx_chef_verification_chef on chef_verification_documents(chef_id);
create index idx_chef_verification_type on chef_verification_documents(document_type);
create index idx_chef_verification_status on chef_verification_documents(status);

-- Enable Row Level Security
alter table chef_profiles enable row level security;
alter table recipe_packs enable row level security;
alter table recipe_pack_reviews enable row level security;
alter table chef_offers enable row level security;
alter table chef_analytics enable row level security;
alter table chef_earnings enable row level security;
alter table chef_followers enable row level security;
alter table chef_notifications enable row level security;
alter table chef_verification_documents enable row level security;

-- RLS Policies for chef_profiles
create policy "Anyone can view approved chef profiles" on chef_profiles
  for select using (status = 'approved');

create policy "Users can view their own chef profile" on chef_profiles
  for select using (auth.uid() = user_id);

create policy "Users can create chef profile" on chef_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own chef profile" on chef_profiles
  for update using (auth.uid() = user_id);

-- RLS Policies for recipe_packs
create policy "Anyone can view published recipe packs" on recipe_packs
  for select using (is_published = true);

create policy "Chefs can view their own recipe packs" on recipe_packs
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can create recipe packs" on recipe_packs
  for insert with check (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can update their own recipe packs" on recipe_packs
  for update using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for recipe_pack_reviews
create policy "Anyone can view reviews" on recipe_pack_reviews
  for select using (true);

create policy "Users can create reviews" on recipe_pack_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on recipe_pack_reviews
  for update using (auth.uid() = user_id);

-- RLS Policies for chef_offers
create policy "Anyone can view active offers" on chef_offers
  for select using (is_active = true and valid_until > now());

create policy "Chefs can manage their offers" on chef_offers
  for all using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_analytics
create policy "Chefs can view their analytics" on chef_analytics
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_earnings
create policy "Chefs can view their earnings" on chef_earnings
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_followers
create policy "Anyone can view followers" on chef_followers
  for select using (true);

create policy "Users can follow chefs" on chef_followers
  for insert with check (auth.uid() = user_id);

create policy "Users can unfollow chefs" on chef_followers
  for delete using (auth.uid() = user_id);

-- RLS Policies for chef_notifications
create policy "Chefs can view their notifications" on chef_notifications
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_verification_documents
create policy "Chefs can view their verification documents" on chef_verification_documents
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can upload verification documents" on chef_verification_documents
  for insert with check (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- Functions for chef marketplace

-- Function to update chef rating
create or replace function update_chef_rating(chef_id_param uuid)
returns void as $$
declare
  avg_rating numeric(3,2);
  total_ratings_count int;
begin
  -- Calculate average rating from recipe pack reviews
  select 
    coalesce(avg(rating), 0.0),
    count(*)
  into avg_rating, total_ratings_count
  from recipe_pack_reviews rpr
  join recipe_packs rp on rpr.recipe_pack_id = rp.id
  where rp.chef_id = chef_id_param;
  
  -- Update chef profile
  update chef_profiles
  set 
    rating = avg_rating,
    total_ratings = total_ratings_count
  where id = chef_id_param;
end;
$$ language plpgsql security definer;

-- Function to update recipe pack rating
create or replace function update_recipe_pack_rating(pack_id_param uuid)
returns void as $$
declare
  avg_rating numeric(3,2);
  total_ratings_count int;
begin
  -- Calculate average rating
  select 
    coalesce(avg(rating), 0.0),
    count(*)
  into avg_rating, total_ratings_count
  from recipe_pack_reviews
  where recipe_pack_id = pack_id_param;
  
  -- Update recipe pack
  update recipe_packs
  set 
    rating = avg_rating,
    total_ratings = total_ratings_count
  where id = pack_id_param;
  
  -- Update chef rating as well
  perform update_chef_rating(
    (select chef_id from recipe_packs where id = pack_id_param)
  );
end;
$$ language plpgsql security definer;

-- Trigger to update ratings when reviews are added/updated/deleted
create or replace function trigger_update_ratings()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_recipe_pack_rating(NEW.recipe_pack_id);
  elsif TG_OP = 'DELETE' then
    perform update_recipe_pack_rating(OLD.recipe_pack_id);
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

create trigger update_ratings_trigger
  after insert or update or delete on recipe_pack_reviews
  for each row execute function trigger_update_ratings();

-- Function to calculate chef earnings
create or replace function calculate_chef_earnings(chef_id_param uuid, start_date timestamp, end_date timestamp)
returns table(
  total_sales int,
  gross_revenue numeric(10,2),
  platform_fees numeric(10,2),
  net_earnings numeric(10,2)
) as $$
begin
  return query
  select 
    count(*)::int as total_sales,
    coalesce(sum(ce.gross_amount), 0.0) as gross_revenue,
    coalesce(sum(ce.platform_fee_amount), 0.0) as platform_fees,
    coalesce(sum(ce.net_amount), 0.0) as net_earnings
  from chef_earnings ce
  where ce.chef_id = chef_id_param
    and ce.created_at >= start_date
    and ce.created_at <= end_date;
end;
$$ language plpgsql security definer;

-- Function to track analytics
create or replace function track_chef_analytics(
  chef_id_param uuid,
  metric_type_param text,
  metric_value_param numeric,
  period_start_param timestamp,
  period_end_param timestamp,
  metadata_param jsonb default '{}'
)
returns void as $$
begin
  insert into chef_analytics (
    chef_id, metric_type, metric_value, period_start, period_end, metadata
  ) values (
    chef_id_param, metric_type_param, metric_value_param, 
    period_start_param, period_end_param, metadata_param
  );
end;
$$ language plpgsql security definer;
