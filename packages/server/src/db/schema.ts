import { pgTable, uuid, text, jsonb, timestamp, numeric, pgEnum, boolean, integer, date, varchar, sql } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const planEnum = pgEnum('plan', ['free', 'premium', 'partner']);
export const roleEnum = pgEnum('role', ['owner', 'adult', 'teen', 'child']);
export const recipeSourceEnum = pgEnum('recipe_source', ['curated', 'partner', 'user']);
export const healthMetricKindEnum = pgEnum('health_metric_kind', ['weight', 'sleep', 'water', 'steps', 'calories']);
export const roomKindEnum = pgEnum('room_kind', ['family', 'dm']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  plan: planEnum('plan').default('free').notNull(),
  preferences: jsonb('preferences').$type<{
    diet?: string[];
    allergens?: string[];
    units?: 'metric' | 'imperial';
    theme?: 'light' | 'dark';
  }>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Households table
export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Household members table
export const householdMembers = pgTable('household_members', {
  household_id: uuid('household_id').references(() => households.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: roleEnum('role').default('adult').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: { primaryKey: { columns: [table.household_id, table.user_id] } },
}));

// Recipes table
export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  media_url: text('media_url'),
  steps: jsonb('steps').$type<Array<{ step: number; instruction: string; duration_min?: number }>>().notNull(),
  ingredients: jsonb('ingredients').$type<Array<{ name: string; quantity: number; unit: string }>>().notNull(),
  macros: jsonb('macros').$type<{ calories: number; protein: number; carbs: number; fat: number }>(),
  tags: text('tags').array(),
  source: recipeSourceEnum('source').default('user').notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Meal plans table
export const mealPlans = pgTable('meal_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  household_id: uuid('household_id').references(() => households.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  items: jsonb('items').$type<Array<{
    slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipe_id: string;
    macros?: { calories: number; protein: number; carbs: number; fat: number };
  }>>().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDayIdx: { index: 'meal_plans_user_day_idx', on: [table.user_id, table.day] },
}));

// Grocery lists table
export const groceryLists = pgTable('grocery_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  household_id: uuid('household_id').references(() => households.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),
  items: jsonb('items').$type<Array<{
    title: string;
    qty: number;
    unit: string;
    checked: boolean;
  }>>().notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Health metrics table
export const healthMetrics = pgTable('health_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  kind: healthMetricKindEnum('kind').notNull(),
  value: numeric('value').notNull(),
  unit: text('unit').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userKindTsIdx: { index: 'health_metrics_user_kind_ts_idx', on: [table.user_id, table.kind, table.ts] },
}));

// Rooms table (for family communication)
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  household_id: uuid('household_id').references(() => households.id, { onDelete: 'cascade' }),
  kind: roomKindEnum('kind').default('family').notNull(),
  participants: uuid('participants').array().notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  room_id: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  body: text('body').notNull(),
  attachments: jsonb('attachments').$type<Array<{ url: string; type: string; name: string }>>().default([]),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  roomTsIdx: { index: 'messages_room_ts_idx', on: [table.room_id, table.ts] },
}));

// Feature flags table
export const featureFlags = pgTable('feature_flags', {
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  flags: jsonb('flags').$type<Record<string, boolean>>().notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: { primaryKey: { columns: [table.user_id] } },
}));

// Ad impressions table
export const adImpressions = pgTable('ad_impressions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  slot: text('slot').notNull(),
  kind: text('kind').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
});

// Events table (analytics)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  props: jsonb('props').$type<Record<string, unknown>>().default({}),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userTsIdx: { index: 'events_user_ts_idx', on: [table.user_id, table.ts] },
}));

// API keys table (for partners)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  partner_slug: text('partner_slug').notNull(),
  key_hash: text('key_hash').notNull(), // bcrypt hash
  scopes: text('scopes').array().notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Webhook events table (for idempotency)
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // 'partner', 'payments', etc.
  external_id: text('external_id').notNull(),
  payload: jsonb('payload').notNull(),
  processed_at: timestamp('processed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueExternalId: { unique: true, columns: [table.source, table.external_id] },
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  mealPlans: many(mealPlans),
  healthMetrics: many(healthMetrics),
  ownedHouseholds: many(households),
  householdMemberships: many(householdMembers),
  featureFlags: one(featureFlags),
}));

