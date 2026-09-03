/**
 * Trust Fabric AI Layer
 * Learns user comfort zones and adapts recommendations
 */
import type { TrustFabricModel, DataClass, ResponseAction } from './types';
export interface UserBehavior {
    dataClass: DataClass;
    action: ResponseAction;
    userDecision: 'allow' | 'deny' | 'modify';
    timestamp: string;
}
export declare class TrustFabricAI {
    private modelPath;
    private model;
    constructor(userId: string, modelsDir?: string);
    private loadModel;
    private createDefaultModel;
    /**
     * Learn from user behavior
     */
    learnFromBehavior(behavior: UserBehavior): void;
    /**
     * Record privacy mode toggle
     */
    recordPrivacyToggle(): void;
    /**
     * Get adaptive recommendations
     */
    getRecommendations(): {
        tighten: DataClass[];
        loosen: DataClass[];
        rationale: string;
    };
    /**
     * Get predicted action for data class
     */
    getPredictedAction(dataClass: DataClass): ResponseAction;
    /**
     * Export Trust Fabric model
     */
    exportModel(): TrustFabricModel;
    /**
     * Import Trust Fabric model
     */
    importModel(model: TrustFabricModel): void;
    private saveModel;
}
//# sourceMappingURL=trust-fabric.d.ts.map