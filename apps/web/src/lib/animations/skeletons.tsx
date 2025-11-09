/**
 * Loading Skeletons
 * Better loading states than spinners
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecipeCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg mb-4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse mb-4" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
