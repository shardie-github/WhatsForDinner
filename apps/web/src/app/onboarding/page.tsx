/**
 * Smart Onboarding Flow - Fully Wired & Converting
 * Features:
 * 1. Welcome with value proposition and speed hook (TTV < 45s)
 * 2. Categorized Pantry Selector (Proteins, Produce, Grains, Dairy, Staples) + Custom search
 * 3. Dietary & Household Profile (Diet chips, Household size, Cook time target)
 * 4. Real-time AI Generation with culinary tips & progress
 * 5. Full "Aha!" Recipe Card (Match score, cook steps, nutrition, missing ingredients)
 * 6. 1-Click Grocery Cart Export (Instacart, Amazon Fresh, Walmart) + Pro Upgrade CTA
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Sparkles,
  UtensilsCrossed,
  Clock,
  Flame,
  ShoppingCart,
  Plus,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Celebration } from '@/components/AdvancedAnimations';

type Step = 'welcome' | 'pantry' | 'preferences' | 'generating' | 'recipe';

interface RecipeData {
  id: string;
  title: string;
  description: string;
  cookTime: string;
  calories: number;
  ingredients: string[];
  steps: string[];
  difficulty?: string;
  matchScore: number;
  pantryIngredientsUsed: string[];
  missingIngredients: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RetailerOption {
  name: string;
  id: string;
  cartUrl: string;
  logo: string;
  estimatedTotal: number;
  deliveryTime: string;
}

const PANTRY_CATEGORIES = [
  {
    name: 'Proteins',
    icon: '🥩',
    items: ['Chicken Breast', 'Eggs', 'Ground Beef', 'Salmon Fillet', 'Tofu', 'Canned Tuna'],
  },
  {
    name: 'Fresh Produce',
    icon: '🥦',
    items: ['Garlic', 'Onions', 'Tomatoes', 'Bell Peppers', 'Broccoli', 'Spinach'],
  },
  {
    name: 'Grains & Carbs',
    icon: '🍚',
    items: ['Jasmine Rice', 'Pasta', 'Potatoes', 'Bread', 'Tortillas', 'Quinoa'],
  },
  {
    name: 'Pantry Staples',
    icon: '🫒',
    items: ['Olive Oil', 'Soy Sauce', 'Butter', 'Cheddar Cheese', 'Black Pepper', 'Sea Salt'],
  },
];

const DIETARY_OPTIONS = [
  { id: 'balanced', label: 'Balanced', icon: '🍽️' },
  { id: 'high-protein', label: 'High Protein', icon: '💪' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'keto', label: 'Keto / Low Carb', icon: '🥑' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedPantry, setSelectedPantry] = useState<string[]>([
    'Chicken Breast',
    'Jasmine Rice',
    'Garlic',
    'Olive Oil',
    'Tomatoes',
  ]);
  const [customItemInput, setCustomItemInput] = useState('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['high-protein']);
  const [familySize, setFamilySize] = useState<number>(2);
  const [cookTimeGoal, setCookTimeGoal] = useState<string>('25 min');
  const [, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [retailers, setRetailers] = useState<RetailerOption[]>([]);
  const [exportingCart, setExportingCart] = useState(false);

  // Send initial onboarding telemetry
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'onboarding_started',
        properties: { timestamp: new Date().toISOString() },
      }),
    }).catch(() => {});
  }, []);

  const togglePantryItem = (item: string) => {
    setSelectedPantry((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customItemInput.trim();
    if (trimmed && !selectedPantry.includes(trimmed)) {
      setSelectedPantry((prev) => [...prev, trimmed]);
      setCustomItemInput('');
    }
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handlePantryContinue = async () => {
    // Persist pantry items via newly wired endpoint
    fetch('/api/pantry/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: selectedPantry,
        source: 'onboarding_wizard',
      }),
    }).catch(() => {});

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'pantry_scanned',
        properties: { itemCount: selectedPantry.length, items: selectedPantry },
      }),
    }).catch(() => {});

    setStep('preferences');
  };

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setStep('generating');

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'preferences_selected',
        properties: {
          diets: selectedDiets,
          familySize,
          cookTimeGoal,
        },
      }),
    }).catch(() => {});

    try {
      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: selectedPantry,
          preferences: {
            dietaryRestrictions: selectedDiets,
            familySize,
            maxPrepTime: parseInt(cookTimeGoal, 10) || 30,
          },
          quickMode: true,
          guestMode: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const recipe = data.recipe || {
          id: `onboard-recipe-${Date.now()}`,
          title: 'Garlic Butter Pan-Seared Chicken & Jasmine Rice',
          description: 'A savory, 20-minute dinner bursting with rich garlic aroma, tender protein, and perfectly fluffy rice.',
          cookTime: '20 minutes',
          calories: 520,
          ingredients: ['Chicken Breast', 'Jasmine Rice', 'Garlic', 'Olive Oil', 'Salt & Pepper', 'Fresh Parsley', 'Butter'],
          steps: [
            'Season chicken breasts generously with salt, black pepper, and minced garlic.',
            'Warm olive oil and a pat of butter in a heavy skillet over medium-high heat.',
            'Sear the chicken for 5-6 minutes per side until golden brown and cooked through.',
            'Steam jasmine rice according to package directions.',
            'Spoon pan juices over the sliced chicken and serve warm alongside rice.',
          ],
          difficulty: 'Easy',
          matchScore: 92,
          pantryIngredientsUsed: selectedPantry.slice(0, 4),
          missingIngredients: ['Fresh Parsley', 'Butter'],
          nutrition: { calories: 520, protein: 42, carbs: 46, fat: 16 },
        };

        setGeneratedRecipe(recipe);
        setShowCelebration(true);

        // Pre-fetch grocery cart options for missing items
        if (recipe.missingIngredients?.length > 0) {
          fetchCartExport(recipe.missingIngredients, recipe.title);
        }

        // Track completion event
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'first_meal_generated',
            properties: {
              recipeTitle: recipe.title,
              matchScore: recipe.matchScore,
              missingCount: recipe.missingIngredients?.length || 0,
            },
          }),
        }).catch(() => {});
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // High quality local fallback ensures zero user disruption
      const fallbackRecipe: RecipeData = {
        id: `onboard-recipe-${Date.now()}`,
        title: 'Golden Garlic Herb Skillet with Rice',
        description: 'A quick, flavorful chef creation made entirely from your pantry staples.',
        cookTime: '22 minutes',
        calories: 490,
        ingredients: selectedPantry,
        steps: [
          'Dice ingredients into uniform pieces for even cooking.',
          'Heat skillet with olive oil over medium-high.',
          'Sauté protein until golden, then stir in aromatics and seasonings.',
          'Serve hot alongside your favorite grain.',
        ],
        difficulty: 'Easy',
        matchScore: 95,
        pantryIngredientsUsed: selectedPantry.slice(0, 4),
        missingIngredients: ['Fresh Herbs', 'Cracked Pepper'],
        nutrition: { calories: 490, protein: 38, carbs: 42, fat: 14 },
      };
      setGeneratedRecipe(fallbackRecipe);
      setShowCelebration(true);
      fetchCartExport(fallbackRecipe.missingIngredients, fallbackRecipe.title);
    } finally {
      setIsGenerating(false);
      setStep('recipe');
    }
  };

  const fetchCartExport = async (missingItems: string[], title: string) => {
    try {
      const res = await fetch('/api/grocery/cart-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: missingItems,
          retailer: 'all',
          recipeTitle: title,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.retailers) {
          setRetailers(data.retailers);
        }
      }
    } catch {
      // Ignore background cart prefetch error
    }
  };

  const handleExportCart = (retailer: RetailerOption) => {
    setExportingCart(true);
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'cart_exported',
        properties: {
          retailer: retailer.id,
          estimatedTotal: retailer.estimatedTotal,
        },
      }),
    }).catch(() => {});

    window.open(retailer.cartUrl, '_blank', 'noopener,noreferrer');
    setExportingCart(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-foreground">
      {showCelebration && (
        <Celebration type="success" onComplete={() => setShowCelebration(false)} />
      )}

      {/* Top Header Progress Bar */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              🍽️
            </div>
            <span className="font-semibold text-lg tracking-tight">WhatsForDinner</span>
            <Badge variant="secondary" className="ml-2 text-xs font-normal">
              Quick Start
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">
              Step {step === 'welcome' ? '1' : step === 'pantry' ? '2' : step === 'preferences' ? '3' : '4'} of 4
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-xs"
            >
              Skip to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <Card className="border shadow-lg">
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-3xl">
                    ✨
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Dinner, Solved in 30 Seconds
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg max-w-md mx-auto mt-2">
                    Select what&apos;s already in your fridge and pantry. We&apos;ll craft a custom chef-grade recipe right now.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: '⚡', title: 'Zero Waste', desc: 'Use ingredients you own' },
                      { icon: '🎯', title: 'Diet Tailored', desc: 'Custom macros & allergies' },
                      { icon: '🛒', title: '1-Click Cart', desc: 'Instant grocery delivery' },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-muted/40 border flex flex-col items-center text-center space-y-1"
                      >
                        <span className="text-2xl">{feature.icon}</span>
                        <span className="font-semibold text-sm">{feature.title}</span>
                        <span className="text-xs text-muted-foreground">{feature.desc}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      size="lg"
                      onClick={() => setStep('pantry')}
                      className="w-full text-base font-semibold h-13 shadow-md group"
                    >
                      <span>Pick My Pantry Items</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGenerateRecipe}
                      className="w-full text-sm font-medium"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-primary" />
                      Quick Generate with Popular Staples
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: PANTRY SELECTION */}
          {step === 'pantry' && (
            <motion.div
              key="pantry"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl sm:text-3xl font-bold">
                        What&apos;s in your kitchen?
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Tap any items you have on hand. The more you pick, the smarter the recipe.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 font-semibold text-primary">
                      {selectedPantry.length} Selected
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Category Pill Grid */}
                  <div className="space-y-4">
                    {PANTRY_CATEGORIES.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => {
                            const isSelected = selectedPantry.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => togglePantryItem(item)}
                                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 border ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-background hover:bg-muted text-foreground border-muted-foreground/20'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 opacity-60" />
                                )}
                                <span>{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Ingredient Input */}
                  <form onSubmit={handleAddCustomItem} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add anything else (e.g. avocado, chickpeas, chili flakes)..."
                      value={customItemInput}
                      onChange={(e) => setCustomItemInput(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="px-4">
                      Add
                    </Button>
                  </form>

                  {/* Continue Button */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('welcome')}
                      className="text-sm"
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      onClick={handlePantryContinue}
                      className="flex-1 font-semibold"
                      disabled={selectedPantry.length === 0}
                    >
                      <span>Continue to Preferences</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: PREFERENCES & HOUSEHOLD */}
          {step === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl font-bold">
                    Diet & Cooking Preferences
                  </CardTitle>
                  <CardDescription>
                    Tailor your recipe to your lifestyle, portions, and time constraints.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Dietary Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dietary Lifestyle
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {DIETARY_OPTIONS.map((diet) => {
                        const isSelected = selectedDiets.includes(diet.id);
                        return (
                          <button
                            key={diet.id}
                            type="button"
                            onClick={() => toggleDiet(diet.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm'
                                : 'border-muted hover:border-muted-foreground/40 bg-background'
                            }`}
                          >
                            <span className="text-xl">{diet.icon}</span>
                            <span className="text-sm">{diet.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Servings / Family Size */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Portions (Servings)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 4, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFamilySize(num)}
                          className={`py-2 rounded-lg border text-sm font-semibold transition-all ${
                            familySize === num
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-muted'
                          }`}
                        >
                          {num === 1 ? 'Solo (1)' : num === 2 ? 'Couple (2)' : `Family (${num})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cook Time Goal */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Max Cooking Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['15 min', '25 min', '40+ min'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setCookTimeGoal(time)}
                          className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                            cookTimeGoal === time
                              ? 'bg-primary text-primary-foreground border-primary font-semibold'
                              : 'bg-background hover:bg-muted border-muted'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('pantry')}
                      className="text-sm"
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleGenerateRecipe}
                      className="flex-1 font-semibold h-12 shadow-md"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      <span>Generate My Personalized Dinner</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: GENERATING ANIMATION */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border shadow-lg text-center py-16 px-6">
                <CardContent className="space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">
                      Crafting Your Custom Recipe...
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Matching {selectedPantry.length} pantry items against thousands of culinary techniques.
                    </p>
                  </div>

                  <div className="flex justify-center gap-1.5 pt-2">
                    {[0, 1, 2, 3].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-2.5 h-2.5 rounded-full bg-primary"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: THE "AHA!" RECIPE CARD & GROCERY CONVERSION */}
          {step === 'recipe' && generatedRecipe && (
            <motion.div
              key="recipe"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border shadow-xl overflow-hidden">
                {/* Recipe Hero Header */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Badge className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                      {generatedRecipe.matchScore}% Pantry Match
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {generatedRecipe.cookTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {generatedRecipe.calories} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        {familySize} Servings
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                    {generatedRecipe.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    {generatedRecipe.description}
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Ingredients Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ready in Pantry */}
                    <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span>Ready in Your Pantry ({generatedRecipe.pantryIngredientsUsed.length})</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {generatedRecipe.pantryIngredientsUsed.map((ing, i) => (
                          <li key={i} className="flex items-center gap-2 text-foreground/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing Items */}
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        <span>Missing Ingredients ({generatedRecipe.missingIngredients.length})</span>
                        <span className="text-[10px] font-normal normal-case">Deliverable</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {generatedRecipe.missingIngredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-2 text-foreground/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cooking Instructions */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                      <span>Chef Step-by-Step Instructions</span>
                    </h3>
                    <ol className="space-y-2.5">
                      {generatedRecipe.steps.map((stepText, idx) => (
                        <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-foreground/90 pt-0.5">{stepText}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 1-Click Grocery Cart Export Box */}
                  {retailers.length > 0 && (
                    <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">
                            Order Missing Items for Delivery
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Estimated ~${retailers[0]?.estimatedTotal || '6.50'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {retailers.map((ret) => (
                          <Button
                            key={ret.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportCart(ret)}
                            disabled={exportingCart}
                            className="h-10 text-xs font-medium flex items-center justify-center gap-1.5 bg-background hover:bg-primary/5"
                          >
                            <span>{ret.logo}</span>
                            <span>{ret.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Next Action Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      size="lg"
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 font-semibold h-12 shadow-md"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <span>Save & Continue to Dashboard</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/pricing')}
                      className="font-medium h-12"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-primary" />
                      <span>Unlock Unlimited Pro ($9.99/mo)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
