/**
 * Features Section Component
 * 
 * Showcases key features with clear benefits
 * Optimized for conversion
 */

'use client';

import { Zap, Brain, ShoppingCart, Calendar, Heart, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Meal Suggestions',
    description: 'Get personalized meal ideas based on what you have, dietary preferences, and cooking time.',
    benefit: 'Save 2+ hours per week',
  },
  {
    icon: ShoppingCart,
    title: 'Smart Grocery Lists',
    description: 'Automatically generate organized shopping lists from your meal plans.',
    benefit: 'Reduce food waste by 30%',
  },
  {
    icon: Calendar,
    title: 'Weekly Meal Planning',
    description: 'Plan your entire week in minutes. See everything at a glance.',
    benefit: 'Never stress about dinner again',
  },
  {
    icon: Heart,
    title: 'Health & Nutrition',
    description: 'Track macros, calories, and nutrition goals. Eat better effortlessly.',
    benefit: 'Achieve your health goals',
  },
  {
    icon: Users,
    title: 'Family Collaboration',
    description: 'Share meal plans with your household. Everyone stays in sync.',
    benefit: 'Keep the whole family happy',
  },
  {
    icon: Zap,
    title: 'Quick & Easy',
    description: 'Get meal suggestions in 30 seconds. No complicated setup.',
    benefit: 'Start planning immediately',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Everything You Need to Plan Better Meals
          </h2>
          <p className="mb-16 text-xl text-muted-foreground">
            Powerful features that make meal planning effortless
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="mb-3 text-muted-foreground">{feature.description}</p>
                <p className="text-sm font-medium text-primary">{feature.benefit}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
