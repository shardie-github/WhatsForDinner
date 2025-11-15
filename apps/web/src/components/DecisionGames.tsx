/**
 * Decision Games Component
 * Interactive games to help users decide what to cook
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Heart, Clock, Zap, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const games: Game[] = [
  {
    id: 'spin-wheel',
    name: 'Spin the Wheel',
    description: 'Let chance decide your dinner',
    icon: <Shuffle className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    href: '/play/spin-wheel',
  },
  {
    id: 'dinner-duel',
    name: 'Dinner Duel',
    description: 'Compare two options and pick your favorite',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-red-500 to-orange-500',
    href: '/play/dinner-duel',
  },
  {
    id: 'mystery-ingredient',
    name: 'Mystery Ingredient',
    description: 'Get a surprise ingredient and build around it',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    href: '/play/mystery-ingredient',
  },
  {
    id: 'quick-pick',
    name: 'Quick Pick',
    description: 'Fast decision for when you\'re in a hurry',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-yellow-500 to-orange-500',
    href: '/play/quick-pick',
  },
];

export function DecisionGames() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Decision Games</h2>
        <p className="text-muted-foreground">
          Can't decide? Let our games help you choose!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:border-primary transition-all border-2"
              onClick={() => router.push(game.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{game.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Play Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Featured Game */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Featured: Spin the Wheel</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Our most popular game! Spin to get a random recipe suggestion.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => router.push('/play/spin-wheel')}
            className="w-full bg-gradient-to-r from-primary to-accent"
            size="lg"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Try Spin the Wheel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
