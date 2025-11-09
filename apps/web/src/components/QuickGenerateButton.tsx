/**
 * Quick Generate Button (FAB)
 * One-tap recipe generation with smart defaults
 * Mobile-first, floating action button
 */

'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickGenerateButtonProps {
  pantryItems: string[];
  onGenerate: (ingredients: string[], preferences: string) => Promise<void>;
  isLoading?: boolean;
}

export function QuickGenerateButton({ 
  pantryItems, 
  onGenerate, 
  isLoading = false 
}: QuickGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickGenerate = async () => {
    if (isGenerating || isLoading) return;

    setIsGenerating(true);
    try {
      // Use all pantry items, default preferences
      await onGenerate(pantryItems, 'balanced');
    } finally {
      setIsGenerating(false);
    }
  };

  if (pantryItems.length === 0) return null;

  return (
    <Button
      onClick={handleQuickGenerate}
      disabled={isGenerating || isLoading}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 md:hidden"
      size="lg"
    >
      {isGenerating || isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Sparkles className="w-6 h-6" />
      )}
      <span className="sr-only">Quick Generate Recipe</span>
    </Button>
  );
}
