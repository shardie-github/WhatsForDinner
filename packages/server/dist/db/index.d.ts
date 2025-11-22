import postgres from 'postgres';
import * as schema from './schema.js';
import type { PaginationParams, PaginatedResponse } from '../types.js';
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
export declare function paginateQuery<T>(query: Promise<T[]>, countQuery: Promise<{
    count: number;
}[]>, params: PaginationParams): Promise<PaginatedResponse<T>>;
export declare const usersRepo: {
    findById(id: string): Promise<{
        plan: "free" | "premium" | "partner";
        id: string;
        email: string;
        preferences: {
            diet?: string[];
            allergens?: string[];
            units?: "metric" | "imperial";
            theme?: "light" | "dark";
        } | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
    findByEmail(email: string): Promise<{
        plan: "free" | "premium" | "partner";
        id: string;
        email: string;
        preferences: {
            diet?: string[];
            allergens?: string[];
            units?: "metric" | "imperial";
            theme?: "light" | "dark";
        } | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
    update(id: string, data: Partial<typeof schema.users.$inferInsert>): Promise<{
        id: string;
        email: string;
        plan: "free" | "premium" | "partner";
        preferences: {
            diet?: string[];
            allergens?: string[];
            units?: "metric" | "imperial";
            theme?: "light" | "dark";
        } | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
};
export declare const mealPlansRepo: {
    findByUserAndDay(userId: string, day: Date): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        household_id: string | null;
        user_id: string;
        day: string;
        items: {
            slot: "breakfast" | "lunch" | "dinner" | "snack";
            recipe_id: string;
            macros?: {
                calories: number;
                protein: number;
                carbs: number;
                fat: number;
            };
        }[];
    } | null>;
    findByUser(userId: string, params?: PaginationParams): Promise<PaginatedResponse<{
        id: string;
        created_at: Date;
        updated_at: Date;
        household_id: string | null;
        user_id: string;
        day: string;
        items: {
            slot: "breakfast" | "lunch" | "dinner" | "snack";
            recipe_id: string;
            macros?: {
                calories: number;
                protein: number;
                carbs: number;
                fat: number;
            };
        }[];
    }>>;
    upsert(plan: typeof schema.mealPlans.$inferInsert): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        household_id: string | null;
        user_id: string;
        day: string;
        items: {
            slot: "breakfast" | "lunch" | "dinner" | "snack";
            recipe_id: string;
            macros?: {
                calories: number;
                protein: number;
                carbs: number;
                fat: number;
            };
        }[];
    } | null>;
    delete(id: string, userId: string): Promise<void>;
};
export declare const recipesRepo: {
    search(query: string, filters?: {
        tags?: string[];
        macro?: string;
    }): Promise<any>;
    findById(id: string): Promise<{
        steps: {
            step: number;
            instruction: string;
            duration_min?: number;
        }[];
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        title: string;
        media_url: string | null;
        ingredients: {
            name: string;
            quantity: number;
            unit: string;
        }[];
        macros: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        } | null;
        tags: string[] | null;
        source: "partner" | "curated" | "user";
    } | null>;
    create(recipe: typeof schema.recipes.$inferInsert): Promise<{
        steps: {
            step: number;
            instruction: string;
            duration_min?: number;
        }[];
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        title: string;
        media_url: string | null;
        ingredients: {
            name: string;
            quantity: number;
            unit: string;
        }[];
        macros: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        } | null;
        tags: string[] | null;
        source: "partner" | "curated" | "user";
    } | null>;
};
export declare const groceryListsRepo: {
    findByHousehold(householdId: string): Promise<{
        id: string;
        name: string | null;
        created_at: Date;
        updated_at: Date;
        household_id: string;
        items: {
            title: string;
            qty: number;
            unit: string;
            checked: boolean;
        }[];
    }[]>;
    findById(id: string): Promise<{
        id: string;
        name: string | null;
        created_at: Date;
        updated_at: Date;
        household_id: string;
        items: {
            title: string;
            qty: number;
            unit: string;
            checked: boolean;
        }[];
    } | null>;
    upsert(list: typeof schema.groceryLists.$inferInsert): Promise<{
        id: string;
        name: string | null;
        created_at: Date;
        updated_at: Date;
        household_id: string;
        items: {
            title: string;
            qty: number;
            unit: string;
            checked: boolean;
        }[];
    } | null>;
    delete(id: string): Promise<void>;
};
export declare const healthMetricsRepo: {
    findByUser(userId: string, filters?: {
        kind?: string;
        from?: Date;
        to?: Date;
    }): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        kind: "weight" | "sleep" | "water" | "steps" | "calories";
        value: string;
        unit: string;
        ts: Date;
    }[]>;
    create(metric: typeof schema.healthMetrics.$inferInsert): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        kind: "weight" | "sleep" | "water" | "steps" | "calories";
        value: string;
        unit: string;
        ts: Date;
    } | null>;
};
export declare const eventsRepo: {
    create(event: typeof schema.events.$inferInsert): Promise<{
        id: string;
        name: string;
        user_id: string | null;
        ts: Date;
        props: Record<string, unknown> | null;
    } | null>;
    findByUser(userId: string, params?: PaginationParams): Promise<PaginatedResponse<{
        id: string;
        name: string;
        user_id: string | null;
        ts: Date;
        props: Record<string, unknown> | null;
    }>>;
};
export declare const webhookEventsRepo: {
    findByExternalId(source: string, externalId: string): Promise<{
        id: string;
        created_at: Date;
        source: string;
        external_id: string;
        payload: unknown;
        processed_at: Date | null;
    } | null>;
    create(event: typeof schema.webhookEvents.$inferInsert): Promise<{
        id: string;
        created_at: Date;
        source: string;
        external_id: string;
        payload: unknown;
        processed_at: Date | null;
    } | null>;
    markProcessed(id: string): Promise<void>;
};
export declare const featureFlagsRepo: {
    findByUser(userId: string): Promise<Record<string, boolean>>;
    upsert(userId: string, flags: Record<string, boolean>): Promise<void>;
};
export declare function computeResponseETag(data: unknown): string;
export declare function closeDb(): Promise<void>;
export * as schema from './schema.js';
export { clicks, partners, users, households, recipes, mealPlans, groceryLists } from './schema.js';
//# sourceMappingURL=index.d.ts.map