/**
 * Synthetic Users & Fixtures for E2E Testing
 * 
 * Provides test users, partner sandbox, sample catalog SKUs, referral codes,
 * coupons, and paywall variants for end-to-end connectivity verification.
 */

export interface SyntheticUser {
  id: string;
  email: string;
  password?: string;
  plan: 'free' | 'premium' | 'partner';
  age: number;
  role: 'owner' | 'adult' | 'teen' | 'child';
  householdId?: string;
  preferences: {
    diet?: string[];
    allergens?: string[];
    units?: 'metric' | 'imperial';
    theme?: 'light' | 'dark';
  };
}

export interface PartnerSandbox {
  partnerId: string;
  name: string;
  hmacSecret: string;
  webhookUrl: string;
  affiliateSharePct: number;
}

export interface SampleSKU {
  id: string;
  name: string;
  price: number;
  currency: string;
  partnerId: string;
}

export interface ReferralCode {
  code: string;
  userId: string;
  rewardType: 'discount' | 'credit';
  rewardValue: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil?: string;
}

export interface PaywallVariant {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

// Synthetic User A (Adult, Premium)
export const userA: SyntheticUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user-a@nomad.test',
  password: 'TestPassword123!',
  plan: 'premium',
  age: 35,
  role: 'owner',
  householdId: 'household-a-0000-0000-0000-000000000000',
  preferences: {
    diet: ['vegetarian'],
    allergens: ['nuts'],
    units: 'imperial',
    theme: 'dark',
  },
};

// Synthetic User B (Adult, Free)
export const userB: SyntheticUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'user-b@nomad.test',
  password: 'TestPassword123!',
  plan: 'free',
  age: 28,
  role: 'adult',
  householdId: 'household-b-0000-0000-0000-000000000001',
  preferences: {
    diet: ['keto'],
    allergens: [],
    units: 'metric',
    theme: 'light',
  },
};

// Synthetic User C (Minor)
export const userC: SyntheticUser = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  email: 'user-c@nomad.test',
  password: 'TestPassword123!',
  plan: 'free',
  age: 15,
  role: 'teen',
  householdId: 'household-a-0000-0000-0000-000000000000', // Same as user A
  preferences: {
    diet: [],
    allergens: [],
    units: 'imperial',
    theme: 'dark',
  },
};

// Partner Sandbox
export const partnerSandbox: PartnerSandbox = {
  partnerId: 'partner-test-123',
  name: 'Test Partner Store',
  hmacSecret: process.env.PARTNER_CONVERSION_HMAC_SECRET || 'test-hmac-secret-min-32-chars-required',
  webhookUrl: 'http://localhost:3000/api/_sandbox/partner-webhook',
  affiliateSharePct: 0.10,
};

// Sample Catalog SKUs
export const sampleSKUs: SampleSKU[] = [
  {
    id: 'sku-001',
    name: 'Organic Chicken Breast',
    price: 12.99,
    currency: 'USD',
    partnerId: partnerSandbox.partnerId,
  },
  {
    id: 'sku-002',
    name: 'Fresh Salmon Fillet',
    price: 18.50,
    currency: 'USD',
    partnerId: partnerSandbox.partnerId,
  },
  {
    id: 'sku-003',
    name: 'Organic Vegetables Pack',
    price: 8.99,
    currency: 'USD',
    partnerId: partnerSandbox.partnerId,
  },
];

// Referral Code
export const referralCode: ReferralCode = {
  code: 'TESTREF2024',
  userId: userA.id,
  rewardType: 'credit',
  rewardValue: 5.00,
};

// Coupon
export const coupon: Coupon = {
  code: 'WELCOME20',
  discountType: 'percentage',
  discountValue: 20,
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
};

// Paywall Variants
export const paywallVariants: PaywallVariant[] = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited meal plans',
      'AI-powered suggestions',
      'Ad-free experience',
      'Family sharing',
      'Premium recipes',
    ],
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    price: 99.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Unlimited meal plans',
      'AI-powered suggestions',
      'Ad-free experience',
      'Family sharing',
      'Premium recipes',
      'Priority support',
    ],
  },
];

