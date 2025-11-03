import { z } from 'zod';

export const AuditFieldsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
});

export type AuditFields = z.infer<typeof AuditFieldsSchema>;

export const SubscriptionPlanSchema = z.enum(['free', 'premium', 'family']);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const MemberRoleSchema = z.enum(['owner', 'admin', 'member', 'child']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const UserPreferencesSchema = z.object({
  diet: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  units: z.enum(['metric', 'imperial']).default('imperial'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  notifications: z.object({
    mealReminders: z.boolean().default(true),
    waterReminders: z.boolean().default(true),
    familyMessages: z.boolean().default(true),
  }).default({}),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  plan: SubscriptionPlanSchema,
  preferences: UserPreferencesSchema,
  households: z.array(z.string().uuid()).default([]),
}).merge(AuditFieldsSchema);

export type User = z.infer<typeof UserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const HouseholdSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: MemberRoleSchema,
    joinedAt: z.string().datetime(),
  })),
  settings: z.object({
    parentalControls: z.boolean().default(false),
    allowMinorMessaging: z.boolean().default(false),
  }).default({}),
}).merge(AuditFieldsSchema);

export type Household = z.infer<typeof HouseholdSchema>;

export const MealSlotSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);
export type MealSlot = z.infer<typeof MealSlotSchema>;

export const MealItemSchema = z.object({
  slot: MealSlotSchema,
  recipeId: z.string().uuid().optional(),
  recipeTitle: z.string().optional(),
  macros: z.object({
    calories: z.number().default(0),
    protein: z.number().default(0),
    carbs: z.number().default(0),
    fat: z.number().default(0),
  }).optional(),
  notes: z.string().optional(),
});

export const MealPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(MealItemSchema).default([]),
  householdId: z.string().uuid().optional(),
}).merge(AuditFieldsSchema);

export type MealPlan = z.infer<typeof MealPlanSchema>;
export type MealItem = z.infer<typeof MealItemSchema>;

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  media: z.object({
    images: z.array(z.string().url()).default([]),
    video: z.string().url().optional(),
  }).default({}),
  steps: z.array(z.string()),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    notes: z.string().optional(),
  })),
  macros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
  }),
  tags: z.array(z.string()).default([]),
  cookTime: z.number().optional(),
  prepTime: z.number().optional(),
  servings: z.number().default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
}).merge(AuditFieldsSchema);

export type Recipe = z.infer<typeof RecipeSchema>;

export const GroceryItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  qty: z.number().default(1),
  unit: z.string().optional(),
  checked: z.boolean().default(false),
  notes: z.string().optional(),
  recipeId: z.string().uuid().optional(),
});

export const GroceryListSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().default('Grocery List'),
  items: z.array(GroceryItemSchema).default([]),
  sharedWith: z.array(z.string().uuid()).default([]),
}).merge(AuditFieldsSchema);

export type GroceryList = z.infer<typeof GroceryListSchema>;
export type GroceryItem = z.infer<typeof GroceryItemSchema>;

export const HealthMetricKindSchema = z.enum([
  'weight',
  'steps',
  'calories_burned',
  'heart_rate',
  'water',
  'sleep',
  'blood_pressure',
  'blood_glucose',
]);

export const HealthMetricSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  kind: HealthMetricKindSchema,
  value: z.number(),
  unit: z.string(),
  ts: z.string().datetime(),
  source: z.enum(['manual', 'wearable', 'app']).default('manual'),
  metadata: z.record(z.unknown()).optional(),
}).merge(AuditFieldsSchema);

export type HealthMetric = z.infer<typeof HealthMetricSchema>;
export type HealthMetricKind = z.infer<typeof HealthMetricKindSchema>;

export const MessageAttachmentSchema = z.object({
  type: z.enum(['image', 'recipe', 'grocery_list']),
  url: z.string().url().optional(),
  recipeId: z.string().uuid().optional(),
  groceryListId: z.string().uuid().optional(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  senderId: z.string().uuid(),
  body: z.string(),
  attachments: z.array(MessageAttachmentSchema).default([]),
  reactions: z.array(z.object({
    emoji: z.string(),
    userId: z.string().uuid(),
  })).default([]),
  ts: z.string().datetime(),
  editedAt: z.string().datetime().optional(),
}).merge(AuditFieldsSchema);

export type Message = z.infer<typeof MessageSchema>;

export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().optional(),
  members: z.array(z.string().uuid()),
  type: z.enum(['household', 'direct']).default('household'),
  lastMessageAt: z.string().datetime().optional(),
}).merge(AuditFieldsSchema);

export type ChatRoom = z.infer<typeof ChatRoomSchema>;
