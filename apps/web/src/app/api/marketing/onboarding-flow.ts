/**
 * Onboarding Flow API
 * 
 * Handles user onboarding progression and activation
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackConversion } from '@/lib/marketing/conversion-tracking';

interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
}

interface OnboardingProgress {
  userId: string;
  currentStep: number;
  steps: OnboardingStep[];
  completed: boolean;
  completionRate: number;
}

const ONBOARDING_STEPS = [
  { id: 'signup', name: 'Account Created', required: true },
  { id: 'profile', name: 'Profile Setup', required: true },
  { id: 'pantry', name: 'Add Pantry Items', required: true },
  { id: 'preferences', name: 'Set Preferences', required: false },
  { id: 'first-meal', name: 'Plan First Meal', required: true },
  { id: 'grocery-list', name: 'Generate Grocery List', required: false },
  { id: 'invite-family', name: 'Invite Family (Optional)', required: false },
];

/**
 * Get onboarding progress for user
 */
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // In production, fetch from database
  // const progress = await getOnboardingProgress(userId);
  
  const progress: OnboardingProgress = {
    userId,
    currentStep: 0,
    steps: ONBOARDING_STEPS.map((step) => ({
      id: step.id,
      name: step.name,
      completed: false,
    })),
    completed: false,
    completionRate: 0,
  };

  return NextResponse.json(progress);
}

/**
 * Update onboarding step completion
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const { stepId } = await request.json();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Track conversion
  trackConversion({
    userId,
    event: `onboarding_step_completed`,
    properties: { stepId },
    timestamp: new Date(),
  });

  // Track specific milestones
  if (stepId === 'first-meal') {
    trackConversion({
      userId,
      event: 'first_meal_planned',
      properties: { milestone: 'activation' },
      timestamp: new Date(),
    });
  }

  // In production, update database
  // await updateOnboardingStep(userId, stepId);

  return NextResponse.json({
    success: true,
    stepId,
    message: 'Step completed',
  });
}

/**
 * Get onboarding recommendations
 */
export async function getOnboardingRecommendations(userId: string): Promise<string[]> {
  // In production, analyze user behavior and suggest next steps
  const recommendations = [
    'Add more pantry items for better suggestions',
    'Set your dietary preferences',
    'Plan your first meal',
    'Generate a grocery list',
    'Invite your family to collaborate',
  ];

  return recommendations;
}
