-- Migration: Add RLS for meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own meal plans"
  ON meal_plans
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Household members can view household meal plans"
  ON meal_plans
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
