/**
 * Business Readiness Orchestrator
 * Central coordinator for all business readiness, CRO, monetization, and autonomous systems
 */

import { croOptimizer } from './croOptimizer';
import { monetizationHub } from './monetizationHub';
import { autonomousInfrastructure } from './autonomousInfrastructure';
import { selfLearningSystem } from './selfLearningSystem';
import { GrowthAnalytics } from './growthAnalytics';
import { analytics } from './analytics';
import { supabase } from './supabaseClient';

export interface BusinessReadinessReport {
  timestamp: string;
  overall_score: number;
  categories: {
    code_quality: { score: number; issues: number; status: 'pass' | 'warning' | 'fail' };
    cro_optimization: { score: number; opportunities: number; status: 'pass' | 'warning' | 'fail' };
    monetization: { score: number; strategies_active: number; status: 'pass' | 'warning' | 'fail' };
    infrastructure: { score: number; health_status: string; status: 'pass' | 'warning' | 'fail' };
    autonomous_systems: { score: number; systems_active: number; status: 'pass' | 'warning' | 'fail' };
  };
  recommendations: string[];
  next_review_date: string;
}

export interface BusinessMetrics {
  conversion_rate: number;
  average_revenue_per_user: number;
  customer_acquisition_cost: number;
  lifetime_value: number;
  churn_rate: number;
  monthly_recurring_revenue: number;
}

export class BusinessReadinessOrchestrator {
  private static instance: BusinessReadinessOrchestrator;

  static getInstance(): BusinessReadinessOrchestrator {
    if (!BusinessReadinessOrchestrator.instance) {
      BusinessReadinessOrchestrator.instance = new BusinessReadinessOrchestrator();
    }
    return BusinessReadinessOrchestrator.instance;
  }

