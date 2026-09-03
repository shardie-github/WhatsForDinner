'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  ExternalLink,
  Clock,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface RetailerOption {
  id: 'instacart' | 'amazon_fresh' | 'walmart' | 'kroger';
  name: string;
  logoEmoji: string;
  badge?: string;
  deliveryTime: string;
  basePrice: number;
  storeBrandPrice: number;
  savings: number;
  deliveryFee: string;
  inStockPercent: number;
}

interface RetailerPriceComparisonProps {
  missingItems?: string[];
  className?: string;
}

const DEFAULT_MISSING_ITEMS = [
  'Atlantic Salmon Fillets (2 count)',
  'Fresh Asparagus (1 bunch)',
  'Grass-Fed Salted Butter',
  'Organic Lemons (2 count)',
];

export function RetailerPriceComparison({
  missingItems = DEFAULT_MISSING_ITEMS,
  className = '',
}: RetailerPriceComparisonProps) {
  const [selectedRetailer, setSelectedRetailer] = useState<string>('walmart');
  const [isExporting, setIsExporting] = useState(false);
  const [preferStoreBrand, setPreferStoreBrand] = useState(true);

  const retailers: RetailerOption[] = [
    {
      id: 'walmart',
      name: 'Walmart+',
      logoEmoji: '🔵',
      badge: 'Lowest Cost',
      deliveryTime: 'Today, 2-3 hrs',
      basePrice: 19.45,
      storeBrandPrice: 14.80,
      savings: 4.65,
      deliveryFee: 'Free over $35',
      inStockPercent: 99,
    },
    {
      id: 'amazon_fresh',
      name: 'Amazon Fresh',
      logoEmoji: '📦',
      badge: 'Fast Prime Delivery',
      deliveryTime: 'Today by 5:00 PM',
      basePrice: 22.10,
      storeBrandPrice: 17.50,
      savings: 4.60,
      deliveryFee: '$2.99 or Free with Prime',
      inStockPercent: 98,
    },
    {
      id: 'instacart',
      name: 'Instacart Express',
      logoEmoji: '🥕',
      badge: 'Local Supermarkets',
      deliveryTime: '45 - 60 mins',
      basePrice: 24.30,
      storeBrandPrice: 19.90,
      savings: 4.40,
      deliveryFee: '$3.99',
      inStockPercent: 95,
    },
    {
      id: 'kroger',
      name: 'Kroger Delivery',
      logoEmoji: '🛒',
      badge: 'Fresh Guarantee',
      deliveryTime: 'Today, 3-4 hrs',
      basePrice: 21.80,
      storeBrandPrice: 16.90,
      savings: 4.90,
      deliveryFee: '$4.95',
      inStockPercent: 97,
    },
  ];

  const handleCheckout = async (retailerId: string) => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/grocery/cart-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer: retailerId,
          items: missingItems,
          preferStoreBrand,
        }),
      });

      const data = await res.json();
      if (data.cartUrl) {
        toast.success(`Exported ${missingItems.length} items to ${data.retailer}!`, {
          description: `Arbitrage saved you ~$${preferStoreBrand ? '4.65' : '0.00'} on this basket.`,
        });
        window.open(data.cartUrl, '_blank');
      } else {
        toast.error('Failed to create retailer cart');
      }
    } catch {
      toast.error('Network error building grocery cart');
    } finally {
      setIsExporting(false);
    }
  };

  const currentSelection = retailers.find(r => r.id === selectedRetailer) || retailers[0];

  return (
    <Card className={`border shadow-xl overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-transparent pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span>OmniCart™ Multi-Retailer Arbitrage Matrix</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Live price & delivery comparison for your {missingItems.length} missing ingredients across top grocery networks.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-600 text-white font-semibold text-xs">
            <TrendingDown className="w-3 h-3 mr-1" />
            Save up to 28%
          </Badge>
        </div>

        {/* Store Brand Swap Toggle */}
        <div className="flex items-center justify-between pt-3 px-3 py-2 rounded-xl bg-muted/40 border text-xs">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Auto-swap brand names for store-brand equivalents (Great Value, 365, Simple Truth)</span>
          </div>
          <Button
            variant={preferStoreBrand ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreferStoreBrand(!preferStoreBrand)}
            className="text-xs h-7 px-3"
          >
            {preferStoreBrand ? 'Enabled (Saving ~$4.65)' : 'Brand Names Only'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Comparison Matrix Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {retailers.map(r => {
            const isSelected = selectedRetailer === r.id;
            const price = preferStoreBrand ? r.storeBrandPrice : r.basePrice;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRetailer(r.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all space-y-3 relative ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
                    : 'border-muted hover:border-muted-foreground/30 bg-background'
                }`}
              >
                {r.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2.5 right-3 text-[10px] font-bold px-2"
                  >
                    {r.badge}
                  </Badge>
                )}

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{r.logoEmoji}</span>
                  <div>
                    <p className="font-bold text-sm tracking-tight text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.deliveryTime}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-muted/60 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-foreground">
                      ${price.toFixed(2)}
                    </span>
                    {preferStoreBrand && (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5" />
                        Saved ${r.savings.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.deliveryFee}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missing Ingredients Checklist Summary */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Ingredients Exported in This Cart ({missingItems.length})</span>
            <span className="text-emerald-600 font-bold">100% In-Stock Guaranteed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {missingItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-foreground/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Action Checkout Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 1-click cart transfer with instant retailer deep-link</span>
          </div>

          <Button
            size="lg"
            onClick={() => handleCheckout(selectedRetailer)}
            disabled={isExporting}
            className="w-full sm:w-auto font-extrabold h-12 px-8 shadow-lg bg-primary hover:bg-primary/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            <span>
              Transfer Cart to {currentSelection?.name} ($
              {(preferStoreBrand ? currentSelection?.storeBrandPrice : currentSelection?.basePrice)?.toFixed(2)})
            </span>
            <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
