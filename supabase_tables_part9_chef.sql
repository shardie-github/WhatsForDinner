-- ============================================================================
-- PART 9: CHEF MARKETPLACE SCHEMA - Run after Part 8
-- ============================================================================

-- Create chef_profiles table for partner chefs
CREATE TABLE IF NOT EXISTS chef_profiles (
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
CREATE TABLE IF NOT EXISTS recipe_packs (
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
CREATE TABLE IF NOT EXISTS recipe_pack_reviews (
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
CREATE TABLE IF NOT EXISTS chef_offers (
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
CREATE TABLE IF NOT EXISTS chef_analytics (
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
CREATE TABLE IF NOT EXISTS chef_earnings (
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
CREATE TABLE IF NOT EXISTS chef_followers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(chef_id, user_id)
);

-- Create chef_notifications table for chef updates
CREATE TABLE IF NOT EXISTS chef_notifications (
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
CREATE TABLE IF NOT EXISTS chef_verification_documents (
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
