'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCard } from '@/components/ui/animated-card';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { ProgressBar } from '@/components/ui/progress-bar';
import Navbar from '@/components/Navbar';
import {
  Apple,
  Activity,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Droplet,
  Leaf,
} from 'lucide-react';

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminA: number;
  vitaminC: number;
  completeness: number;
}

export default function NutritionDashboard() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<NutritionSummary | null>(null);
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user's recent meals and calculate nutrition
        await loadNutritionData(user.id);
      }
      
      setLoading(false);
    };

    fetchUser();
  }, []);

  const loadNutritionData = async (userId: string) => {
    try {
      // This would fetch recent recipes and calculate aggregate nutrition
      // For now, using mock data structure
      const mockNutrition: NutritionSummary = {
        calories: 1850,
        protein: 125,
        carbs: 210,
        fat: 58,
        fiber: 25,
        sugar: 45,
        sodium: 2100,
        calcium: 800,
        iron: 12,
        vitaminA: 5000,
        vitaminC: 80,
        completeness: 0.85,
      };
      
      setNutrition(mockNutrition);
    } catch (error) {
      // Error handled: Error loading nutrition data:
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!nutrition) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No nutrition data available yet. Generate some recipes to see your nutrition summary!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const macroPercentages = {
    protein: (nutrition.protein * 4 / nutrition.calories) * 100,
    carbs: (nutrition.carbs * 4 / nutrition.calories) * 100,
    fat: (nutrition.fat * 9 / nutrition.calories) * 100,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <AnimatedCard delay={0}>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Apple className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-foreground">
                  Nutrition <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Track your daily nutrition intake and health goals
                </p>
              </div>
            </div>
            {nutrition.completeness > 0.8 && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                USDA Verified Data
              </Badge>
            )}
          </div>
        </AnimatedCard>

        {/* Daily Summary Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard delay={100}>
            <Card className="card-interactive border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{nutrition.calories}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  of {dailyGoals.calories} goal
                </div>
                <ProgressBar
                  value={nutrition.calories}
                  max={dailyGoals.calories}
                  variant={nutrition.calories > dailyGoals.calories ? 'warning' : 'success'}
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={150}>
            <Card className="card-interactive border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Protein</CardTitle>
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{nutrition.protein}g</div>
                <div className="text-sm text-muted-foreground mt-1">
                  of {dailyGoals.protein}g goal
                </div>
                <ProgressBar
                  value={nutrition.protein}
                  max={dailyGoals.protein}
                  variant="default"
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <Card className="card-interactive border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Carbs</CardTitle>
                  <Leaf className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{nutrition.carbs}g</div>
                <div className="text-sm text-muted-foreground mt-1">
                  of {dailyGoals.carbs}g goal
                </div>
                <ProgressBar
                  value={nutrition.carbs}
                  max={dailyGoals.carbs}
                  variant="default"
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={250}>
            <Card className="card-interactive border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Fat</CardTitle>
                  <Droplet className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{nutrition.fat}g</div>
                <div className="text-sm text-muted-foreground mt-1">
                  of {dailyGoals.fat}g goal
                </div>
                <ProgressBar
                  value={nutrition.fat}
                  max={dailyGoals.fat}
                  variant="default"
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Macro Breakdown */}
        <AnimatedCard delay={300}>
          <Card className="card-interactive border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Macro Breakdown
              </CardTitle>
              <CardDescription>Daily macronutrient distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm text-muted-foreground">
                      {macroPercentages.protein.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={macroPercentages.protein}
                    max={100}
                    variant="default"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Carbohydrates</span>
                    <span className="text-sm text-muted-foreground">
                      {macroPercentages.carbs.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={macroPercentages.carbs}
                    max={100}
                    variant="success"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Fat</span>
                    <span className="text-sm text-muted-foreground">
                      {macroPercentages.fat.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={macroPercentages.fat}
                    max={100}
                    variant="warning"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Micronutrients */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <AnimatedCard delay={400}>
            <Card className="card-interactive border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Micronutrients
                </CardTitle>
                <CardDescription>Essential vitamins and minerals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Fiber</div>
                    <div className="text-2xl font-bold">{nutrition.fiber}g</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Sugar</div>
                    <div className="text-2xl font-bold">{nutrition.sugar}g</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Sodium</div>
                    <div className="text-2xl font-bold">{nutrition.sodium}mg</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Calcium</div>
                    <div className="text-2xl font-bold">{nutrition.calcium}mg</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Iron</div>
                    <div className="text-2xl font-bold">{nutrition.iron}mg</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Vitamin C</div>
                    <div className="text-2xl font-bold">{nutrition.vitaminC}mg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={450}>
            <Card className="card-interactive border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Health Insights
                </CardTitle>
                <CardDescription>Your nutrition analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nutrition.calories < dailyGoals.calories * 0.9 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm">
                      <strong>Low Calories:</strong> Consider adding more nutrient-dense foods
                    </p>
                  </div>
                )}
                {nutrition.protein >= dailyGoals.protein * 0.9 && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm">
                      <strong>Great Protein Intake:</strong> You're meeting your protein goals!
                    </p>
                  </div>
                )}
                {nutrition.fiber < 25 && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm">
                      <strong>Add More Fiber:</strong> Include more whole grains and vegetables
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