export const householdsRelations = relations(households, ({ many, one }) => ({
  owner: one(users, { fields: [households.owner_id], references: [users.id] }),
  members: many(householdMembers),
  mealPlans: many(mealPlans),
  groceryLists: many(groceryLists),
  rooms: many(rooms),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
  user: one(users, { fields: [mealPlans.user_id], references: [users.id] }),
  household: one(households, { fields: [mealPlans.household_id], references: [households.id] }),
}));

// ============================================================================
// GROWTH SYSTEMS SCHEMA
// ============================================================================

// Enums
export const emailSubscriptionStatusEnum = pgEnum('email_subscription_status', ['subscribed', 'unsubscribed', 'bounced']);
export const referralStatusEnum = pgEnum('referral_status', ['clicked', 'signed_up', 'converted']);
export const promoOfferKindEnum = pgEnum('promo_offer_kind', ['percentage', 'fixed', 'trial_days']);
export const promoDurationEnum = pgEnum('promo_duration', ['once', 'repeat', 'lifecycle']);
export const experimentStatusEnum = pgEnum('experiment_status', ['draft', 'running', 'paused', 'complete']);
export const pricingPlatformEnum = pgEnum('pricing_platform', ['ios', 'android', 'web', 'any']);
export const pricingPlanEnum = pgEnum('pricing_plan', ['monthly', 'annual']);

// Email subscriptions table
export const emailSubscriptions = pgTable('email_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: emailSubscriptionStatusEnum('status').default('subscribed').notNull(),
  source: text('source'),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: { index: 'email_subscriptions_user_id_idx', on: [table.user_id] },
  emailIdx: { index: 'email_subscriptions_email_idx', on: [table.email] },
  statusIdx: { index: 'email_subscriptions_status_idx', on: [table.status] },
}));

// Referral programs table
export const referralPrograms = pgTable('referral_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  active: boolean('active').default(true).notNull(),
  reward_sender: jsonb('reward_sender').$type<{ type: string; value: number }>().default({}),
  reward_receiver: jsonb('reward_receiver').$type<{ type: string; value: number }>().default({}),
  terms_url: text('terms_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Referral codes table
export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  program_id: uuid('program_id').references(() => referralPrograms.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull().unique(),
  owner_user_id: uuid('owner_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  uses: integer('uses').default(0).notNull(),
  max_uses: integer('max_uses'),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  programIdx: { index: 'referral_codes_program_id_idx', on: [table.program_id] },
  ownerIdx: { index: 'referral_codes_owner_user_id_idx', on: [table.owner_user_id] },
  codeIdx: { index: 'referral_codes_code_idx', on: [table.code] },
}));

// Referrals table
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  program_id: uuid('program_id').references(() => referralPrograms.id, { onDelete: 'cascade' }).notNull(),
  code_id: uuid('code_id').references(() => referralCodes.id, { onDelete: 'cascade' }).notNull(),
  referrer_user_id: uuid('referrer_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  referee_user_id: uuid('referee_user_id').references(() => users.id, { onDelete: 'set null' }),
  referee_email: varchar('referee_email', { length: 255 }),
  status: referralStatusEnum('status').default('clicked').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: { index: 'referrals_code_id_idx', on: [table.code_id] },
  referrerIdx: { index: 'referrals_referrer_user_id_idx', on: [table.referrer_user_id] },
  refereeIdx: { index: 'referrals_referee_user_id_idx', on: [table.referee_user_id] },
  statusIdx: { index: 'referrals_status_idx', on: [table.status] },
}));

// Promo offers table
export const promoOffers = pgTable('promo_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  kind: promoOfferKindEnum('kind').notNull(),
  value: numeric('value').notNull(),
  duration: promoDurationEnum('duration').default('once').notNull(),
  constraints: jsonb('constraints').$type<{
    max_uses_per_user?: number;
    geo?: string[];
    min_purchase_cents?: number;
  }>().default({}),
  active: boolean('active').default(true).notNull(),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: { index: 'promo_offers_slug_idx', on: [table.slug] },
}));

// Experiments table
export const experiments = pgTable('experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  description: text('description'),
  status: experimentStatusEnum('status').default('draft').notNull(),
  hypothesis: text('hypothesis'),
  primary_metric: text('primary_metric').notNull(),
  guardrail_metrics: jsonb('guardrail_metrics').$type<string[]>().default([]),
  created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  started_at: timestamp('started_at', { withTimezone: true }),
  stopped_at: timestamp('stopped_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: { index: 'experiments_key_idx', on: [table.key] },
}));

