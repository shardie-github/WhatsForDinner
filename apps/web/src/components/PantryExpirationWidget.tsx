'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface PantryItem {
  id: string;
  ingredient: string;
  expiration_date?: string;
  days_until_expiration?: number;
}

export default function PantryExpirationWidget() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadExpiringItems(user.id);
      }
    };
    fetchUser();
  }, []);

  const loadExpiringItems = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch pantry items with expiration dates
      const { data: pantryItems, error } = await supabase
        .from('pantry_items')
        .select('id, ingredient, expiration_date')
        .eq('user_id', userId)
        .not('expiration_date', 'is', null)
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      // Calculate days until expiration
      const itemsWithExpiration = (pantryItems || []).map(item => {
        if (!item.expiration_date) return null;
        
        const expirationDate = new Date(item.expiration_date);
        const today = new Date();
        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...item,
          days_until_expiration: diffDays,
        };
      }).filter(Boolean) as PantryItem[];

      setItems(itemsWithExpiration);
      
      // Track analytics
      await analytics.trackEvent('pantry_expiration_viewed', {
        items_count: itemsWithExpiration.length,
        expiring_soon: itemsWithExpiration.filter(i => (i.days_until_expiration || 0) <= 3).length,
      });
    } catch (error) {
      console.error('Error loading expiring items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpirationStatus = (days: number) => {
    if (days < 0) return { label: 'Expired', variant: 'destructive' as const, icon: XCircle };
    if (days <= 1) return { label: 'Expires Today', variant: 'destructive' as const, icon: AlertCircle };
    if (days <= 3) return { label: 'Expires Soon', variant: 'default' as const, icon: Clock };
    return { label: 'Good', variant: 'secondary' as const, icon: CheckCircle2 };
  };

  const getExpiringSoon = () => items.filter(i => (i.days_until_expiration || 0) <= 3);
  const getExpired = () => items.filter(i => (i.days_until_expiration || 0) < 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const expiringSoon = getExpiringSoon();
  const expired = getExpired();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pantry Expiration Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No items with expiration dates. Add expiration dates to your pantry items to track when they expire.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={expired.length > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{expired.length}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </CardContent>
        </Card>

        <Card className={expiringSoon.length > 0 ? 'border-orange-500' : ''}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {items.length - expired.length - expiringSoon.length}
              </div>
              <div className="text-sm text-muted-foreground">Good</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expired Items */}
      {expired.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Expired Items ({expired.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expired.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.ingredient}</div>
                    <div className="text-sm text-muted-foreground">
                      Expired {Math.abs(item.days_until_expiration || 0)} day(s) ago
                    </div>
                  </div>
                  <Badge variant="destructive">Expired</Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                // Navigate to recipe generator with expired items
                window.location.href = `/?ingredients=${expired.map(i => i.ingredient).join(',')}`;
              }}
            >
              Get Recipes for Expired Items
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Items */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="h-5 w-5" />
              Expiring Soon ({expiringSoon.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map(item => {
                const status = getExpirationStatus(item.days_until_expiration || 0);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.ingredient}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.days_until_expiration === 0
                          ? 'Expires today'
                          : `Expires in ${item.days_until_expiration} day(s)`}
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                // Navigate to recipe generator with expiring items
                window.location.href = `/?ingredients=${expiringSoon.map(i => i.ingredient).join(',')}`;
              }}
            >
              Get Recipes for Expiring Items
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Items List */}
      <Card>
        <CardHeader>
          <CardTitle>All Items with Expiration Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map(item => {
              const status = getExpirationStatus(item.days_until_expiration || 0);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.ingredient}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.expiration_date &&
                        new Date(item.expiration_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
