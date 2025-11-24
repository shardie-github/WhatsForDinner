/**
 * Database Query Optimization Helpers
 * 
 * Provides utilities for optimizing database queries
 */

import { PrismaClient } from '@prisma/client';

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  constructor(private prisma: PrismaClient) {}

  /**
   * Batch load related data to avoid N+1 queries
   */
  async batchLoad<T, K extends keyof T>(
    items: T[],
    relationKey: K,
    loader: (ids: string[]) => Promise<Map<string, T[K] extends (infer U)[] ? U : T[K] extends Promise<infer U> ? U : never>>
  ): Promise<void> {
    // Extract IDs from items
    const ids = items
      .map((item) => {
        const relation = item[relationKey];
        if (Array.isArray(relation)) {
          return relation.map((r: any) => r.id);
        }
        return (relation as any)?.id;
      })
      .filter(Boolean)
      .flat();

    // Load all relations in one query
    const relations = await loader(ids);

    // Attach relations to items
    items.forEach((item) => {
      const relation = item[relationKey];
      if (Array.isArray(relation)) {
        // Handle array relations
        (item[relationKey] as any) = relation.map((r: any) => relations.get(r.id) || r);
      } else {
        // Handle single relations
        const id = (relation as any)?.id;
        if (id && relations.has(id)) {
          (item[relationKey] as any) = relations.get(id);
        }
      }
    });
  }

  /**
   * Paginate query results efficiently
   */
  async paginate<T>(
    query: () => Promise<T[]>,
    page: number,
    limit: number,
    totalCount?: () => Promise<number>
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    
    // Execute query and count in parallel
    const [data, total] = await Promise.all([
      query(),
      totalCount ? totalCount() : Promise.resolve(0),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Select only needed fields to reduce data transfer
   */
  selectFields<T extends Record<string, any>>(
    fields: (keyof T)[]
  ): Partial<Record<keyof T, boolean>> {
    const selection: Partial<Record<keyof T, boolean>> = {};
    fields.forEach((field) => {
      selection[field] = true;
    });
    return selection;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * const optimizer = new QueryOptimizer(prisma);
 * 
 * // Batch load user's meal plans
 * const users = await prisma.user.findMany();
 * await optimizer.batchLoad(users, 'mealPlans', async (userIds) => {
 *   const mealPlans = await prisma.mealPlan.findMany({
 *     where: { userId: { in: userIds } },
 *   });
 *   return new Map(mealPlans.map(mp => [mp.userId, mp]));
 * });
 * 
 * // Paginate recipes
 * const result = await optimizer.paginate(
 *   () => prisma.recipe.findMany({ skip, take: limit }),
 *   page,
 *   limit,
 *   () => prisma.recipe.count()
 * );
 * ```
 */

/**
 * Common query patterns
 */
export const queryPatterns = {
  /**
   * Get user with related data efficiently
   */
  async getUserWithRelations(prisma: PrismaClient, userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        mealPlans: {
          take: 7, // Last 7 days
          orderBy: { day: 'desc' },
        },
        ownedHouseholds: {
          include: {
            members: {
              take: 10, // Limit members
            },
          },
        },
      },
    });
  },

  /**
   * Get recipes with pagination
   */
  async getRecipesPaginated(
    prisma: PrismaClient,
    page: number,
    limit: number,
    filters?: {
      tags?: string[];
      userId?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: {
          ...(filters?.tags && { tags: { hasSome: filters.tags } }),
          ...(filters?.userId && { userId: filters.userId }),
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recipe.count({
        where: {
          ...(filters?.tags && { tags: { hasSome: filters.tags } }),
          ...(filters?.userId && { userId: filters.userId }),
        },
      }),
    ]);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },
};
