# RLS Policy Strategy

## Overview

Row Level Security (RLS) policies ensure that users can only access data they're authorized to see. This document outlines the RLS policy strategy for What's for Dinner.

## Policy Patterns

### User-Owned Data
Tables where users own their data:
- `users` - Users can only view/update their own record
- `user_preferences` - Users can only access their own preferences
- `health_metrics` - Users can only access their own metrics

**Policy Pattern**:
```sql
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);
```

### Household-Shared Data
Tables where data is shared within a household:
- `meal_plans` - Household members can view/update household meal plans
- `grocery_lists` - Household members can view/update household lists
- `pantry_items` - Household members can view/update household pantry

**Policy Pattern**:
```sql
CREATE POLICY "Household members can view household data" ON table_name
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = table_name.household_id
      AND user_id = auth.uid()
    )
  );
```

### Public Data
Tables with public read access:
- `recipes` (curated) - Public can view curated recipes
- Public recipe collections

**Policy Pattern**:
```sql
CREATE POLICY "Public can view curated recipes" ON recipes
  FOR SELECT USING (source = 'curated');
```

## Implementation Status

See `reports/rls-audit.json` for current coverage.

## Next Steps

1. Review each table's access requirements
2. Implement appropriate RLS policies
3. Test policies with automated tests
4. Document policy decisions
