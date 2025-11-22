import { Job } from 'bullmq';
interface MealGenJobData {
    userId: string;
    day: string;
    householdId?: string;
    preferences?: {
        calorie_target?: number;
        macros?: {
            protein?: number;
            carbs?: number;
            fat?: number;
        };
        allergens?: string[];
    };
    pantry?: Array<{
        name: string;
        quantity: number;
        unit: string;
    }>;
}
export declare function mealGenProcessor(job: Job<MealGenJobData>): Promise<{
    success: boolean;
    planId: string | undefined;
}>;
export {};
//# sourceMappingURL=mealGen.d.ts.map