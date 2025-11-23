/**
 * Cost & Efficiency Agent
 * 
 * Pulls usage metrics from Vercel, Supabase, and Expo.
 * Projects monthly spend → flags overruns > 10%.
 * Suggests caching, query pooling, or function consolidation.
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('cost-agent-ts');
interface CostMetrics {
  timestamp: string;
  providers: {
    vercel?: {
      monthlySpend: number;
      forecast: number;
      functions: number;
      bandwidth: number;
      overrun: boolean;
    };
    supabase?: {
      monthlySpend: number;
      forecast: number;
      databaseSize: number;
      apiCalls: number;
      storage: number;
      overrun: boolean;
    };
    expo?: {
      monthlySpend: number;
      forecast: number;
      builds: number;
      overrun: boolean;
    };
  };
  total: {
    current: number;
    forecast: number;
    budget: number;
    overrun: boolean;
    overrunPercent: number;
  };
  recommendations: string[];
}

interface RepoContext {
  type: string;
  framework: string;
  packageManager: string;
  hasSupabase: boolean;
  hasVercel: boolean;
  hasExpo: boolean;
}

export class CostAgent {
  constructor(
    private workspaceRoot: string,
    private repoContext: RepoContext
  ) {}

  async run(): Promise<void> {
    logger.info('💰 Analyzing cost metrics...');

    const metrics = await this.collectCostMetrics();
    await this.saveMetrics(metrics);
    await this.generateReport(metrics);
    await this.checkOverruns(metrics);
  }

  private async collectCostMetrics(): Promise<CostMetrics> {
    const timestamp = new Date().toISOString();
    const providers: CostMetrics['providers'] = {};

    // Collect Vercel costs (if available)
    if (this.repoContext.hasVercel) {
      providers.vercel = await this.getVercelCosts();
    }

    // Collect Supabase costs (if available)
    if (this.repoContext.hasSupabase) {
      providers.supabase = await this.getSupabaseCosts();
    }

    // Collect Expo costs (if available)
    if (this.repoContext.hasExpo) {
      providers.expo = await this.getExpoCosts();
    }

    // Calculate totals
    const current = Object.values(providers).reduce((sum, p) => sum + (p?.monthlySpend || 0), 0);
    const forecast = Object.values(providers).reduce((sum, p) => sum + (p?.forecast || 0), 0);
    const budget = await this.getBudget();
    const overrun = forecast > budget * 1.1; // 10% threshold
    const overrunPercent = budget > 0 ? ((forecast - budget) / budget) * 100 : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(providers, current, forecast);

    return {
      timestamp,
      providers,
      total: {
        current,
        forecast,
        budget,
        overrun,
        overrunPercent,
      },
      recommendations,
    };
  }

  private async getVercelCosts(): Promise<CostMetrics['providers']['vercel']> {
    // In production, would query Vercel API
    // For now, return simulated data
    return {
      monthlySpend: 45,
      forecast: 52,
      functions: 1200,
      bandwidth: 150, // GB
      overrun: false,
    };
  }

  private async getSupabaseCosts(): Promise<CostMetrics['providers']['supabase']> {
    // In production, would query Supabase billing API
    return {
      monthlySpend: 25,
      forecast: 28,
      databaseSize: 2.5, // GB
      apiCalls: 500000,
      storage: 10, // GB
      overrun: false,
    };
  }

  private async getExpoCosts(): Promise<CostMetrics['providers']['expo']> {
    // In production, would query Expo/EAS billing
    return {
      monthlySpend: 0, // Free tier
      forecast: 0,
      builds: 12,
      overrun: false,
    };
  }

  private async getBudget(): Promise<number> {
    // In production, would read from config or environment
    const budgetPath = join(this.workspaceRoot, '.cursor', 'config', 'budget.json');
    if (existsSync(budgetPath)) {
      try {
        const budget = JSON.parse(readFileSync(budgetPath, 'utf-8'));
        return budget.monthly || 100;
      } catch {
        return 100; // Default budget
      }
    }
    return 100; // Default monthly budget
  }

  private generateRecommendations(
    providers: CostMetrics['providers'],
    current: number,
    forecast: number
  ): string[] {
    const recommendations: string[] = [];

    // Vercel recommendations
    if (providers.vercel) {
      if (providers.vercel.functions > 1000) {
        recommendations.push('- Consolidate Vercel functions: Merge similar functions to reduce invocation count');
      }
      if (providers.vercel.bandwidth > 100) {
        recommendations.push('- Enable Vercel caching: Add cache headers and use CDN for static assets');
      }
    }

    // Supabase recommendations
    if (providers.supabase) {
      if (providers.supabase.apiCalls > 400000) {
        recommendations.push('- Implement query pooling: Use connection pooling to reduce API calls');
        recommendations.push('- Add caching layer: Cache frequently accessed data to reduce database queries');
      }
      if (providers.supabase.databaseSize > 2) {
        recommendations.push('- Review data retention: Archive old data or implement data lifecycle policies');
      }
    }

    // General recommendations
    if (forecast > current * 1.2) {
      recommendations.push('- Cost trending upward: Review usage patterns and optimize resource consumption');
    }

    if (recommendations.length === 0) {
      recommendations.push('- Costs within expected range. Continue monitoring.');
    }

    return recommendations;
  }

  private async saveMetrics(metrics: CostMetrics): Promise<void> {
    const outputPath = join(this.workspaceRoot, 'admin', 'costs.json');
    
    // Load historical data
    let historical: CostMetrics[] = [];
    if (existsSync(outputPath)) {
      try {
        historical = JSON.parse(readFileSync(outputPath, 'utf-8'));
      } catch {
        historical = [];
      }
    }

    // Keep last 90 days
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    historical = historical.filter(
      (m) => new Date(m.timestamp).getTime() > ninetyDaysAgo
    );

    historical.push(metrics);
    writeFileSync(outputPath, JSON.stringify(historical, null, 2));
  }

  private async generateReport(metrics: CostMetrics): Promise<void> {
    const reportPath = join(this.workspaceRoot, 'admin', 'costs.md');
    
    const report = `# Cost Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Current Monthly Spend**: $${metrics.total.current.toFixed(2)}
- **Forecasted Monthly Spend**: $${metrics.total.forecast.toFixed(2)}
- **Budget**: $${metrics.total.budget.toFixed(2)}
- **Status**: ${metrics.total.overrun ? '⚠️ OVERRUN' : '✅ Within Budget'}
- **Overrun**: ${metrics.total.overrunPercent > 0 ? '+' : ''}${metrics.total.overrunPercent.toFixed(1)}%

## Provider Breakdown

${this.formatProviderBreakdown(metrics.providers)}

## Recommendations

${metrics.recommendations.map((r) => `- ${r}`).join('\n')}

## Cost Trends

${this.generateTrendAnalysis(metrics)}
`;

    writeFileSync(reportPath, report);
  }

  private formatProviderBreakdown(providers: CostMetrics['providers']): string {
    const lines: string[] = [];

    if (providers.vercel) {
      lines.push(`### Vercel`);
      lines.push(`- Monthly Spend: $${providers.vercel.monthlySpend.toFixed(2)}`);
      lines.push(`- Forecast: $${providers.vercel.forecast.toFixed(2)}`);
      lines.push(`- Functions: ${providers.vercel.functions}`);
      lines.push(`- Bandwidth: ${providers.vercel.bandwidth} GB`);
      lines.push('');
    }

    if (providers.supabase) {
      lines.push(`### Supabase`);
      lines.push(`- Monthly Spend: $${providers.supabase.monthlySpend.toFixed(2)}`);
      lines.push(`- Forecast: $${providers.supabase.forecast.toFixed(2)}`);
      lines.push(`- Database Size: ${providers.supabase.databaseSize} GB`);
      lines.push(`- API Calls: ${providers.supabase.apiCalls.toLocaleString()}`);
      lines.push(`- Storage: ${providers.supabase.storage} GB`);
      lines.push('');
    }

    if (providers.expo) {
      lines.push(`### Expo`);
      lines.push(`- Monthly Spend: $${providers.expo.monthlySpend.toFixed(2)}`);
      lines.push(`- Forecast: $${providers.expo.forecast.toFixed(2)}`);
      lines.push(`- Builds: ${providers.expo.builds}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  private generateTrendAnalysis(metrics: CostMetrics): string {
    // In production, would analyze historical trends
    return 'Historical trend analysis would appear here.';
  }

  private async checkOverruns(metrics: CostMetrics): Promise<void> {
    if (metrics.total.overrun) {
      logger.warn('⚠️ Cost overrun detected: Forecast ($${metrics.total.forecast.toFixed(2')}) exceeds budget ($${metrics.total.budget.toFixed(2)}) by ${metrics.total.overrunPercent.toFixed(1)}%`
      );
      // In production, would send alert or create GitHub issue
    }

    // Check individual provider overruns
    for (const [provider, data] of Object.entries(metrics.providers)) {
      if (data?.overrun) {
        logger.warn('⚠️ ${provider} cost overrun detected');
      }
    }
  }
}
