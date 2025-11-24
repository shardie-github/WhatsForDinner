-- RLS Policies for App Tables
-- Ensures all app tables have proper RLS policies
-- This migration is idempotent and safe to run multiple times

-- Enable RLS on core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "own read" ON public.users;
DROP POLICY IF EXISTS "own write" ON public.users;
DROP POLICY IF EXISTS "own update" ON public.users;
DROP POLICY IF EXISTS "own delete" ON public.users;

DROP POLICY IF EXISTS "own read" ON public.households;
DROP POLICY IF EXISTS "own write" ON public.households;
DROP POLICY IF EXISTS "own update" ON public.households;
DROP POLICY IF EXISTS "own delete" ON public.households;

DROP POLICY IF EXISTS "own read" ON public.recipes;
DROP POLICY IF EXISTS "own write" ON public.recipes;
DROP POLICY IF EXISTS "own update" ON public.recipes;
DROP POLICY IF EXISTS "own delete" ON public.recipes;

DROP POLICY IF EXISTS "own read" ON public.meal_plans;
DROP POLICY IF EXISTS "own write" ON public.meal_plans;
DROP POLICY IF EXISTS "own update" ON public.meal_plans;
DROP POLICY IF EXISTS "own delete" ON public.meal_plans;

DROP POLICY IF EXISTS "own read" ON public.grocery_lists;
DROP POLICY IF EXISTS "own write" ON public.grocery_lists;
DROP POLICY IF EXISTS "own update" ON public.grocery_lists;
DROP POLICY IF EXISTS "own delete" ON public.grocery_lists;

DROP POLICY IF EXISTS "own read" ON public.rooms;
DROP POLICY IF EXISTS "own write" ON public.rooms;
DROP POLICY IF EXISTS "own update" ON public.rooms;
DROP POLICY IF EXISTS "own delete" ON public.rooms;

DROP POLICY IF EXISTS "own read" ON public.messages;
DROP POLICY IF EXISTS "own write" ON public.messages;
DROP POLICY IF EXISTS "own update" ON public.messages;
DROP POLICY IF EXISTS "own delete" ON public.messages;

DROP POLICY IF EXISTS "own read" ON public.health_metrics;
DROP POLICY IF EXISTS "own write" ON public.health_metrics;
DROP POLICY IF EXISTS "own update" ON public.health_metrics;
DROP POLICY IF EXISTS "own delete" ON public.health_metrics;

DROP POLICY IF EXISTS "own read" ON public.feature_flags;
DROP POLICY IF EXISTS "own write" ON public.feature_flags;
DROP POLICY IF EXISTS "own update" ON public.feature_flags;

DROP POLICY IF EXISTS "own read" ON public.events;
DROP POLICY IF EXISTS "own write" ON public.events;

-- Service role bypass policy (for admin operations)
CREATE POLICY IF NOT EXISTS "service_role bypass" ON public.users
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Users table policies
CREATE POLICY "own read" ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "own write" ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "own update" ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "own delete" ON public.users FOR DELETE
  USING (auth.uid() = id);

-- Households table policies (users can read households they're members of)
CREATE POLICY "own read" ON public.households FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.households FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "own update" ON public.households FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "own delete" ON public.households FOR DELETE
  USING (auth.uid() = owner_id);

-- Household members policies
CREATE POLICY "own read" ON public.household_members FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.household_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own update" ON public.household_members FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own delete" ON public.household_members FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

-- Recipes table policies
CREATE POLICY "own read" ON public.recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "own write" ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "own read" ON public.meal_plans FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Grocery lists policies
CREATE POLICY "own read" ON public.grocery_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.grocery_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own update" ON public.grocery_lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own delete" ON public.grocery_lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

-- Rooms policies
CREATE POLICY "own read" ON public.rooms FOR SELECT
  USING (
    auth.uid() = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = rooms.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "own update" ON public.rooms FOR UPDATE
  USING (auth.uid() = ANY(participants));

CREATE POLICY "own delete" ON public.rooms FOR DELETE
  USING (auth.uid() = ANY(participants));

-- Messages policies
CREATE POLICY "own read" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = messages.room_id
      AND (
        auth.uid() = ANY(rooms.participants) OR
        EXISTS (
          SELECT 1 FROM public.household_members
          WHERE household_members.household_id = rooms.household_id
          AND household_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "own write" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "own update" ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "own delete" ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Health metrics policies
CREATE POLICY "own read" ON public.health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own write" ON public.health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.health_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Feature flags policies
CREATE POLICY "own read" ON public.feature_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own write" ON public.feature_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.feature_flags FOR UPDATE
  USING (auth.uid() = user_id);

-- Events policies (users can only see their own events)
CREATE POLICY "own read" ON public.events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "own write" ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