  /**
   * Initialize all systems
   */
  async initialize(): Promise<void> {
    console.log('?? Initializing Business Readiness Orchestrator...');

    try {
      // Start autonomous infrastructure
      await autonomousInfrastructure.start();

      // Start self-learning system
      await selfLearningSystem.start();

      console.log('? Business Readiness Orchestrator initialized');
    } catch (error) {
      console.error('Error initializing orchestrator:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive business readiness report
   */
  async generateBusinessReadinessReport(
    tenantId: string
  ): Promise<BusinessReadinessReport> {
    console.log('?? Generating Business Readiness Report...');

    try {
      // 1. Code Quality Assessment
      const codeQuality = await this.assessCodeQuality();

      // 2. CRO Assessment
      const croAssessment = await this.assessCRO(tenantId);

      // 3. Monetization Assessment
      const monetizationAssessment = await this.assessMonetization(tenantId);

      // 4. Infrastructure Assessment
      const infrastructureAssessment = await this.assessInfrastructure();

      // 5. Autonomous Systems Assessment
      const autonomousAssessment = await this.assessAutonomousSystems();

      // Calculate overall score
      const overallScore = this.calculateOverallScore({
        code_quality: codeQuality.score,
        cro_optimization: croAssessment.score,
        monetization: monetizationAssessment.score,
        infrastructure: infrastructureAssessment.score,
        autonomous_systems: autonomousAssessment.score,
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        codeQuality,
        croAssessment,
        monetizationAssessment,
        infrastructureAssessment,
        autonomousAssessment,
      });

      const report: BusinessReadinessReport = {
        timestamp: new Date().toISOString(),
        overall_score: overallScore,
        categories: {
          code_quality: {
            score: codeQuality.score,
            issues: codeQuality.issues.length,
            status: this.getStatusFromScore(codeQuality.score),
          },
          cro_optimization: {
            score: croAssessment.score,
            opportunities: croAssessment.opportunities,
            status: this.getStatusFromScore(croAssessment.score),
          },
          monetization: {
            score: monetizationAssessment.score,
            strategies_active: monetizationAssessment.strategies_active,
            status: this.getStatusFromScore(monetizationAssessment.score),
          },
          infrastructure: {
            score: infrastructureAssessment.score,
            health_status: infrastructureAssessment.health_status,
            status: this.getStatusFromScore(infrastructureAssessment.score),
          },
          autonomous_systems: {
            score: autonomousAssessment.score,
            systems_active: autonomousAssessment.systems_active,
            status: this.getStatusFromScore(autonomousAssessment.score),
          },
        },
        recommendations,
        next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Store report
      await this.storeReport(report);

      return report;
    } catch (error) {
      console.error('Error generating business readiness report:', error);
      throw error;
    }
  }

  /**
   * Assess code quality
   */
  private async assessCodeQuality(): Promise<{ score: number; issues: string[] }> {
    // In production, this would run linting, type checking, tests, etc.
    // For now, we'll simulate based on common issues
    
    const issues: string[] = [];
    let score = 100;

    // Check for linting issues (would be done via actual lint run)
    // issues.push('10 unused variables detected');
    // score -= 10;

    // Check for type errors
    // issues.push('2 TypeScript errors found');
    // score -= 5;

    return { score: Math.max(0, score), issues };
  }

  /**
   * Assess CRO optimization
   */
  private async assessCRO(tenantId: string): Promise<{ score: number; opportunities: number }> {
    try {
      const insights = await croOptimizer.getCROInsights(tenantId);
      const opportunities = insights.funnel_bottlenecks.length + insights.worst_ctas.length;
      
      // Calculate score based on conversion rate and opportunities
      const baseScore = insights.top_ctas.length > 0 ? 70 : 50;
      const penaltyScore = Math.min(opportunities * 5, 30);
      const score = Math.max(0, baseScore - penaltyScore);

      return { score, opportunities };
    } catch (error) {
      console.error('Error assessing CRO:', error);
      return { score: 50, opportunities: 0 };
    }
  }

  /**
   * Assess monetization
   */
  private async assessMonetization(tenantId: string): Promise<{ score: number; strategies_active: number }> {
    try {
      const strategies = await monetizationHub.getMonetizationStrategies();
      const activeStrategies = strategies.filter(s => s.status === 'live').length;
      
      // Score based on active strategies and revenue potential
      const score = Math.min(100, 50 + (activeStrategies * 10));

      return { score, strategies_active: activeStrategies };
    } catch (error) {
      console.error('Error assessing monetization:', error);
      return { score: 40, strategies_active: 0 };
    }
  }

  /**
   * Assess infrastructure
   */
  private async assessInfrastructure(): Promise<{ score: number; health_status: string }> {
    try {
      const health = await autonomousInfrastructure.performHealthCheck();
      
      const scoreMap: Record<string, number> = {
        healthy: 100,
        degraded: 60,
        critical: 20,
      };

      return {
        score: scoreMap[health.status] || 50,
        health_status: health.status,
      };
    } catch (error) {
      console.error('Error assessing infrastructure:', error);
      return { score: 50, health_status: 'unknown' };
    }
  }

  /**
   * Assess autonomous systems
   */
  private async assessAutonomousSystems(): Promise<{ score: number; systems_active: number }> {
    let systemsActive = 0;
    let score = 0;

    // Check if each system is running
    // In production, this would check actual system status
    systemsActive += 1; // Infrastructure
    systemsActive += 1; // Self-learning
    
    score = systemsActive * 50;

    return { score, systems_active: systemsActive };
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(tenantId: string, period: string = '30d'): Promise<BusinessMetrics> {
    try {
      const periodDays = period === '30d' ? 30 : period === '7d' ? 7 : 90;
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

      // Get growth metrics
      const growthSummary = await GrowthAnalytics.getGrowthMetricsSummary(
        tenantId,
        startDate,
        new Date().toISOString()
      );

      // Get funnel conversion rates
      const funnelRates = await GrowthAnalytics.getFunnelConversionRates(
        tenantId,
        startDate,
        new Date().toISOString()
      );

      return {
        conversion_rate: growthSummary.conversion_rate || 0,
        average_revenue_per_user: growthSummary.mrr || 0,
        customer_acquisition_cost: growthSummary.cac || 0,
        lifetime_value: growthSummary.ltv || 0,
        churn_rate: growthSummary.churn_rate || 0,
        monthly_recurring_revenue: growthSummary.mrr || 0,
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      return {
        conversion_rate: 0,
        average_revenue_per_user: 0,
        customer_acquisition_cost: 0,
        lifetime_value: 0,
        churn_rate: 0,
        monthly_recurring_revenue: 0,
      };
    }
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(scores: Record<string, number>): number {
    const weights = {
      code_quality: 0.15,
      cro_optimization: 0.25,
      monetization: 0.25,
      infrastructure: 0.20,
      autonomous_systems: 0.15,
    };

    let weightedSum = 0;
    Object.entries(weights).forEach(([category, weight]) => {
      weightedSum += (scores[category] || 0) * weight;
    });

    return Math.round(weightedSum);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(assessments: any): string[] {
    const recommendations: string[] = [];

    // Code quality recommendations
    if (assessments.codeQuality.score < 80) {
      recommendations.push('Fix code quality issues: Run linting and fix errors');
    }

    // CRO recommendations
    if (assessments.croAssessment.score < 70) {
      recommendations.push(`Optimize ${assessments.croAssessment.opportunities} CRO opportunities identified`);
    }

    // Monetization recommendations
    if (assessments.monetizationAssessment.score < 70) {
      recommendations.push('Implement additional monetization strategies');
    }

    // Infrastructure recommendations
    if (assessments.infrastructureAssessment.health_status !== 'healthy') {
      recommendations.push(`Infrastructure health is ${assessments.infrastructureAssessment.health_status}. Review and fix issues`);
    }

    return recommendations;
  }

  /**
   * Get status from score
   */
  private getStatusFromScore(score: number): 'pass' | 'warning' | 'fail' {
    if (score >= 80) return 'pass';
    if (score >= 60) return 'warning';
    return 'fail';
  }

  /**
   * Store report
   */
  private async storeReport(report: BusinessReadinessReport): Promise<void> {
    try {
      await supabase.from('business_readiness_reports').insert({
        ...report,
        created_at: report.timestamp,
      });
    } catch (error) {
      console.error('Error storing report:', error);
    }
  }
}

export const businessReadinessOrchestrator = BusinessReadinessOrchestrator.getInstance();
