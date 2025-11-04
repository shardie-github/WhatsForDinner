/**
 * Guardian Onboarding Flow
 * Interactive walkthrough teaching users how Guardian works
 */

'use client';

import { useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  illustration?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Privacy Guardian',
    content: `Guardian is your personal privacy protector. It watches everything your app does with your data, explains it clearly, and builds trust through transparency.`,
  },
  {
    id: 'monitoring',
    title: 'What Guardian Monitors',
    content: `Guardian watches:
- Telemetry events (app usage, interactions)
- API calls (data transmission)
- Content processing (text, images, audio)
- Sensor access (camera, microphone, location)

Every access is assessed for risk and logged securely.`,
  },
  {
    id: 'risk',
    title: 'Risk Assessment',
    content: `Guardian scores each event:
- **Low**: Safe, routine operations
- **Medium**: Requires attention
- **High**: Protected or blocked
- **Critical**: Always blocked

You can see why Guardian made each decision.`,
  },
  {
    id: 'actions',
    title: 'Guardian Actions',
    content: `Guardian can:
- **Allow**: Safe operation proceeds
- **Mask**: Hide sensitive parts
- **Redact**: Remove sensitive data
- **Block**: Prevent access
- **Alert**: Notify you

You're always in control.`,
  },
  {
    id: 'ledger',
    title: 'Cryptographic Ledger',
    content: `Everything is logged in an immutable ledger:
- Hash-chained entries (can't be tampered)
- Cryptographic verification
- Daily hash roots stored securely
- You can verify integrity anytime

No admin can access your personal telemetry.`,
  },
  {
    id: 'learning',
    title: 'Guardian Learns',
    content: `Guardian learns from your behavior:
- Privacy mode preferences
- Signal toggles
- Risk tolerance
- Comfort zones

It adapts recommendations to your preferences.`,
  },
  {
    id: 'features',
    title: 'Privacy Features',
    content: `**Private Mode**: Freeze telemetry instantly
**Sensitive Context**: Auto-mutes when camera/mic active
**Emergency Lockdown**: 1-click killswitch
**Trust Dashboard**: See everything at a glance
**Weekly Reports**: Auto-generated summaries

Your privacy, your control.`,
  },
  {
    id: 'export',
    title: 'Your Data, Your Control',
    content: `Export your Trust Fabric model anytime:
- Portable JSON format
- Take your preferences with you
- Import to other devices
- Backup your privacy settings

You own your privacy preferences.`,
  },
];

export default function GuardianOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
          <p className="text-gray-600 mb-6">
            Guardian is now active and monitoring. Visit your Trust Dashboard to see it in action.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard/trust"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Trust Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <button
              onClick={skip}
              className="text-blue-600 hover:underline"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
          <div className="text-gray-700 whitespace-pre-line">{step.content}</div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
