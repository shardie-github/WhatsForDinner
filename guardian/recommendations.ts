/**
 * Trust Fabric AI Layer
 * Learns user comfort zones and adapts risk weights
 */

import type { TrustFabricModel, GuardianRecommendation, DataClass, RiskLevel } from './types';
import fs from 'fs';
import path from 'path';

export class TrustFabricAI {
  private modelsPath: string;

  constructor(modelsBasePath: string = '/tmp/guardian/models') {
    this.modelsPath = modelsBasePath;
    this.ensureModelsDirectory();
  }

  /**
   * Load or create Trust Fabric model for user
   */
  async loadOrCreateModel(userId: string): Promise<TrustFabricModel> {
    const modelFile = path.join(this.modelsPath, `${userId}_fabric.json`);
    
    if (fs.existsSync(modelFile)) {
      return JSON.parse(fs.readFileSync(modelFile, 'utf8')) as TrustFabricModel;
    }

    // Create default model
    const defaultModel: TrustFabricModel = {
      user_id: userId,
      comfort_zones: {
        privacy_mode_toggles: 0,
        signals_disabled: [],
        average_trust_responses: {} as Record<DataClass, RiskLevel>,
      },
      adaptive_risk_weights: {
        telemetry: { impact: 2, likelihood: 0.3 },
        location: { impact: 7, likelihood: 0.6 },
        audio: { impact: 9, likelihood: 0.8 },
        biometrics: { impact: 10, likelihood: 0.9 },
        content: { impact: 5, likelihood: 0.5 },
        credentials: { impact: 10, likelihood: 0.95 },
        metadata: { impact: 2, likelihood: 0.3 },
      },
      learned_preferences: {},
      version: '1.0.0',
      last_updated: new Date().toISOString(),
    };

    await this.saveModel(userId, defaultModel);
    return defaultModel;
  }

  /**
   * Learn from user behavior
   */
  async learnFromBehavior(
    userId: string,
    event: {
      data_class: DataClass;
      risk_level: RiskLevel;
      action_taken: string;
      user_decision?: string;
    }
  ): Promise<void> {
    const model = await this.loadOrCreateModel(userId);

    // Update privacy mode toggle frequency
    if (event.action_taken === 'block' || event.user_decision === 'deny') {
      model.comfort_zones.privacy_mode_toggles += 1;
    }

    // Learn average trust responses
    const currentAvg = model.comfort_zones.average_trust_responses[event.data_class];
    if (!currentAvg || this.isHigherRisk(event.risk_level, currentAvg)) {
      model.comfort_zones.average_trust_responses[event.data_class] = event.risk_level;
    }

    // Update adaptive risk weights based on user behavior
    if (event.action_taken === 'block') {
      // User blocked this - increase likelihood weight
      model.adaptive_risk_weights[event.data_class].likelihood = Math.min(
        1.0,
        model.adaptive_risk_weights[event.data_class].likelihood + 0.1
      );
    } else if (event.action_taken === 'allow' && event.risk_level === 'high') {
      // User allowed high-risk - decrease impact weight
      model.adaptive_risk_weights[event.data_class].impact = Math.max(
        1,
        model.adaptive_risk_weights[event.data_class].impact - 0.5
      );
    }

    model.last_updated = new Date().toISOString();
    await this.saveModel(userId, model);
  }

  /**
   * Generate recommendations based on learned behavior
   */
  async generateRecommendations(userId: string): Promise<GuardianRecommendation[]> {
    const model = await this.loadOrCreateModel(userId);
    const recommendations: GuardianRecommendation[] = [];

    // Analyze privacy mode toggle frequency
    if (model.comfort_zones.privacy_mode_toggles > 10) {
      recommendations.push({
        id: `recommend-${Date.now()}-1`,
        type: 'tighter',
        data_class: 'telemetry',
        reason: 'Frequent privacy mode toggles suggest desire for tighter controls',
        impact: 'Reduces telemetry collection',
        suggested_action: 'mask',
        confidence: 0.7,
      });
    }

    // Analyze disabled signals
    if (model.comfort_zones.signals_disabled.length > 3) {
      recommendations.push({
        id: `recommend-${Date.now()}-2`,
        type: 'policy_update',
        data_class: 'telemetry',
        reason: 'Multiple signals disabled - consider updating default policy',
        impact: 'More restrictive defaults',
        suggested_action: 'mask',
        confidence: 0.8,
      });
    }

    // Analyze risk weight adjustments
    Object.entries(model.adaptive_risk_weights).forEach(([dataClass, weights]) => {
      if (weights.likelihood > 0.8) {
        recommendations.push({
          id: `recommend-${Date.now()}-${dataClass}`,
          type: 'tighter',
          data_class: dataClass as DataClass,
          reason: `High likelihood score suggests tighter controls needed`,
          impact: 'More aggressive blocking',
          suggested_action: 'block',
          confidence: weights.likelihood,
        });
      }
    });

    return recommendations;
  }

  /**
   * Export Trust Fabric model for portability
   */
  async exportModel(userId: string): Promise<TrustFabricModel> {
    return this.loadOrCreateModel(userId);
  }

  /**
   * Import Trust Fabric model
   */
  async importModel(model: TrustFabricModel): Promise<void> {
    await this.saveModel(model.user_id, model);
  }

  /**
   * Save model to disk
   */
  private async saveModel(userId: string, model: TrustFabricModel): Promise<void> {
    const modelFile = path.join(this.modelsPath, `${userId}_fabric.json`);
    fs.writeFileSync(modelFile, JSON.stringify(model, null, 2));
  }

  /**
   * Compare risk levels
   */
  private isHigherRisk(a: RiskLevel, b: RiskLevel): boolean {
    const order: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
    return order.indexOf(a) > order.indexOf(b);
  }

  /**
   * Ensure models directory exists
   */
  private ensureModelsDirectory(): void {
    if (!fs.existsSync(this.modelsPath)) {
      fs.mkdirSync(this.modelsPath, { recursive: true });
    }
  }
}

export const trustFabricAI = new TrustFabricAI();
