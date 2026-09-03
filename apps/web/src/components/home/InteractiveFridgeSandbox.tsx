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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PantryItem {
  id: string;
  name: string;
  icon: string;
  category: string;
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
  const [selectedIds, setSelectedIds] = useState<string[]>(['item-salmon', 'item-asparagus', 'item-garlic']);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'vision' | 'cart' | 'metabolic'>('sandbox');

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 600);
  };

  const selectedItems = SAMPLE_FRIDGE_ITEMS.filter(i => selectedIds.includes(i.id));

  // Determine dynamic recipe based on selected ingredients
  const hasSalmon = selectedIds.includes('item-salmon');
  const hasChicken = selectedIds.includes('item-chicken');
  const hasRice = selectedIds.includes('item-rice');

  const generatedTitle = hasSalmon
    ? 'Pan-Seared Garlic Salmon with Crisp Greens'
    : hasChicken && hasRice
    ? 'Golden Garlic Butter Chicken Rice Bowl'
    : hasChicken
    ? 'Herb-Roasted Chicken Skillet with Garlic'
    : 'Chef Garden Frittata with Sautéed Greens';

  const cookTime = hasSalmon ? '18 mins' : hasChicken ? '22 mins' : '15 mins';
  const calories = hasSalmon ? 540 : hasChicken ? 490 : 380;
  const matchScore = Math.min(98, 70 + selectedIds.length * 9);

  return (
    <Card className="border-2 border-primary/30 shadow-2xl overflow-hidden bg-background/90 backdrop-blur rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span>Interactive Virtual Fridge Sandbox</span>
                <Badge className="bg-primary text-primary-foreground text-[10px] py-0">
                  Live Demo
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Tap what&apos;s in your fridge below. Watch our neural chef generate a custom dinner in real-time.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs">
            <Button
              variant={activeTab === 'sandbox' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sandbox')}
              className="text-xs h-7 px-2.5"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Live AI Sandbox
            </Button>
            <Button
              variant={activeTab === 'vision' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('vision')}
              className="text-xs h-7 px-2.5"
              asChild
            >
              <Link href="/onboarding">
                <Camera className="w-3.5 h-3.5 mr-1" />
                Vision Scan
              </Link>
            </Button>
            <Button
              variant={activeTab === 'cart' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('cart')}
              className="text-xs h-7 px-2.5"
              asChild
            >
              <Link href="/grocery">
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Arbitrage
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Ingredient Chips Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Tap Available Ingredients ({selectedIds.length} active)</span>
            <span className="text-primary normal-case font-bold text-[11px]">
              {selectedIds.length >= 2 ? '✓ Ready to synthesize' : 'Select at least 2'}
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
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40 font-semibold'
                      : 'border-muted hover:border-muted-foreground/30 bg-muted/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Generated Recipe Output Card */}
        <div className="p-5 rounded-2xl border bg-muted/20 space-y-4 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isSynthesizing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center space-y-2"
              >
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Synthesizing culinary flavor pairings...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={generatedTitle}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">
                    {matchScore}% Pantry Match
                  </Badge>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {cookTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {calories} kcal
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {generatedTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Customized precisely for {selectedItems.map(i => i.name).join(', ')}. Zero food waste, ready in {cookTime}.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    className="font-bold text-xs h-10 flex-1 bg-primary hover:bg-primary/90 shadow-md"
                    asChild
                  >
                    <Link href="/cook/demo">
                      <Utensils className="w-4 h-4 mr-1.5" />
                      <span>Start Hands-Free Voice Cook HUD</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-10 border-primary/30"
                    asChild
                  >
                    <Link href="/onboarding">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
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
  );
}
