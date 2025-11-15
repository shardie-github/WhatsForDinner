# Frontend Audit - Code Patches

## PATCH 1: Quick Decision Entry Point (Homepage)

**File:** `apps/web/src/app/(marketing)/home/page.tsx`

**Problem:** No quick entry for "I don't know what to eat" moment

**Solution:** Add prominent "Surprise Me" button with instant recipe generation

```tsx
// Add after line 138 (after CTA buttons)

{/* Quick Decision Section */}
<section className="mt-16 mb-20">
  <div className="max-w-2xl mx-auto">
    <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Don't Know What to Cook?</h2>
          <p className="text-muted-foreground text-lg">
            Get an instant AI-powered suggestion in seconds
          </p>
        </div>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          asChild
        >
          <Link href="/surprise-me">
            <Sparkles className="w-5 h-5 mr-2" />
            Surprise Me!
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          No signup required • Instant results • Free forever
        </p>
      </CardContent>
    </Card>
  </div>
</section>
```

---

## PATCH 2: Simplified Onboarding Flow

**File:** `apps/web/src/app/onboarding/page.tsx`

**Problem:** Too many steps, no instant gratification

**Solution:** Reduce to 2 steps with instant recipe generation

```tsx
// Replace entire file with simplified version

'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'welcome' | 'generating' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [recipe, setRecipe] = useState<any>(null);

  const handleSurpriseMe = async () => {
    setStep('generating');
    
    // Instant recipe generation with sample data
    try {
      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: ['chicken', 'rice', 'tomatoes', 'onions', 'garlic'],
          quickMode: true,
          skipPreferences: true, // Don't require preferences
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
        
        // Track activation
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'onboarding_completed',
            properties: { instant: true },
          }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to generate recipe:', error);
    }

    setTimeout(() => setStep('complete'), 2000);
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
              {/* Quick benefits */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '⚡', text: 'Instant' },
                  { icon: '🎯', text: 'Personalized' },
                  { icon: '🍽️', text: 'Delicious' },
                  { icon: '🆓', text: 'Free' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Primary CTA */}
              <Button 
                onClick={handleSurpriseMe} 
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Surprise Me with a Recipe!
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Skip option */}
              <Button 
                onClick={handleSkip} 
                variant="ghost" 
                className="w-full"
              >
                Skip and explore
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Finding Something Delicious...</h2>
            <p className="text-muted-foreground">This will only take a moment</p>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete' && recipe) {
    return (
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
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <CardTitle className="text-3xl mb-2">Here's Your Recipe!</CardTitle>
              <p className="text-muted-foreground text-lg">
                {recipe.title || 'Your personalized meal suggestion'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipe preview */}
              {recipe.title && (
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="text-muted-foreground">{recipe.description}</p>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push(`/recipes/${recipe.id || 'new'}`)} 
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  View Full Recipe
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline" 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>

              {/* Upgrade prompt (subtle) */}
              <div className="pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Free plan: 4 recipes remaining
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/pricing">Upgrade for unlimited recipes</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}
```

---

## PATCH 3: Mobile Bottom Navigation

**File:** `apps/web/src/components/MobileNav.tsx` (NEW)

**Problem:** No mobile navigation, users can't discover features

**Solution:** Add bottom navigation bar for mobile

```tsx
'use client';

import { Home, Search, Play, User, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/surprise-me', icon: Search, label: 'Find' },
  { href: '/play', icon: Play, label: 'Play' },
  { href: '/grocery', icon: UtensilsCrossed, label: 'Shop' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Update Layout:** `apps/web/src/app/layout.tsx`

Add after line 228 (before closing main tag):

```tsx
import { MobileNav } from '@/components/MobileNav';

