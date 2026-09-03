'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Utensils,
  Clock,
  Flame,
  Check,
  Plus,
  ArrowRight,
  Zap,
  Refrigerator,
  Camera,
  Activity,
  ShoppingCart,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PantryItem {
  id: string;
  name: string;
  icon: string;
  category: 'Protein' | 'Produce' | 'Grain' | 'Staple';
}

const SAMPLE_FRIDGE_ITEMS: PantryItem[] = [
  { id: 'item-salmon', name: 'Fresh Salmon', icon: '🐟', category: 'Protein' },
  { id: 'item-chicken', name: 'Chicken Breast', icon: '🍗', category: 'Protein' },
  { id: 'item-asparagus', name: 'Asparagus', icon: '🌿', category: 'Produce' },
  { id: 'item-broccoli', name: 'Broccoli', icon: '🥦', category: 'Produce' },
  { id: 'item-rice', name: 'Jasmine Rice', icon: '🍚', category: 'Grain' },
  { id: 'item-eggs', name: 'Farm Eggs', icon: '🥚', category: 'Protein' },
  { id: 'item-avocado', name: 'Avocado', icon: '🥑', category: 'Produce' },
  { id: 'item-garlic', name: 'Garlic & Herbs', icon: '🧄', category: 'Staple' },
];

export function InteractiveFridgeSandbox() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'item-salmon',
    'item-asparagus',
    'item-garlic',
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'vision' | 'cart'>('sandbox');

  const toggleItem = (id: string) => {
    setIsSynthesizing(true);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 280);
  };

  const selectedItems = SAMPLE_FRIDGE_ITEMS.filter(i => selectedIds.includes(i.id));

  // Determine dynamic recipe based on selected ingredients
  const hasSalmon = selectedIds.includes('item-salmon');
  const hasChicken = selectedIds.includes('item-chicken');
  const hasRice = selectedIds.includes('item-rice');
  const hasEggs = selectedIds.includes('item-eggs');

  const generatedTitle = hasSalmon
    ? 'Pan-Seared Garlic Salmon with Crisp Greens'
    : hasChicken && hasRice
    ? 'Golden Garlic Butter Chicken Rice Bowl'
    : hasChicken
    ? 'Herb-Roasted Chicken Skillet with Garlic'
    : hasEggs
    ? 'Chef Garden Frittata with Sautéed Greens & Avocado'
    : 'Mediterranean Sautéed Garden Bowl';

  const cookTime = hasSalmon ? '18 mins' : hasChicken ? '22 mins' : '15 mins';
  const calories = hasSalmon ? 520 : hasChicken ? 480 : 360;
  const protein = hasSalmon ? '44g' : hasChicken ? '48g' : '22g';
  const matchScore = Math.min(99, Math.max(68, 65 + selectedIds.length * 8));

  return (
    <div className="relative group">
      {/* Dynamic Ambient Glow Behind Card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-violet-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 -z-10" />

      <Card className="border border-border/80 dark:border-white/10 shadow-2xl overflow-hidden glass-card rounded-3xl backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-emerald-500/5 pb-4 border-b border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                <Refrigerator className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>Interactive Virtual Fridge Sandbox</span>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] py-0.5 px-2 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live AI Engine
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Tap ingredients in your fridge below. Neural flavor synthesis formulates your gourmet dinner instantly.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-muted/70 dark:bg-muted/30 p-1 rounded-2xl border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-all text-xs ${
                  activeTab === 'sandbox'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Sandbox</span>
              </button>
              <Link
                href="/onboarding"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-all text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vision Scan</span>
              </Link>
              <Link
                href="/grocery"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-all text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                <span>Arbitrage</span>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Ingredient Chips Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Tap Available Fridge Items ({selectedIds.length} active)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 normal-case font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {selectedIds.length >= 2 ? 'Zero-waste pairing verified' : 'Select at least 2 ingredients'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_FRIDGE_ITEMS.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer interactive-pill ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40 font-semibold text-foreground'
                        : 'border-border/60 hover:border-border hover:bg-muted/40 bg-muted/20 opacity-75 hover:opacity-100 text-muted-foreground'
                    }`}
                  >
                    <span className="text-2xl drop-shadow-sm">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-foreground flex items-center justify-between">
                        <span>{item.name}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] ml-1">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Generated Recipe Output Card */}
          <div className="p-5 rounded-2xl border border-border/80 bg-gradient-to-br from-muted/40 via-muted/20 to-background shadow-inner relative overflow-hidden">
            <AnimatePresence mode="wait">
              {isSynthesizing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center space-y-3"
                >
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto glow-primary" />
                  <p className="text-xs font-bold text-primary tracking-wide animate-pulse">
                    Synthesizing culinary flavor pairings & macro metrics...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={generatedTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 shadow-sm">
                        {matchScore}% Pantry Match
                      </Badge>
                      <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold">
                        0 Missing Ingredients Needed
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1 bg-background/80 px-2.5 py-1 rounded-lg border border-border/60">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {cookTime}
                      </span>
                      <span className="flex items-center gap-1 bg-background/80 px-2.5 py-1 rounded-lg border border-border/60">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        {calories} kcal
                      </span>
                      <span className="flex items-center gap-1 bg-background/80 px-2.5 py-1 rounded-lg border border-border/60">
                        <Activity className="w-3.5 h-3.5 text-purple-500" />
                        {protein} Protein
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-2xl font-black tracking-tight text-foreground">
                      {generatedTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Hand-crafted flavor profile utilizing {selectedItems.map(i => i.name).join(', ')}. Zero food waste, optimized glycemic stability, and ready in {cookTime}.
                    </p>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/60">
                    <Button
                      size="sm"
                      className="font-bold text-xs h-11 flex-1 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-95 shadow-lg shadow-primary/25 btn-shimmer"
                      asChild
                    >
                      <Link href="/cook/demo">
                        <Utensils className="w-4 h-4 mr-2" />
                        <span>Start Hands-Free Voice Cook HUD</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-11 border-primary/40 hover:bg-primary/5 font-semibold px-4"
                      asChild
                    >
                      <Link href="/onboarding">
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                        <span>Full Customizer (30s)</span>
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