// Experiment variants table
export const experimentVariants = pgTable('experiment_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  experiment_id: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  key: text('key').notNull(),
  weight: integer('weight').default(50).notNull(),
  meta: jsonb('meta').$type<Record<string, unknown>>().default({}),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  experimentIdx: { index: 'experiment_variants_experiment_id_idx', on: [table.experiment_id] },
  uniqueVariant: { unique: true, columns: [table.experiment_id, table.key] },
}));

// Experiment assignments table
export const experimentAssignments = pgTable('experiment_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  experiment_id: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anon_id: text('anon_id'),
  variant_key: text('variant_key').notNull(),
  assigned_at: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  sticky: boolean('sticky').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  experimentIdx: { index: 'experiment_assignments_experiment_id_idx', on: [table.experiment_id] },
  userIdx: { index: 'experiment_assignments_user_id_idx', on: [table.user_id] },
  anonIdx: { index: 'experiment_assignments_anon_id_idx', on: [table.anon_id] },
  uniqueAssignment: { unique: true, columns: [table.experiment_id, table.user_id, table.anon_id] },
}));

// Pricing rules table
export const pricingRules = pgTable('pricing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: varchar('country', { length: 3 }),
  platform: pricingPlatformEnum('platform').default('any').notNull(),
  plan: pricingPlanEnum('plan').notNull(),
  price_cents: integer('price_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  promo_offer_id: uuid('promo_offer_id').references(() => promoOffers.id, { onDelete: 'set null' }),
  active: boolean('active').default(true).notNull(),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  countryPlatformIdx: { index: 'pricing_rules_country_platform_idx', on: [table.country, table.platform] },
}));

// Lifecycle events table
export const lifecycleEvents = pgTable('lifecycle_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  anon_id: text('anon_id'),
  name: text('name').notNull(),
  props: jsonb('props').$type<Record<string, unknown>>().default({}),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: { index: 'lifecycle_events_user_id_idx', on: [table.user_id] },
  anonIdx: { index: 'lifecycle_events_anon_id_idx', on: [table.anon_id] },
  nameTsIdx: { index: 'lifecycle_events_name_ts_idx', on: [table.name, table.ts] },
}));

// Journey states table
export const journeyStates = pgTable('journey_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  key: text('key').notNull(),
  step: text('step').notNull(),
  last_sent_at: timestamp('last_sent_at', { withTimezone: true }),
  meta: jsonb('meta').$type<Record<string, unknown>>().default({}),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: { index: 'journey_states_user_id_idx', on: [table.user_id] },
  keyIdx: { index: 'journey_states_key_idx', on: [table.key] },
  uniqueJourney: { unique: true, columns: [table.user_id, table.key] },
}));

// Relations for growth tables
export const referralProgramsRelations = relations(referralPrograms, ({ many }) => ({
  codes: many(referralCodes),
  referrals: many(referrals),
}));

export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  program: one(referralPrograms, { fields: [referralCodes.program_id], references: [referralPrograms.id] }),
  owner: one(users, { fields: [referralCodes.owner_user_id], references: [users.id] }),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  program: one(referralPrograms, { fields: [referrals.program_id], references: [referralPrograms.id] }),
  code: one(referralCodes, { fields: [referrals.code_id], references: [referralCodes.id] }),
  referrer: one(users, { fields: [referrals.referrer_user_id], references: [users.id] }),
  referee: one(users, { fields: [referrals.referee_user_id], references: [users.id] }),
}));

export const experimentsRelations = relations(experiments, ({ one, many }) => ({
  creator: one(users, { fields: [experiments.created_by], references: [users.id] }),
  variants: many(experimentVariants),
  assignments: many(experimentAssignments),
}));

export const experimentVariantsRelations = relations(experimentVariants, ({ one }) => ({
  experiment: one(experiments, { fields: [experimentVariants.experiment_id], references: [experiments.id] }),
}));

export const experimentAssignmentsRelations = relations(experimentAssignments, ({ one }) => ({
  experiment: one(experiments, { fields: [experimentAssignments.experiment_id], references: [experiments.id] }),
  user: one(users, { fields: [experimentAssignments.user_id], references: [users.id] }),
}));

// ============================================================================
// REVENUE OPTIMIZATION SCHEMA
// ============================================================================

