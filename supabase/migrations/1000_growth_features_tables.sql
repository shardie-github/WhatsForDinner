-- ============================================================================
-- GROWTH FEATURES DATABASE TABLES
-- Migration: 1000_growth_features_tables.sql
-- Date: 2025-01-09
-- Description: Tables for gamification, credits, collections, family plans
-- ============================================================================

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- User streaks table (enhanced)
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_activity ON user_streaks(last_activity_date);

-- User badges table (enhanced for string badge IDs)
CREATE TABLE IF NOT EXISTS user_badges (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================================================
-- CREDITS SYSTEM TABLES
-- ============================================================================

-- User credits balance
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- Positive for credits added, negative for credits spent
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'purchase', 'reward', 'refund', 'recipe_generation', 'customization', 'bonus'
  )),
  reference_id text, -- Stripe payment ID, recipe ID, etc.
  description text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- ============================================================================
-- RECIPE COLLECTIONS MARKETPLACE TABLES
-- ============================================================================

-- Recipe collections
CREATE TABLE IF NOT EXISTS recipe_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  description text CHECK (char_length(description) <= 500),
  recipe_ids bigint[] NOT NULL CHECK (array_length(recipe_ids, 1) > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0.99 AND price <= 99.99),
  category text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'active', 'rejected', 'archived'
  )),
  sales_count integer NOT NULL DEFAULT 0,
  rating_average numeric(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_collections_creator ON recipe_collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_status ON recipe_collections(status);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_category ON recipe_collections(category);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_sales ON recipe_collections(sales_count DESC);

-- Collection purchases
CREATE TABLE IF NOT EXISTS collection_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES recipe_collections(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount_paid numeric(10,2) NOT NULL,
  creator_revenue numeric(10,2) NOT NULL, -- 70% of sale
  platform_revenue numeric(10,2) NOT NULL, -- 30% of sale
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_purchases_user ON collection_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_purchases_collection ON collection_purchases(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_purchases_creator ON recipe_collections(creator_id);

-- ============================================================================
-- RECIPE SHARING & REWARDS TABLES
-- ============================================================================

-- Recipe shares tracking
CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  share_type text NOT NULL CHECK (share_type IN ('link', 'social', 'email')),
  platform text, -- 'twitter', 'facebook', 'email', etc.
  reward_credited boolean NOT NULL DEFAULT false,
  credits_awarded integer DEFAULT 0,
  shared_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_shares_user ON recipe_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe ON recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_at ON recipe_shares(shared_at DESC);

-- Share rewards (for tracking referral rewards)
CREATE TABLE IF NOT EXISTS share_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token text UNIQUE NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('credits', 'badge', 'streak_bonus')),
  reward_value integer,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_rewards_sharer ON share_rewards(sharer_id);
CREATE INDEX IF NOT EXISTS idx_share_rewards_token ON share_rewards(share_token);
CREATE INDEX IF NOT EXISTS idx_share_rewards_expires ON share_rewards(expires_at);

-- ============================================================================
-- RECIPE IMAGES TABLE
-- ============================================================================

-- Generated recipe images
CREATE TABLE IF NOT EXISTS recipe_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_source text NOT NULL CHECK (image_source IN ('ai_generated', 'unsplash', 'upload')),
  prompt text, -- For AI-generated images
  style text CHECK (style IN ('realistic', 'artistic', 'minimal')),
  width integer,
  height integer,
  file_size_bytes integer,
  cached boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe ON recipe_images(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_source ON recipe_images(image_source);

-- ============================================================================
-- FAMILY PLAN TABLES (Enhanced tenant_invites)
-- ============================================================================

-- Family members (if not using tenant system)
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_owner_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_owner ON family_members(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_member ON family_members(member_id);

-- Family invites (enhanced version, can coexist with tenant_invites)
CREATE TABLE IF NOT EXISTS family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('editor', 'viewer')),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_invites_owner ON family_invites(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(token);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(email);

-- ============================================================================
-- SUBSCRIPTION USAGE TRACKING (Enhanced)
-- ============================================================================

-- Subscription usage tracking (if not exists)
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  recipes_generated integer NOT NULL DEFAULT 0,
  recipes_limit integer, -- NULL = unlimited
  customizations_used integer NOT NULL DEFAULT 0,
  customizations_limit integer, -- NULL = unlimited
  credits_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update collection sales count
CREATE OR REPLACE FUNCTION update_collection_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipe_collections
  SET sales_count = sales_count + 1,
      updated_at = now()
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_sales
  AFTER INSERT ON collection_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_sales_count();

-- Function to update credit balance
CREATE OR REPLACE FUNCTION update_user_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent, updated_at)
  VALUES (
    NEW.user_id,
    COALESCE((SELECT balance FROM user_credits WHERE user_id = NEW.user_id), 0) + NEW.amount,
    CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_credits.balance + NEW.amount,
    lifetime_earned = user_credits.lifetime_earned + CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
    lifetime_spent = user_credits.lifetime_spent + CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
    updated_at = now();
  
  -- Update balance_after in transaction
  UPDATE credit_transactions
  SET balance_after = (SELECT balance FROM user_credits WHERE user_id = NEW.user_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credits_balance
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credits_balance();

-- Function to update streak updated_at
CREATE OR REPLACE FUNCTION update_streak_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak_timestamp
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- User streaks: Users can read/update their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User badges: Users can read their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- User credits: Users can read their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Credit transactions: Users can read their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Recipe collections: Public read for active collections, creators can manage
CREATE POLICY "Anyone can view active collections" ON recipe_collections
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage own collections" ON recipe_collections
  FOR ALL USING (auth.uid() = creator_id);

-- Collection purchases: Users can read their own purchases
CREATE POLICY "Users can view own purchases" ON collection_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Recipe shares: Users can read their own shares
CREATE POLICY "Users can view own shares" ON recipe_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares" ON recipe_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Share rewards: Users can read their own rewards
CREATE POLICY "Users can view own rewards" ON share_rewards
  FOR SELECT USING (auth.uid() = sharer_id OR auth.uid() = recipient_id);

-- Recipe images: Public read, recipe owners can manage
CREATE POLICY "Anyone can view recipe images" ON recipe_images
  FOR SELECT USING (true);

-- Family members: Members can view their family
CREATE POLICY "Family members can view family" ON family_members
  FOR SELECT USING (
    auth.uid() = family_owner_id OR 
    auth.uid() = member_id OR
    EXISTS (SELECT 1 FROM family_members WHERE family_owner_id = family_members.family_owner_id AND member_id = auth.uid())
  );

-- Family invites: Owners can manage invites
CREATE POLICY "Owners can manage invites" ON family_invites
  FOR ALL USING (auth.uid() = family_owner_id);

-- Subscription usage: Users can read their own usage
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_streaks IS 'Tracks user meal planning streaks with current and longest streak';
COMMENT ON TABLE user_badges IS 'User badge unlocks for gamification';
COMMENT ON TABLE user_credits IS 'User credit balance for pay-per-use features';
COMMENT ON TABLE credit_transactions IS 'Credit transaction history';
COMMENT ON TABLE recipe_collections IS 'Recipe collections marketplace';
COMMENT ON TABLE collection_purchases IS 'Collection purchase records';
COMMENT ON TABLE recipe_shares IS 'Recipe sharing tracking for rewards';
COMMENT ON TABLE share_rewards IS 'Share referral rewards';
COMMENT ON TABLE recipe_images IS 'Generated recipe images';
COMMENT ON TABLE family_members IS 'Family plan members';
COMMENT ON TABLE family_invites IS 'Family plan invitations';
COMMENT ON TABLE subscription_usage IS 'Subscription usage tracking';
