/**
 * AI Auto-Scaling & Cost Awareness System
 * Reads usage metrics and predicts cost trajectory
 * Creates GitHub Discussions on budget deviations
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

interface UsageMetrics {
  timestamp: string;
  environment: 'staging' | 'production' | 'preview';
  metrics: {
    requests: number;
    compute_time: number; // in seconds
    memory_usage: number; // in MB
    storage_usage: number; // in GB
    bandwidth: number; // in GB
  };
  costs: {
    compute: number;
    storage: number;
    bandwidth: number;
    database: number;
    total: number;
  };
}

interface CostPrediction {
  current_month: number;
  predicted_month: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  recommendations: string[];
}

interface ScalingRecommendation {
  type: 'scale_up' | 'scale_down' | 'optimize' | 'no_action';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimated_savings?: number;
  implementation_effort: 'low' | 'medium' | 'high';
}

class AIAutoScale {
  private supabase: any;
  private octokit: Octokit;
  private projectRef: string;
  private budgetThreshold: number;

  constructor() {
    this.projectRef = process.env.SUPABASE_PROJECT_REF || 'ghqyxhbyyirveptgwoqm';
    this.budgetThreshold = parseFloat(process.env.BUDGET_THRESHOLD_PERCENT || '20');
    
    this.supabase = createClient(
      process.env.SUPABASE_URL || `https://${this.projectRef}.supabase.co`,
      process.env.SUPABASE_ANON_KEY || ''
    );
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Analyze usage and generate scaling recommendations
   */
  async analyzeUsage(): Promise<{
    metrics: UsageMetrics[];
    prediction: CostPrediction;
    recommendations: ScalingRecommendation[];
  }> {
    console.log('💰 Analyzing usage metrics and costs...');

    try {
      // Collect usage metrics
      const metrics = await this.collectUsageMetrics();
      
      // Predict cost trajectory
      const prediction = await this.predictCosts(metrics);
      
      // Generate scaling recommendations
      const recommendations = await this.generateScalingRecommendations(metrics, prediction);
      
      // Store analysis
      await this.storeAnalysis(metrics, prediction, recommendations);
      
      // Check for budget alerts
      if (this.shouldCreateBudgetAlert(prediction)) {
        await this.createBudgetAlert(prediction, recommendations);
      }

      return { metrics, prediction, recommendations };
    } catch (error) {
      console.error('Usage analysis failed:', error);
      throw error;
    }
  }

  /**
   * Collect usage metrics from various sources
   */
  private async collectUsageMetrics(): Promise<UsageMetrics[]> {
    const metrics: UsageMetrics[] = [];
    const now = new Date();
    
    // Simulate metric collection - in real implementation:
    // - Query Vercel Analytics API
    // - Check Supabase usage metrics
    // - Monitor AWS/Cloud provider costs
    // - Check database usage

    // Generate mock data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isProduction = Math.random() > 0.3; // 70% production traffic
      
      const baseRequests = isProduction ? 10000 : 2000;
      const weekendMultiplier = isWeekend ? 0.6 : 1.0;
      const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
      
      const requests = Math.floor(baseRequests * weekendMultiplier * randomVariation);
      const computeTime = requests * (0.1 + Math.random() * 0.2); // 100-300ms per request
      const memoryUsage = 512 + Math.random() * 1024; // 512MB - 1.5GB
      const storageUsage = 10 + Math.random() * 20; // 10-30GB
      const bandwidth = requests * (0.001 + Math.random() * 0.002); // 1-3KB per request

      // Calculate costs (simplified pricing)
      const computeCost = (computeTime / 1000) * 0.0000166667; // $0.0000166667 per GB-second
      const storageCost = storageUsage * 0.023; // $0.023 per GB-month
      const bandwidthCost = bandwidth * 0.09; // $0.09 per GB
      const databaseCost = requests * 0.0001; // $0.0001 per request
      const totalCost = computeCost + storageCost + bandwidthCost + databaseCost;

      metrics.push({
        timestamp: date.toISOString(),
        environment: isProduction ? 'production' : 'staging',
        metrics: {
          requests,
          compute_time: computeTime,
          memory_usage: memoryUsage,
          storage_usage: storageUsage,
          bandwidth
        },
        costs: {
          compute: computeCost,
          storage: storageCost,
          bandwidth: bandwidthCost,
          database: databaseCost,
          total: totalCost
        }
      });
    }

    return metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Predict cost trajectory using linear regression
   */
  private async predictCosts(metrics: UsageMetrics[]): Promise<CostPrediction> {
    if (metrics.length < 7) {
      return {
        current_month: 0,
        predicted_month: 0,
        trend: 'stable',
        confidence: 0,
        recommendations: ['Insufficient data for prediction']
      };
    }

    // Calculate current month costs
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthCosts = metrics
      .filter(m => {
        const date = new Date(m.timestamp);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, m) => sum + m.costs.total, 0);

    // Simple linear regression for trend analysis
    const costs = metrics.map(m => m.costs.total);
    const days = metrics.map((_, i) => i);
    
    const n = costs.length;
    const sumX = days.reduce((a, b) => a + b, 0);
    const sumY = costs.reduce((a, b) => a + b, 0);
    const sumXY = days.reduce((sum, day, i) => sum + day * costs[i], 0);
    const sumXX = days.reduce((sum, day) => sum + day * day, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 30 days
    const predictedCosts = [];
    for (let i = 0; i < 30; i++) {
      const day = n + i;
      predictedCosts.push(slope * day + intercept);
    }
    
    const predictedMonth = predictedCosts.reduce((sum, cost) => sum + Math.max(0, cost), 0);
    const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
    const confidence = Math.min(1, Math.max(0, 1 - Math.abs(slope) * 10));

    return {
      current_month: currentMonthCosts,
      predicted_month: predictedMonth,
      trend,
      confidence,
      recommendations: this.generateCostRecommendations(trend, currentMonthCosts, predictedMonth)
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  private generateCostRecommendations(trend: string, current: number, predicted: number): string[] {
    const recommendations: string[] = [];
    const increasePercent = ((predicted - current) / current) * 100;

    if (trend === 'increasing' && increasePercent > 20) {
      recommendations.push('Consider implementing auto-scaling to reduce costs during low usage');
      recommendations.push('Review and optimize database queries to reduce compute costs');
      recommendations.push('Implement caching strategies to reduce API calls');
    }

    if (current > 100) { // High cost threshold
      recommendations.push('Consider migrating to more cost-effective infrastructure');
      recommendations.push('Implement cost monitoring and alerting');
    }

    if (trend === 'stable' && current < 50) {
      recommendations.push('Costs are stable and reasonable - maintain current setup');
    }

    return recommendations;
  }

  /**
   * Generate scaling recommendations
   */
  private async generateScalingRecommendations(
    metrics: UsageMetrics[],
    prediction: CostPrediction
  ): Promise<ScalingRecommendation[]> {
    const recommendations: ScalingRecommendation[] = [];
    
    // Analyze recent metrics for patterns
    const recentMetrics = metrics.slice(-7); // Last 7 days
    const avgRequests = recentMetrics.reduce((sum, m) => sum + m.metrics.requests, 0) / recentMetrics.length;
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.metrics.memory_usage, 0) / recentMetrics.length;
    const avgCost = recentMetrics.reduce((sum, m) => sum + m.costs.total, 0) / recentMetrics.length;

    // Memory-based scaling
    if (avgMemory > 1000) { // > 1GB
      recommendations.push({
        type: 'scale_up',
        priority: 'medium',
        description: 'High memory usage detected - consider increasing memory allocation',
        estimated_savings: avgCost * 0.1,
        implementation_effort: 'low'
      });
    } else if (avgMemory < 200) { // < 200MB
      recommendations.push({
        type: 'scale_down',
        priority: 'low',
        description: 'Low memory usage - consider reducing memory allocation',
        estimated_savings: avgCost * 0.2,
        implementation_effort: 'low'
      });
    }

    // Request-based scaling
    if (avgRequests > 50000) { // High traffic
      recommendations.push({
        type: 'scale_up',
        priority: 'high',
        description: 'High request volume - consider horizontal scaling',
        estimated_savings: avgCost * 0.15,
        implementation_effort: 'medium'
      });
    }

    // Cost-based optimization
    if (prediction.trend === 'increasing' && prediction.confidence > 0.7) {
      recommendations.push({
        type: 'optimize',
        priority: 'high',
        description: 'Cost trend increasing - implement optimization strategies',
        estimated_savings: prediction.predicted_month * 0.2,
        implementation_effort: 'high'
      });
    }

    // Storage optimization
    const avgStorage = recentMetrics.reduce((sum, m) => sum + m.metrics.storage_usage, 0) / recentMetrics.length;
    if (avgStorage > 50) { // > 50GB
      recommendations.push({
        type: 'optimize',
        priority: 'medium',
        description: 'High storage usage - consider data archiving or compression',
        estimated_savings: avgCost * 0.1,
        implementation_effort: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Check if budget alert should be created
   */
  private shouldCreateBudgetAlert(prediction: CostPrediction): boolean {
    const increasePercent = ((prediction.predicted_month - prediction.current_month) / prediction.current_month) * 100;
    return increasePercent > this.budgetThreshold && prediction.confidence > 0.6;
  }

  /**
   * Create GitHub Discussion for budget alert
   */
  private async createBudgetAlert(prediction: CostPrediction, recommendations: ScalingRecommendation[]) {
    const discussion = {
      title: `🚨 Cost Alert: ${((prediction.predicted_month - prediction.current_month) / prediction.current_month * 100).toFixed(1)}% increase predicted`,
      body: this.generateBudgetAlertBody(prediction, recommendations),
      category: 'general'
    };

    try {
      const { data } = await this.octokit.rest.discussions.create({
        owner: process.env.GITHUB_OWNER || 'your-org',
        repo: process.env.GITHUB_REPO || 'whats-for-dinner-monorepo',
        title: discussion.title,
        body: discussion.body,
        category: discussion.category
      });

      console.log(`✅ Budget alert discussion created: ${data.html_url}`);
    } catch (error) {
      console.error('Failed to create budget alert:', error);
    }
  }

  /**
   * Generate budget alert discussion body
   */
  private generateBudgetAlertBody(prediction: CostPrediction, recommendations: ScalingRecommendation[]): string {
    const increasePercent = ((prediction.predicted_month - prediction.current_month) / prediction.current_month * 100).toFixed(1);
    
    return `
## 💰 Cost Alert - Budget Deviation Detected

**Current Month Cost:** $${prediction.current_month.toFixed(2)}  
**Predicted Month Cost:** $${prediction.predicted_month.toFixed(2)}  
**Increase:** ${increasePercent}%  
**Confidence:** ${(prediction.confidence * 100).toFixed(1)}%  
**Trend:** ${prediction.trend}

### 📊 Cost Breakdown
- **Current Month:** $${prediction.current_month.toFixed(2)}
- **Predicted Month:** $${prediction.predicted_month.toFixed(2)}
- **Monthly Increase:** $${(prediction.predicted_month - prediction.current_month).toFixed(2)}

### 🎯 AI Recommendations

${recommendations.map(rec => `
#### ${rec.type.replace('_', ' ').toUpperCase()} - ${rec.priority.toUpperCase()} Priority
- **Description:** ${rec.description}
- **Estimated Savings:** ${rec.estimated_savings ? `$${rec.estimated_savings.toFixed(2)}/month` : 'TBD'}
- **Implementation Effort:** ${rec.implementation_effort}
`).join('\n')}

### 📈 Cost Optimization Strategies
${prediction.recommendations.map(rec => `- ${rec}`).join('\n')}

### 🔍 Next Steps
1. Review current resource allocation
2. Implement recommended optimizations
3. Set up automated cost monitoring
4. Consider budget alerts for future deviations

---
*This alert was automatically generated by the AI Auto-Scaling system.*
    `.trim();
  }

  /**
   * Store analysis results
   */
  private async storeAnalysis(
    metrics: UsageMetrics[],
    prediction: CostPrediction,
    recommendations: ScalingRecommendation[]
  ) {
    try {
      const analysis = {
        timestamp: new Date().toISOString(),
        metrics_summary: {
          total_requests: metrics.reduce((sum, m) => sum + m.metrics.requests, 0),
          avg_daily_cost: metrics.reduce((sum, m) => sum + m.costs.total, 0) / metrics.length,
          peak_memory: Math.max(...metrics.map(m => m.metrics.memory_usage)),
          total_storage: Math.max(...metrics.map(m => m.metrics.storage_usage))
        },
        prediction,
        recommendations,
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('ai_cost_analysis')
        .insert([analysis]);

      if (error) {
        console.error('Error storing cost analysis:', error);
      } else {
        console.log('✅ Cost analysis stored successfully');
      }
    } catch (error) {
      console.error('Failed to store cost analysis:', error);
    }
  }

  /**
   * Run daily cost analysis
   */
  async runDailyAnalysis() {
    console.log('💰 Running daily cost analysis...');
    
    try {
      const analysis = await this.analyzeUsage();
      
      // Generate daily report
      const report = this.generateDailyReport(analysis);
      console.log(report);
      
      console.log('✅ Daily cost analysis completed');
    } catch (error) {
      console.error('Daily cost analysis failed:', error);
    }
  }

  /**
   * Generate daily cost report
   */
  private generateDailyReport(analysis: any): string {
    const { metrics, prediction, recommendations } = analysis;
    const today = metrics[metrics.length - 1];
    
    return `
💰 Daily Cost Analysis Report
============================

📊 Today's Metrics:
- Requests: ${today.metrics.requests.toLocaleString()}
- Compute Time: ${today.metrics.compute_time.toFixed(2)}s
- Memory Usage: ${today.metrics.memory_usage.toFixed(2)}MB
- Storage: ${today.metrics.storage_usage.toFixed(2)}GB
- Total Cost: $${today.costs.total.toFixed(2)}

📈 Cost Prediction:
- Current Month: $${prediction.current_month.toFixed(2)}
- Predicted Month: $${prediction.predicted_month.toFixed(2)}
- Trend: ${prediction.trend}
- Confidence: ${(prediction.confidence * 100).toFixed(1)}%

🎯 Recommendations:
${recommendations.map(rec => `- ${rec.description} (${rec.priority} priority)`).join('\n')}
    `.trim();
  }
}

export default AIAutoScale;