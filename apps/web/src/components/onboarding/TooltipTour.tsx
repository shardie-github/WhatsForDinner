'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TooltipStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
}

interface TooltipTourProps {
  steps: TooltipStep[];
  onComplete?: () => void;
}

export default function TooltipTour({ steps, onComplete }: TooltipTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const hasCompletedTour = localStorage.getItem('tooltip_tour_completed');
    if (!hasCompletedTour && steps.length > 0) {
      setIsVisible(true);
    }
  }, [steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('tooltip_tour_completed', 'true');
    onComplete?.();
  };

  if (!isVisible || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const targetElement = document.querySelector(step.targetSelector);

  if (!targetElement) {
    return null;
  }

  const rect = targetElement.getBoundingClientRect();
  const position = {
    top: rect.bottom + 10,
    left: rect.left + rect.width / 2,
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute z-50 pointer-events-auto"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <Card className="w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
                aria-label="Close tooltip"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{step.content}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </div>
              <div className="flex gap-2">
                {currentStep < steps.length - 1 && (
                  <Button variant="outline" size="sm" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {currentStep < steps.length - 1 ? 'Next' : 'Got it'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={handleSkip} />
    </div>
  );
}
