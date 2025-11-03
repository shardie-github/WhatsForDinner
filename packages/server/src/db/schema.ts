import { pgTable, uuid, text, jsonb, timestamp, numeric, pgEnum, boolean, integer, date, varchar } from 'drizzle-orm/pg-core';
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
