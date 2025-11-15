/**
 * CTA Optimizer Component
 * Smart CTA hierarchy based on user state and context
 */

'use client';

import { ArrowRight, Sparkles, Zap, Play, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CTAOptimizerProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  context?: 'homepage' | 'onboarding' | 'dashboard' | 'recipe';
  userState?: 'new' | 'returning' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

export function CTAOptimizer({ 
  variant = 'primary', 
  context = 'homepage',
  userState = 'new',
  size = 'lg'
}: CTAOptimizerProps) {
  const pathname = usePathname();

  // Determine best CTA based on context and user state
  const getCTAs = () => {
    if (context === 'homepage') {
      if (userState === 'new') {
        return {
          primary: { text: 'Surprise Me!', href: '/surprise-me', icon: Sparkles },
          secondary: { text: 'Start Planning Free', href: '/signup', icon: ArrowRight },
          tertiary: { text: 'Watch Demo', href: '/demo', icon: Play },
        };
      }
      return {
        primary: { text: 'Get Today\'s Recipe', href: '/surprise-me', icon: Sparkles },
        secondary: { text: 'Play Games', href: '/play', icon: Play },
        tertiary: { text: 'View Dashboard', href: '/dashboard', icon: ArrowRight },
      };
    }

    if (context === 'onboarding') {
      return {
        primary: { text: 'Surprise Me with a Recipe!', href: '/surprise-me', icon: Zap },
        secondary: { text: 'Skip and Explore', href: '/dashboard', icon: ArrowRight },
        tertiary: null,
      };
    }

    if (context === 'dashboard') {
      return {
        primary: { text: 'Get Recipe Suggestion', href: '/surprise-me', icon: Sparkles },
        secondary: { text: 'Play Decision Games', href: '/play', icon: Play },
        tertiary: { text: 'Shop Groceries', href: '/grocery', icon: ShoppingCart },
      };
    }

    if (context === 'recipe') {
      return {
        primary: { text: 'Add to Grocery List', href: '/grocery', icon: ShoppingCart },
        secondary: { text: 'Get Another Recipe', href: '/surprise-me', icon: Sparkles },
        tertiary: { text: 'Save Recipe', href: '#', icon: ArrowRight },
      };
    }

    return {
      primary: { text: 'Get Started', href: '/surprise-me', icon: Sparkles },
      secondary: null,
      tertiary: null,
    };
  };

  const ctas = getCTAs();
  const selectedCTA = variant === 'primary' ? ctas.primary : 
                     variant === 'secondary' ? ctas.secondary : 
                     ctas.tertiary;

  if (!selectedCTA) return null;

  const Icon = selectedCTA.icon;
  const buttonSize = size === 'sm' ? 'sm' : size === 'md' ? 'default' : 'lg';
  const buttonClass = variant === 'primary' 
    ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
    : variant === 'secondary'
    ? 'variant-outline'
    : 'variant-ghost';

  return (
    <Button 
      asChild
      size={buttonSize}
      className={buttonClass}
    >
      <Link href={selectedCTA.href}>
        <Icon className={`w-4 h-4 ${variant === 'primary' ? 'mr-2' : 'mr-2'}`} />
        {selectedCTA.text}
        {variant === 'primary' && <ArrowRight className="w-4 h-4 ml-2" />}
      </Link>
    </Button>
  );
}
