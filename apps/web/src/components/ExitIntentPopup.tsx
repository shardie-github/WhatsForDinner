/**
 * Exit Intent Popup
 * Shows offer when user tries to leave
 * Non-intrusive, value-focused
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('exit_intent_dismissed');
    if (dismissed) {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissed) < oneWeek) {
        return;
      }
    }

    // Detect exit intent (mouse leaving viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('exit_intent_dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-md w-full animate-in slide-in-from-bottom-5">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Wait! Get 20% Off Pro</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Limited time offer. Upgrade to Pro and unlock unlimited recipes, advanced customization, and more.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">$7.99/month</div>
            <div className="text-sm text-muted-foreground line-through">$9.99/month</div>
            <div className="text-xs text-green-600 mt-1">Save $24/year</div>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/pricing?discount=20off">
                Claim Offer
              </Link>
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              No Thanks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
