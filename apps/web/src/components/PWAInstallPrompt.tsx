/**
 * PWA Install Prompt Component
 * Smart install prompt that shows after positive engagement
 * 
 * Shows after:
 * - User generates 3+ recipes
 * - User spends 2+ minutes on site
 * - User saves a recipe
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user engagement
      const recipeCount = parseInt(localStorage.getItem('recipe_count') || '0');
      const timeOnSite = parseInt(localStorage.getItem('time_on_site') || '0');
      
      if (recipeCount >= 3 || timeOnSite >= 120000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // Track install
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'install_prompt'
        });
      }
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install_prompt_dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  // Check if dismissed recently (within 7 days)
  const dismissed = localStorage.getItem('install_prompt_dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime < sevenDays) {
      return null;
    }
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-xl border-2 border-primary animate-in slide-in-from-bottom-5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Install App</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Install our app for faster access, offline recipes, and push notifications.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </Button>
              <Button onClick={handleDismiss} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