// In the return statement, add before </main>:
<MobileNav />
```

---

## PATCH 4: Fix Manifest.json

**File:** `apps/web/public/manifest.json`

**Problem:** Wrong name, missing fields

**Solution:** Complete PWA manifest

```json
{
  "name": "What's for Dinner? - AI Meal Planning",
  "short_name": "What's Dinner",
  "description": "Get AI-powered meal suggestions in seconds based on ingredients you already have. Stop wasting food, save time, and reduce decision fatigue.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10B981",
  "orientation": "portrait-primary",
  "categories": ["food", "lifestyle", "productivity"],
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Surprise Me",
      "short_name": "Surprise",
      "description": "Get an instant recipe suggestion",
      "url": "/surprise-me",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Play Games",
      "short_name": "Play",
      "description": "Decision games for dinner",
      "url": "/play",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

---

## PATCH 5: Surprise Me Page (Quick Entry)

**File:** `apps/web/src/app/surprise-me/page.tsx` (NEW)

**Problem:** No quick decision entry point

**Solution:** Instant recipe generation page

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Heart, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function SurpriseMePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [mood, setMood] = useState<string>('');

  const moods = [
    { id: 'quick', label: 'Quick', icon: '⚡', time: '< 30 min' },
    { id: 'comfort', label: 'Comfort', icon: '🍜', time: 'Any time' },
    { id: 'healthy', label: 'Healthy', icon: '🥗', time: 'Nutritious' },
    { id: 'indulgent', label: 'Indulgent', icon: '🍰', time: 'Treat yourself' },
  ];

  const generateRecipe = async (selectedMood?: string) => {
    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: ['chicken', 'rice', 'tomatoes', 'onions', 'garlic', 'olive oil'],
          mood: selectedMood || mood,
          quickMode: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      }
    } catch (error) {
      console.error('Failed to generate recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate on mount
    generateRecipe();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Surprise Me!
          </h1>
          <p className="text-muted-foreground">
            Get an instant AI-powered recipe suggestion
          </p>
        </div>

        {/* Mood Selector */}
        {!recipe && !loading && (
          <div className="grid grid-cols-2 gap-3">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMood(m.id);
                  generateRecipe(m.id);
                }}
                className="p-4 rounded-lg border-2 border-muted hover:border-primary transition-colors text-left"
              >
                <div className="text-3xl mb-2">{m.icon}</div>
                <div className="font-semibold">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.time}</div>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="py-16 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2">Finding Something Delicious...</h2>
                  <p className="text-sm text-muted-foreground">This will only take a moment</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe Result */}
        <AnimatePresence>
          {recipe && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-2xl">{recipe.title || 'Your Recipe'}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateRecipe()}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.cookTime || '30'} min
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      Serves {recipe.servings || '4'}
                    </Badge>
                    {recipe.difficulty && (
                      <Badge variant="secondary">
                        {recipe.difficulty}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recipe.description && (
                    <p className="text-muted-foreground">{recipe.description}</p>
                  )}

                  {recipe.ingredients && (
                    <div>
                      <h3 className="font-semibold mb-2">Ingredients</h3>
                      <ul className="space-y-1 text-sm">
                        {recipe.ingredients.slice(0, 5).map((ing: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {ing}
                          </li>
                        ))}
                        {recipe.ingredients.length > 5 && (
                          <li className="text-muted-foreground">
                            +{recipe.ingredients.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => router.push(`/recipes/${recipe.id || 'new'}`)}
                      className="flex-1"
                    >
                      View Full Recipe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Another */}
        {recipe && !loading && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => generateRecipe()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Another Recipe
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## PATCH 6: Improved Header (Mobile)

**File:** `apps/web/src/app/layout.tsx`

**Problem:** Header too small, missing navigation

**Solution:** Improve header with better mobile support

```tsx
// Replace header section (lines 215-227) with:

<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
  <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
    <Link href="/" className="flex items-center space-x-2 group">
      <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">🥘</span>
      <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
        What's for Dinner?
      </h1>
    </Link>
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Quick action - only show on desktop */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/surprise-me">
            <Sparkles className="w-4 h-4 mr-2" />
            Surprise Me
          </Link>
        </Button>
      </div>
      <ThemeToggle />
    </div>
  </div>
</header>
```

---

## PATCH 7: Accessibility Improvements

**File:** `apps/web/src/app/onboarding/page.tsx` (if using new version)

Add ARIA labels and keyboard navigation:

```tsx
// Add to buttons:
aria-label="Get started with meal planning"
aria-describedby="welcome-description"

// Add to form elements:
role="button"
tabIndex={0}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleSurpriseMe();
  }
}}
```

---

## PATCH 8: Structured Data for Recipes

**File:** `apps/web/src/components/RecipeStructuredData.tsx` (NEW)

```tsx
import { Recipe } from '@/types/recipe';

interface RecipeStructuredDataProps {
  recipe: Recipe;
}

export function RecipeStructuredData({ recipe }: RecipeStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl,
    author: {
      '@type': 'Organization',
      name: "What's for Dinner?",
    },
    datePublished: recipe.createdAt,
    prepTime: `PT${recipe.prepTime || 10}M`,
    cookTime: `PT${recipe.cookTime || 30}M`,
    totalTime: `PT${(recipe.prepTime || 10) + (recipe.cookTime || 30)}M`,
    recipeYield: recipe.servings || 4,
    recipeIngredient: recipe.ingredients || [],
    recipeInstructions: recipe.instructions?.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })) || [],
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories,
      proteinContent: recipe.nutrition.protein,
      carbohydrateContent: recipe.nutrition.carbs,
      fatContent: recipe.nutrition.fat,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

---

## Summary of Patches

1. ✅ Quick decision entry point
2. ✅ Simplified onboarding (2 steps)
3. ✅ Mobile bottom navigation
4. ✅ Fixed manifest.json
5. ✅ Surprise Me page
6. ✅ Improved header
7. ✅ Accessibility improvements
8. ✅ Recipe structured data

**Next Steps:**
- Implement patches in order
- Test on mobile devices
- Run Lighthouse audit
- User testing
