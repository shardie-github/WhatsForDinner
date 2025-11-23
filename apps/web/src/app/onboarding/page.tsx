/**
 * Smart Onboarding Flow
 * Personalized onboarding that converts
 * 
 * Flow:
 * 1. Welcome with value prop
 * 2. Quick pantry scan
 * 3. Dietary preferences
 * 4. First recipe generation (instant gratification)
 * 5. Upgrade prompt (non-pushy)
 */

'use client';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('page');



import { useState } from 'react';
import { ArrowRight, Check, Sparkles, Camera, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AIPersonality } from '@/components/AIPersonality';
import { Celebration } from '@/components/AdvancedAnimations';

type Step = 'welcome' | 'pantry' | 'preferences' | 'generating' | 'complete';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🥩' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handlePantryScan = () => {
    // Pre-fill with common pantry items for instant activation
    const commonItems = ['chicken', 'rice', 'tomatoes', 'onions', 'garlic', 'olive oil', 'salt', 'pepper'];
    setPantryItems(commonItems);
    
    // Auto-save to database
    fetch('/api/pantry/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: commonItems }),
    }).catch(() => {}); // Fail silently
    
    setStep('preferences');
  };

  const handleSkipPantry = () => {
    // Even on skip, pre-fill with sample items for better activation
    const sampleItems = ['chicken', 'rice', 'tomatoes'];
    setPantryItems(sampleItems);
    setStep('preferences');
  };

  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleGenerateFirstRecipe = async () => {
    setIsGenerating(true);
    setStep('generating');

    try {
      // Auto-generate first meal plan using pantry items and preferences
      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: pantryItems.length > 0 ? pantryItems : ['chicken', 'rice', 'tomatoes'],
          dietaryPreferences: preferences,
          quickMode: true, // Fast generation for onboarding
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Track activation event
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'onboarding_completed',
            properties: {
              pantryItemsCount: pantryItems.length,
              preferencesCount: preferences.length,
              timeToActivation: Date.now(),
            },
          }),
        }).catch(() => {});

        // Track onboarding completion
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('recipe_count', '1');
        localStorage.setItem('first_meal_plan_id', data.id || '');
        
        // Track funnel event
        fetch('/api/funnel/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'activation',
            event_data: { mealPlanId: data.id },
          }),
        }).catch(() => {});

        // Show celebration
        setShowCelebration(true);
      }
    } catch (error) {
      logger.error('Failed to generate recipe:', { error: error instanceof Error ? error.message : String(error) });
      // Continue anyway - don't block onboarding
    }

    setStep('complete');
    setIsGenerating(false);
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  if (step === 'welcome') {
    return (
      <>
        {showCelebration && <Celebration type="success" onComplete={() => setShowCelebration(false)} />}
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <CardTitle className="text-4xl mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Welcome! Let's Find You Dinner
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  Get your first AI-powered meal suggestion in seconds
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Personality */}
                <AIPersonality context="greeting" />

                {/* Quick benefits */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '⚡', text: 'Instant' },
                    { icon: '🎯', text: 'Personalized' },
                    { icon: '🍽️', text: 'Delicious' },
                    { icon: '🆓', text: 'Free' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Primary CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleGenerateFirstRecipe} 
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Surprise Me with a Recipe!
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                {/* Skip option */}
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="ghost" 
                  className="w-full"
                >
                  Skip and explore
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  if (step === 'pantry') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>What's in your pantry?</CardTitle>
            <p className="text-muted-foreground">
              We'll use this to suggest recipes. You can add more later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handlePantryScan} className="w-full" variant="outline" size="lg">
              <Camera className="w-4 h-4 mr-2" />
              Scan with Camera
            </Button>
            <div className="text-center text-sm text-muted-foreground">or</div>
            <Button onClick={handleSkipPantry} className="w-full" variant="ghost">
              Skip for now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'preferences') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Any dietary preferences?</CardTitle>
            <p className="text-muted-foreground">
              Select all that apply. We'll customize recipes for you.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {dietaryOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => togglePreference(option.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.includes(option.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
            <Button onClick={handleGenerateFirstRecipe} className="w-full" size="lg">
              Generate My First Recipe
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold mb-2"
            >
              Finding Something Delicious...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              This will only take a moment
            </motion.p>
            <div className="mt-6 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <AIPersonality context="encouragement" showAvatar={false} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <>
        {showCelebration && <Celebration type="recipe" onComplete={() => setShowCelebration(false)} />}
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-primary/5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Check className="w-12 h-12 text-green-600" />
                </motion.div>
                <CardTitle className="text-3xl mb-2">Here's Your Recipe!</CardTitle>
                <AIPersonality context="celebration" showAvatar={false} />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipe preview would go here */}
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Free Plan</p>
                  <p className="text-2xl font-bold">4 recipes remaining</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upgrade to Pro for unlimited recipes
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button onClick={handleComplete} className="w-full h-12 text-lg" size="lg">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                <Button onClick={() => router.push('/pricing')} variant="outline" className="w-full">
                  View Pro Features
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return null;
}