// Consent States for Testing
export interface ConsentState {
  id: string;
  userId: string;
  analytics: 'declined' | 'accepted';
  ads: 'declined' | 'accepted';
  age: 'adult' | 'minor';
}

export const consentStates: ConsentState[] = [
  {
    id: 'consent-declined',
    userId: userB.id,
    analytics: 'declined',
    ads: 'declined',
    age: 'adult',
  },
  {
    id: 'consent-adult-accepted',
    userId: userA.id,
    analytics: 'accepted',
    ads: 'accepted',
    age: 'adult',
  },
  {
    id: 'consent-minor',
    userId: userC.id,
    analytics: 'declined',
    ads: 'declined',
    age: 'minor',
  },
];

// Sample Meal Plan Data
export interface MealPlanFixture {
  userId: string;
  householdId?: string;
  day: string;
  items: Array<{
    slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipeId: string;
    macros?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
}

export const sampleMealPlan: MealPlanFixture = {
  userId: userA.id,
  householdId: userA.householdId,
  day: new Date().toISOString().split('T')[0],
  items: [
    {
      slot: 'breakfast',
      recipeId: 'recipe-001',
      macros: {
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 12,
      },
    },
    {
      slot: 'lunch',
      recipeId: 'recipe-002',
      macros: {
        calories: 550,
        protein: 25,
        carbs: 60,
        fat: 18,
      },
    },
    {
      slot: 'dinner',
      recipeId: 'recipe-003',
      macros: {
        calories: 650,
        protein: 30,
        carbs: 70,
        fat: 20,
      },
    },
  ],
};

// Sample Grocery List
export interface GroceryListFixture {
  householdId: string;
  name: string;
  items: Array<{
    title: string;
    qty: number;
    unit: string;
    checked: boolean;
  }>;
}

export const sampleGroceryList: GroceryListFixture = {
  householdId: userA.householdId!,
  name: 'Weekly Shopping',
  items: [
    { title: 'Organic Chicken Breast', qty: 2, unit: 'lbs', checked: false },
    { title: 'Fresh Salmon Fillet', qty: 1, unit: 'lb', checked: false },
    { title: 'Organic Vegetables Pack', qty: 1, unit: 'pack', checked: true },
    { title: 'Whole Wheat Bread', qty: 1, unit: 'loaf', checked: false },
  ],
};

// Health Metric Sample
export interface HealthMetricFixture {
  userId: string;
  kind: 'weight' | 'sleep' | 'water' | 'steps' | 'calories';
  value: number;
  unit: string;
  ts: string;
}

export const sampleHealthMetrics: HealthMetricFixture[] = [
  {
    userId: userA.id,
    kind: 'weight',
    value: 70.5,
    unit: 'kg',
    ts: new Date().toISOString(),
  },
  {
    userId: userA.id,
    kind: 'sleep',
    value: 7.5,
    unit: 'hours',
    ts: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: userA.id,
    kind: 'steps',
    value: 8500,
    unit: 'steps',
    ts: new Date().toISOString(),
  },
];

// Family Chat Message Sample
export interface ChatMessageFixture {
  roomId: string;
  userId: string;
  content: string;
  kind: 'family' | 'dm';
}

export const sampleChatMessage: ChatMessageFixture = {
  roomId: 'room-family-a',
  userId: userA.id,
  content: 'Hey family! Let me know if you have any recipe preferences for this week.',
  kind: 'family',
};

// Export all fixtures
export const fixtures = {
  users: {
    userA,
    userB,
    userC,
  },
  partner: partnerSandbox,
  skus: sampleSKUs,
  referral: referralCode,
  coupon,
  paywall: paywallVariants,
  consent: consentStates,
  mealPlan: sampleMealPlan,
  groceryList: sampleGroceryList,
  healthMetrics: sampleHealthMetrics,
  chatMessage: sampleChatMessage,
};
