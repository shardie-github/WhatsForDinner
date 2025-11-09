# Database Migration Complete: Growth Features

**Date:** 2025-01-09  
**Status:** ✅ **MIGRATION READY**

---

## 📊 Tables Created

### Gamification (2 tables)
1. **`user_streaks`**
   - Tracks current streak, longest streak, last activity date
   - Auto-updates timestamp on changes
   - Indexed for fast lookups

2. **`user_badges`**
   - Stores badge unlocks (badge_id as text for flexibility)
   - Tracks unlock timestamp
   - Unique constraint on (user_id, badge_id)

### Credits System (2 tables)
3. **`user_credits`**
   - Credit balance per user
   - Lifetime earned/spent tracking
   - Auto-updated via trigger

4. **`credit_transactions`**
   - Full transaction history
   - Types: purchase, reward, refund, recipe_generation, customization, bonus
   - Tracks balance after each transaction

### Collections Marketplace (2 tables)
5. **`recipe_collections`**
   - Collections with recipes, pricing, status
   - Sales count, ratings
   - Status: pending_review, active, rejected, archived

6. **`collection_purchases`**
   - Purchase records
   - Revenue split (70/30)
   - Unique constraint prevents duplicate purchases

### Sharing & Rewards (2 tables)
7. **`recipe_shares`**
   - Tracks recipe shares (link, social, email)
   - Reward credit tracking
   - Platform tracking

8. **`share_rewards`**
   - Share referral rewards
   - Token-based claim system
   - Expiration support

### Images (1 table)
9. **`recipe_images`**
   - Generated/uploaded recipe images
   - Source tracking (AI, Unsplash, upload)
   - Style metadata

### Family Plans (2 tables)
10. **`family_members`**
    - Family relationships
    - Role management (owner, editor, viewer)
    - Join tracking

11. **`family_invites`**
    - Family plan invitations
    - Token-based system
    - Expiration support

### Usage Tracking (1 table)
12. **`subscription_usage`**
    - Period-based usage tracking
    - Recipes generated vs limit
    - Customizations used vs limit
    - Credits used

---

## 🔧 Features Included

### Triggers
- **`update_collection_sales_count()`**: Auto-increments sales count on purchase
- **`update_user_credits_balance()`**: Auto-updates credit balance on transaction
- **`update_streak_timestamp()`**: Auto-updates streak updated_at

### Indexes
- All foreign keys indexed
- Common query patterns indexed (sales count, created_at DESC, etc.)
- Token lookups indexed for fast validation

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Public read for active collections
- ✅ Creators can manage their collections
- ✅ Family members can view their family

---

## 📝 Migration Instructions

### Option 1: Supabase Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/1000_growth_features_tables.sql`
3. Run the migration
4. Verify tables created in Table Editor

### Option 2: Supabase CLI
```bash
cd /workspace
supabase db push
```

### Option 3: Direct SQL
```bash
psql $DATABASE_URL < supabase/migrations/1000_growth_features_tables.sql
```

---

## ✅ Verification Checklist

After running migration, verify:

- [ ] All 12 tables created
- [ ] All indexes created
- [ ] All triggers created
- [ ] RLS policies enabled
- [ ] Test insert/select with authenticated user
- [ ] Test credit balance trigger
- [ ] Test collection sales trigger

---

## 🔄 API Updates Needed

The following APIs have been updated to use new tables:
- ✅ `family/invite` → uses `family_invites` (updated)

APIs already using correct tables:
- ✅ `gamification/streak` → uses `user_streaks`
- ✅ `gamification/badges` → uses `user_badges`
- ✅ `collections/create` → uses `recipe_collections`
- ✅ `collections/purchase` → uses `collection_purchases`

---

## 📈 Next Steps

1. **Run Migration**: Execute migration in Supabase
2. **Test APIs**: Verify all endpoints work with new tables
3. **Seed Data** (optional): Add sample badges, collections
4. **Monitor**: Watch for any RLS policy issues
5. **Iterate**: Adjust indexes/policies based on usage patterns

---

**Status:** 🎉 **READY FOR DEPLOYMENT**
