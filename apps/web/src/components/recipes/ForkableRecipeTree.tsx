'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  GitBranch,
  GitCommit,
  Plus,
  Minus,
  Check,
  Sparkles,
  ArrowRight,
  UserCheck,
  Coins,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface RecipeBranch {
  id: string;
  commitHash: string;
  author: string;
  branchName: string;
  stars: number;
  added: string[];
  removed: string[];
  description: string;
}

interface ForkableRecipeTreeProps {
  baseRecipeTitle?: string;
  baseRecipeId?: string;
  className?: string;
}

const DEFAULT_BRANCHES: RecipeBranch[] = [
  {
    id: 'branch-main',
    commitHash: 'a7b3c2e',
    author: 'Chef Gordon (Executive)',
    branchName: 'main (Master)',
    stars: 1240,
    added: ['Pan-Seared Garlic Butter', 'Lemon Zest Emulsion'],
    removed: [],
    description: 'The golden baseline standard with crispy skin and balanced acidity.',
  },
  {
    id: 'branch-spicy',
    commitHash: 'f4e912b',
    author: 'Maya Lin (@SpicyKitchen)',
    branchName: 'spicy-chili-crunch',
    stars: 890,
    added: ['Crispy Chili Oil (2 tbsp)', 'Smoked Paprika', 'Scallions'],
    removed: ['Lemon Zest Emulsion'],
    description: 'Infuses Sichuan peppercorn heat and crispy garlic crunch into the fish crust.',
  },
  {
    id: 'branch-airfryer',
    commitHash: 'c88109d',
    author: 'Dave (@QuickMacros)',
    branchName: 'air-fryer-12min',
    stars: 645,
    added: ['Avocado Oil Spray', 'Garlic Herb Rub'],
    removed: ['Butter', 'Pan Sauté Step'],
    description: 'Adapts cooking technique for 12-min 400°F air fryer with 0 messy cleanup.',
  },
];

export function ForkableRecipeTree({
  baseRecipeTitle = 'Pan-Seared Garlic Herb Salmon',
  baseRecipeId = 'recipe-salmon-01',
  className = '',
}: ForkableRecipeTreeProps) {
  const [branches, setBranches] = useState<RecipeBranch[]>(DEFAULT_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-main');
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');
  const [newAddIngredient, setNewAddIngredient] = useState('');

  const handleFork = async () => {
    if (!newBranchName) {
      toast.error('Please enter a branch name');
      return;
    }

    try {
      const res = await fetch('/api/recipes/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseRecipeId,
          baseRecipeTitle,
          branchName: newBranchName,
          changeSummary: newBranchDescription || 'Personal flavor adaptation',
          addedIngredients: newAddIngredient ? [newAddIngredient] : ['Special spice blend'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        const createdBranch: RecipeBranch = {
          id: data.fork.id,
          commitHash: data.fork.commitHash,
          author: 'You (Author)',
          branchName: data.fork.branchName,
          stars: 1,
          added: data.fork.diff.added,
          removed: data.fork.diff.removed,
          description: data.fork.changeSummary,
        };

        setBranches(prev => [createdBranch, ...prev]);
        setSelectedBranchId(createdBranch.id);
        setIsForkModalOpen(false);
        setNewBranchName('');
        setNewBranchDescription('');
        setNewAddIngredient('');

        toast.success(`Forked to branch "${createdBranch.branchName}"!`, {
          description: 'You now earn 30% royalties on grocery carts generated from this fork.',
        });
      }
    } catch {
      toast.error('Failed to fork recipe');
    }
  };

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <Card className={`border shadow-xl overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <GitFork className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Culinary Git™ Forkable Recipe Network</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Fork, tweak, and track culinary lineage. Creators earn 30% affiliate royalties when groceries are bought through their branch.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsForkModalOpen(true)}
            className="font-bold text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <GitFork className="w-4 h-4 mr-1.5" />
            <span>Fork This Recipe</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Branch Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {branches.map(branch => {
            const isSelected = selectedBranchId === branch.id;
            return (
              <Button
                key={branch.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBranchId(branch.id)}
                className={`text-xs h-8 font-mono ${
                  isSelected
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-muted'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 mr-1" />
                <span>{branch.branchName}</span>
                <span className="ml-1.5 opacity-70">★{branch.stars}</span>
              </Button>
            );
          })}
        </div>

        {/* Active Branch Commit Details Card */}
        {activeBranch && (
          <motion.div
            key={activeBranch.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border bg-muted/20 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                  commit #{activeBranch.commitHash}
                </span>
                <span className="text-xs text-muted-foreground">• by {activeBranch.author}</span>
              </div>

              <Badge className="bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span>30% Creator Royalties Active</span>
              </Badge>
            </div>

            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
              {activeBranch.description}
            </p>

            {/* Semantic Diff View (Green for added, Red for removed) */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingredient & Technique Delta (Diff)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Additions */}
                {activeBranch.added.length > 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Added to this branch ({activeBranch.added.length}):
                    </span>
                    {activeBranch.added.map((item, i) => (
                      <div key={i} className="text-emerald-800 dark:text-emerald-300 font-medium pl-4">
                        + {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border text-muted-foreground text-xs">
                    Baseline ingredients (no additions)
                  </div>
                )}

                {/* Removals */}
                {activeBranch.removed.length > 0 ? (
                  <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900 space-y-1">
                    <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                      <Minus className="w-3.5 h-3.5" /> Removed / Substituted:
                    </span>
                    {activeBranch.removed.map((item, i) => (
                      <div key={i} className="text-red-800 dark:text-red-300 line-through pl-4">
                        - {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border text-muted-foreground text-xs">
                    No ingredients removed
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Fork Modal */}
        <AnimatePresence>
          {isForkModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <Card className="max-w-md w-full bg-background border shadow-2xl rounded-3xl overflow-hidden p-6 space-y-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GitFork className="w-5 h-5 text-purple-600" />
                    <span>Create New Recipe Branch</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Fork "{baseRecipeTitle}" and attach your unique spin. You will receive 30% of all affiliate grocery revenue generated through your branch.
                  </CardDescription>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Branch Name</label>
                    <Input
                      placeholder="e.g. crispy-garlic-airfryer"
                      value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Added Ingredient or Twist</label>
                    <Input
                      placeholder="e.g. Truffle butter + fresh chives"
                      value={newAddIngredient}
                      onChange={e => setNewAddIngredient(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Description of Changes</label>
                    <Input
                      placeholder="e.g. Swapped regular butter for truffle butter to elevate the umami."
                      value={newBranchDescription}
                      onChange={e => setNewBranchDescription(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => setIsForkModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleFork}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    <GitCommit className="w-4 h-4 mr-1.5" />
                    <span>Commit & Publish Fork</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