// Enums
export const transactionStatusEnum = pgEnum('transaction_status', ['success', 'failed', 'refunded', 'trial']);
export const transactionPlatformEnum = pgEnum('transaction_platform', ['ios', 'android', 'web']);
export const ltvSegmentEnum = pgEnum('ltv_segment', ['new', 'retained', 'churned', 'reactivated']);

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  plan: text('plan').notNull(),
  platform: transactionPlatformEnum('platform').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  amount_cents: integer('amount_cents').notNull(),
  country: varchar('country', { length: 3 }),
  promo_offer_id: uuid('promo_offer_id').references(() => promoOffers.id, { onDelete: 'set null' }),
  status: transactionStatusEnum('status').default('success').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: { index: 'transactions_user_id_idx', on: [table.user_id] },
  tsIdx: { index: 'transactions_ts_idx', on: [table.ts] },
  countryPlanIdx: { index: 'transactions_country_plan_idx', on: [table.country, table.plan] },
  platformIdx: { index: 'transactions_platform_idx', on: [table.platform] },
  statusIdx: { index: 'transactions_status_idx', on: [table.status] },
}));

// Revenue snapshots table
export const revenueSnapshots = pgTable('revenue_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  period: date('period').notNull().unique(),
  mrr_cents: integer('mrr_cents').default(0).notNull(),
  arr_cents: integer('arr_cents').default(0).notNull(),
  arpu_cents: integer('arpu_cents').default(0).notNull(),
  ltv_cents: integer('ltv_cents').default(0).notNull(),
  cac_cents: integer('cac_cents').default(0).notNull(),
  churn_rate: numeric('churn_rate', { precision: 5, scale: 4 }).default('0').notNull(),
  conversion_rate: numeric('conversion_rate', { precision: 5, scale: 4 }).default('0').notNull(),
  computed_at: timestamp('computed_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  periodIdx: { index: 'revenue_snapshots_period_idx', on: [table.period] },
}));

// Price experiments table
export const priceExperiments = pgTable('price_experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull(),
  country: varchar('country', { length: 3 }),
  platform: transactionPlatformEnum('platform'),
  variant_a_price_cents: integer('variant_a_price_cents').notNull(),
  variant_b_price_cents: integer('variant_b_price_cents').notNull(),
  started_at: timestamp('started_at', { withTimezone: true }),
  stopped_at: timestamp('stopped_at', { withTimezone: true }),
  status: experimentStatusEnum('status').default('draft').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: { index: 'price_experiments_slug_idx', on: [table.slug] },
  statusIdx: { index: 'price_experiments_status_idx', on: [table.status] },
  countryPlanIdx: { index: 'price_experiments_country_plan_idx', on: [table.country, table.plan] },
}));

// Elasticity results table
export const elasticityResults = pgTable('elasticity_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: varchar('country', { length: 3 }),
  plan: text('plan').notNull(),
  price_points: jsonb('price_points').$type<number[]>().default([]).notNull(),
  demand: jsonb('demand').$type<number[]>().default([]).notNull(),
  elasticity: numeric('elasticity', { precision: 8, scale: 4 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  countryPlanIdx: { index: 'elasticity_results_country_plan_idx', on: [table.country, table.plan], unique: true },
}));

// Van Westendorp surveys table
export const vanWestendorpSurveys = pgTable('vanwestendorp_surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  country: varchar('country', { length: 3 }).notNull(),
  responses: jsonb('responses').$type<Array<{
    too_cheap: number;
    cheap: number;
    expensive: number;
    too_expensive: number;
  }>>().default([]).notNull(),
  median_optimal_price: integer('median_optimal_price'),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: { index: 'vanwestendorp_surveys_user_id_idx', on: [table.user_id] },
  countryIdx: { index: 'vanwestendorp_surveys_country_idx', on: [table.country] },
  tsIdx: { index: 'vanwestendorp_surveys_ts_idx', on: [table.ts] },
}));

// LTV segments table
export const ltvSegments = pgTable('ltv_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  segment: ltvSegmentEnum('segment').notNull().unique(),
  avg_ltv_cents: integer('avg_ltv_cents').default(0).notNull(),
  avg_cac_cents: integer('avg_cac_cents').default(0).notNull(),
  margin_pct: numeric('margin_pct', { precision: 5, scale: 2 }).default('0').notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  segmentIdx: { index: 'ltv_segments_segment_idx', on: [table.segment] },
}));
