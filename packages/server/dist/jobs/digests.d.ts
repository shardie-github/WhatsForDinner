import { Job } from 'bullmq';
interface DigestJobData {
    userId: string;
    weekStart: string;
}
export declare function digestProcessor(job: Job<DigestJobData>): Promise<{
    success: boolean;
    meals: number;
    calories: any;
}>;
export {};
//# sourceMappingURL=digests.d.ts.map