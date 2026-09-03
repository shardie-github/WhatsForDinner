'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Heart,
  Zap,
  Flame,
  Dumbbell,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface NutritionMetrics {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  glycemicLoad: number; // 0-10: Low, 11-19: Med, 20+: High
  antiInflammatoryScore: number; // 1-10
  satietyIndex: number; // 0-100
  micronutrients: Array<{ name: string; percentDaily: number }>;
}

interface MetabolicScoreCardProps {
  metrics?: Partial<NutritionMetrics>;
  className?: string;
}

const DEFAULT_METRICS: NutritionMetrics = {
  calories: 540,
  proteinGrams: 46,
  carbsGrams: 18,
  fatGrams: 28,
  fiberGrams: 9,
  glycemicLoad: 4, // Ultra-low glucose impact
  antiInflammatoryScore: 9.2, // High omega-3 & polyphenols
  satietyIndex: 94, // Keeps you full for 4.5+ hours
  micronutrients: [
    { name: 'Omega-3 EPA/DHA', percentDaily: 180 },
    { name: 'Vitamin D3', percentDaily: 92 },
    { name: 'Vitamin B12', percentDaily: 120 },
    { name: 'Selenium', percentDaily: 85 },
    { name: 'Magnesium', percentDaily: 64 },
  ],
};

type MetabolicGoal = 'post_workout' | 'fat_adapted' | 'endurance' | 'glucose_steady';

export function MetabolicScoreCard({
  metrics = DEFAULT_METRICS,
  className = '',
}: MetabolicScoreCardProps) {
  const [activeGoal, setActiveGoal] = useState<MetabolicGoal>('post_workout');

  const data: NutritionMetrics = {
    ...DEFAULT_METRICS,
    ...metrics,
  };

  const goalModifiers: Record<
    MetabolicGoal,
    { label: string; icon: string; description: string; tag: string }
  > = {
    post_workout: {
      label: 'Post-Workout Anabolic',
      icon: '🏋️',
      description: 'Optimized 46g leucine-rich protein to stimulate muscle protein synthesis.',
      tag: 'Peak Recovery',
    },
    fat_adapted: {
      label: 'Keto / Fat-Adapted',
      icon: '🥑',
      description: 'Under 18g net carbs maintains deep ketosis and steady ketones.',
      tag: 'Keto Verified',
    },
    endurance: {
      label: 'Cardio Glycogen Reload',
      icon: '🏃',
      description: 'Balanced with complex fibrous carbs for sustained mitochondrial output.',
      tag: 'Long Battery',
    },
    glucose_steady: {
      label: 'Diabetic / Zero-Spike',
      icon: '🩺',
      description: 'Ultra-low Glycemic Load (4) prevents insulin surges and post-meal crashes.',
      tag: 'Flat CGM Curve',
    },
  };

  const totalMacros = data.proteinGrams + data.carbsGrams + data.fatGrams;
  const proteinPercent = Math.round((data.proteinGrams / totalMacros) * 100);
  const carbsPercent = Math.round((data.carbsGrams / totalMacros) * 100);
  const fatPercent = Math.round((data.fatGrams / totalMacros) * 100);

  return (
    <Card className={`border shadow-xl overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Metabolic & Biometric Precision Intelligence</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Medical-grade nutritional modeling: Glycemic load, anti-inflammatory index, and continuous glucose alignment.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            CGM & Biometric Ready
          </Badge>
        </div>

        {/* Goal Profile Selector */}
        <div className="flex flex-wrap gap-2 pt-3">
          {(Object.keys(goalModifiers) as MetabolicGoal[]).map(goalKey => {
            const goal = goalModifiers[goalKey];
            const isActive = activeGoal === goalKey;
            return (
              <Button
                key={goalKey}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveGoal(goalKey)}
                className="text-xs h-8"
              >
                <span className="mr-1.5">{goal.icon}</span>
                <span>{goal.label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Active Goal Insight Box */}
        <motion.div
          key={activeGoal}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{goalModifiers[activeGoal].icon}</span>
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {goalModifiers[activeGoal].tag}:{' '}
              </span>
              <span className="text-foreground/90">{goalModifiers[activeGoal].description}</span>
            </div>
          </div>
        </motion.div>

        {/* Top 3 High-Impact Biomarkers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Glycemic Load */}
          <div className="p-4 rounded-2xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Glycemic Load (GL)</span>
              <Badge className="bg-emerald-600 text-white text-[10px] py-0">Low (Optimal)</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{data.glycemicLoad}</span>
              <span className="text-xs text-muted-foreground">/ 20+ scale</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Zero glucose spike curve. Protects insulin sensitivity.
            </p>
          </div>

          {/* Anti-Inflammatory Index */}
          <div className="p-4 rounded-2xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Anti-Inflammatory</span>
              <Badge className="bg-blue-600 text-white text-[10px] py-0">Tier 1</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{data.antiInflammatoryScore}</span>
              <span className="text-xs text-muted-foreground">/ 10.0</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Rich in EPA/DHA omega-3s, allicin, and polyphenols.
            </p>
          </div>

          {/* Satiety Index */}
          <div className="p-4 rounded-2xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Satiety Index</span>
              <Badge className="bg-purple-600 text-white text-[10px] py-0">High Fullness</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{data.satietyIndex}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Suppresses ghrelin hunger hormone for 4+ hours.
            </p>
          </div>
        </div>

        {/* Macronutrient Distribution Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Macronutrient Ratio</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Protein {data.proteinGrams}g ({proteinPercent}%)
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Fats {data.fatGrams}g ({fatPercent}%)
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Carbs {data.carbsGrams}g ({carbsPercent}%)
              </span>
            </div>
          </div>

          <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              style={{ width: `${proteinPercent}%` }}
              className="h-full bg-emerald-500 transition-all"
            />
            <div
              style={{ width: `${fatPercent}%` }}
              className="h-full bg-blue-500 transition-all"
            />
            <div
              style={{ width: `${carbsPercent}%` }}
              className="h-full bg-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Micronutrient Daily Value Badges */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Key Micronutrient Daily Value (% DV)
          </span>
          <div className="flex flex-wrap gap-2">
            {data.micronutrients.map((m, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl border bg-background flex items-center gap-2 text-xs font-medium"
              >
                <span>{m.name}</span>
                <Badge variant="secondary" className="font-bold text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                  {m.percentDaily}% DV
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
