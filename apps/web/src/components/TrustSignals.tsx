/**
 * Trust Signals Component
 * Displays social proof, user counts, ratings, and activity indicators
 */

'use client';

import { Users, Star, TrendingUp, Shield, CheckCircle2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TrustSignalsProps {
  variant?: 'compact' | 'full' | 'inline';
  showActivity?: boolean;
  showRatings?: boolean;
  showSecurity?: boolean;
}

export function TrustSignals({ 
  variant = 'full', 
  showActivity = true,
  showRatings = true,
  showSecurity = true 
}: TrustSignalsProps) {
  const stats = {
    users: '12,847+',
    rating: '4.8',
    recipesToday: '1,247',
    satisfaction: '94%',
  };

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        {showActivity && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{stats.users} users</span>
          </div>
        )}
        {showRatings && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{stats.rating}/5</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{stats.recipesToday} recipes today</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{stats.recipesToday} recipes generated today</span>
        </div>
        {showRatings && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{stats.rating}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Users */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>

          {/* Rating */}
          {showRatings && (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{stats.rating}/5</div>
              <div className="text-xs text-muted-foreground">Average Rating</div>
            </div>
          )}

          {/* Activity */}
          {showActivity && (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.recipesToday}</div>
              <div className="text-xs text-muted-foreground">Recipes Today</div>
            </div>
          )}

          {/* Satisfaction */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.satisfaction}</div>
            <div className="text-xs text-muted-foreground">Satisfaction</div>
          </div>
        </div>

        {/* Security Badges */}
        {showSecurity && (
          <div className="mt-6 pt-6 border-t flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Shield className="w-3 h-3" />
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Secure & Private
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Award className="w-3 h-3" />
              Trusted by Families
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
