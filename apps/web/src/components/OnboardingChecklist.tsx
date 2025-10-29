'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { analytics } from '@/lib/analytics';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
}

interface OnboardingChecklistProps {
  userId?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export default function OnboardingChecklist({
  userId,
  onComplete,
  onDismiss,
}: OnboardingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'generate_recipe', label: 'Generate your first recipe', completed: false },
    { id: 'add_pantry', label: 'Add ingredients to your pantry', completed: false },
    { id: 'set_preferences', label: 'Set dietary preferences', completed: false },
    { id: 'save_recipe', label: 'Save a favorite recipe', completed: false },
  ]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChecklistState = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has already completed onboarding
        const { data: onboardingState } = await supabase
          .from('onboarding_state')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (onboardingState?.checklist_completed) {
          setShow(false);
          setLoading(false);
          return;
        }

        // Load current state
        const updatedItems = items.map(item => {
          switch (item.id) {
            case 'generate_recipe':
              return { ...item, completed: onboardingState?.first_recipe_generated || false };
            case 'add_pantry':
              // Check if user has pantry items
              const { data: pantryItems } = await supabase
                .from('pantry_items')
                .select('id')
                .eq('user_id', userId)
                .limit(1);
              return { ...item, completed: (pantryItems?.length || 0) > 0 };
            case 'set_preferences':
              return { ...item, completed: onboardingState?.preferences_set || false };
            case 'save_recipe':
              // Check if user has saved recipes
              const { data: favorites } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .limit(1);
              return { ...item, completed: (favorites?.length || 0) > 0 };
            default:
              return item;
          }
        });

        setItems(updatedItems);

        // Show if not all completed
        const allCompleted = updatedItems.every(item => item.completed);
        setShow(!allCompleted && !onboardingState?.checklist_completed);

        // Track checklist shown
        if (!allCompleted) {
          await analytics.trackEvent('onboarding_checklist_shown', {
            user_id: userId,
            completion_rate: updatedItems.filter(i => i.completed).length / updatedItems.length,
          });
        }
      } catch (error) {
        console.error('Error loading checklist state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChecklistState();
  }, [userId]);

  const handleCompleteItem = async (itemId: string) => {
    if (!userId) return;

    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: true } : item
    );
    setItems(updatedItems);

    // Update state in DB
    try {
      const updateData: any = {};
      switch (itemId) {
        case 'generate_recipe':
          updateData.first_recipe_generated = true;
          break;
        case 'add_pantry':
          // State updated when pantry items are added
          break;
        case 'set_preferences':
          updateData.preferences_set = true;
          break;
        case 'save_recipe':
          // State updated when recipe is saved
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('onboarding_state')
          .upsert({
            user_id: userId,
            ...updateData,
            updated_at: new Date().toISOString(),
          });
      }

      // Track completion
      await analytics.trackEvent('onboarding_item_completed', {
        item_id: itemId,
        user_id: userId,
      });

      // Check if all completed
      const allCompleted = updatedItems.every(item => item.completed);
      if (allCompleted) {
        await supabase
          .from('onboarding_state')
          .upsert({
            user_id: userId,
            checklist_completed: true,
            updated_at: new Date().toISOString(),
          });

        await analytics.trackEvent('onboarding_checklist_completed', {
          user_id: userId,
        });

        if (onComplete) {
          onComplete();
        }

        // Hide after 3 seconds
        setTimeout(() => {
          setShow(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const handleDismiss = async () => {
    if (!userId) return;

    try {
      await supabase
        .from('onboarding_state')
        .upsert({
          user_id: userId,
          checklist_completed: false, // Mark as dismissed but not completed
          updated_at: new Date().toISOString(),
        });

      await analytics.trackEvent('onboarding_checklist_dismissed', {
        user_id: userId,
      });
    } catch (error) {
      console.error('Error dismissing checklist:', error);
    }

    setShow(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (loading || !show) {
    return null;
  }

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Getting Started</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {completedCount} of {totalCount} completed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3"
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={`flex-1 text-sm ${
                item.completed
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}

        {completedCount === totalCount && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-green-600 text-center">
              🎉 You're all set!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
