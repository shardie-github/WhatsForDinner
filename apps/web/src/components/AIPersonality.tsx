/**
 * AI Personality Component
 * Friendly, conversational AI interactions with personality
 */

'use client';

import { useState } from 'react';
import { Sparkles, ChefHat, Heart, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AIPersonalityProps {
  message?: string;
  context?: 'suggestion' | 'greeting' | 'encouragement' | 'celebration';
  showAvatar?: boolean;
}

const personalityMessages = {
  greeting: [
    "Hey there! 👋 I'm here to help you find something delicious for dinner.",
    "Hi! Ready to discover your next favorite meal?",
    "Hello! Let's find you something amazing to cook tonight.",
  ],
  suggestion: [
    "I think you'll love this! It's perfect for what you have.",
    "Here's something I think you'll enjoy - it uses ingredients you already have!",
    "I found something special for you! This recipe is right up your alley.",
  ],
  encouragement: [
    "You've got this! Cooking is all about having fun.",
    "Don't worry - I'm here to help every step of the way!",
    "You're doing great! Let's make something delicious together.",
  ],
  celebration: [
    "Awesome choice! 🎉 This is going to be delicious!",
    "Perfect! You're going to love how this turns out!",
    "Excellent! This recipe is one of my favorites!",
  ],
};

export function AIPersonality({ 
  message, 
  context = 'greeting',
  showAvatar = true 
}: AIPersonalityProps) {
  const [currentMessage] = useState(() => {
    if (message) return message;
    const messages = personalityMessages[context];
    return messages[Math.floor(Math.random() * messages.length)];
  });

  const getIcon = () => {
    switch (context) {
      case 'suggestion':
        return <ChefHat className="w-5 h-5" />;
      case 'encouragement':
        return <Heart className="w-5 h-5" />;
      case 'celebration':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showAvatar && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              {getIcon()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Your AI Cooking Assistant</p>
            <p className="text-muted-foreground leading-relaxed">{currentMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
