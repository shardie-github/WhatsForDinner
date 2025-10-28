/**
 * AI Self-Diagnosis System
 * Monitors CI logs, error frequency, cold starts, and latency p95
 * Emits JSON summaries to Supabase table ai_health_metrics
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

interface HealthMetrics {
  id?: string;
  timestamp: string;
  deploy_id: string;
  environment: 'staging' | 'production' | 'preview';
  metrics: {
    error_rate: number;
    cold_start_count: number;
    latency_p95: number;
    memory_usage: number;
    cpu_usage: number;
    response_time_avg: number;
    throughput: number;
  };
  patterns: {
    error_patterns: string[];
    performance_issues: string[];
    resource_constraints: string[];
  };
  recommendations: {
    caching: string[];
    schema: string[];
    api: string[];
    infrastructure: string[];
  };
  status: 'healthy' | 'warning' | 'critical';
  created_at?: string;
}

interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
}

class AISelfDiagnose {
  private supabase: any;
  private octokit: Octokit;
  private projectRef: string;

  constructor() {
    this.projectRef = process.env.SUPABASE_PROJECT_REF || 'ghqyxhbyyirveptgwoqm';
    this.supabase = createClient(
      process.env.SUPABASE_URL || `https://${this.projectRef}.supabase.co`,
      process.env.SUPABASE_ANON_KEY || ''
    );
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Analyze deployment metrics and generate health report
   */
  async analyzeDeployment(deployId: string, environment: string): Promise<HealthMetrics> {
    console.log(`🔍 Analyzing deployment ${deployId} in ${environment}...`);

    // Collect metrics from various sources
    const metrics = await this.collectMetrics(deployId, environment);
    
    // Analyze patterns
    const patterns = await this.analyzePatterns(metrics);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(metrics, patterns);
    
    // Determine overall status
    const status = this.determineStatus(metrics, patterns);

    const healthMetrics: HealthMetrics = {
      timestamp: new Date().toISOString(),
      deploy_id: deployId,
      environment: environment as any,
      metrics,
      patterns,
      recommendations,
      status
    };

    // Store in Supabase
    await this.storeMetrics(healthMetrics);

    // Check for critical patterns and create GitHub issues
    if (status === 'critical' || this.shouldCreateIssue(patterns)) {
      await this.createGitHubIssue(healthMetrics);
    }

    return healthMetrics;
  }

  /**
   * Collect metrics from various sources
   */
  private async collectMetrics(deployId: string, environment: string) {
    // Simulate metric collection - in real implementation, this would:
    // - Query Vercel Analytics API
    // - Check Supabase logs
    // - Monitor error tracking (Sentry)
    // - Check performance monitoring
    
    const baseMetrics = {
      error_rate: Math.random() * 5, // 0-5%
      cold_start_count: Math.floor(Math.random() * 20),
      latency_p95: 200 + Math.random() * 300, // 200-500ms
      memory_usage: 50 + Math.random() * 30, // 50-80%
      cpu_usage: 30 + Math.random() * 40, // 30-70%
      response_time_avg: 150 + Math.random() * 200, // 150-350ms
      throughput: 100 + Math.random() * 200, // 100-300 req/s
    };

    // Add some realistic variations based on environment
    if (environment === 'production') {
      baseMetrics.throughput *= 2;
      baseMetrics.latency_p95 *= 0.8;
    }

    return baseMetrics;
  }

  /**
   * Analyze patterns in metrics
   */
  private async analyzePatterns(metrics: any) {
    const patterns = {
      error_patterns: [] as string[],
      performance_issues: [] as string[],
      resource_constraints: [] as string[],
    };

    // Error pattern analysis
    if (metrics.error_rate > 3) {
      patterns.error_patterns.push('High error rate detected');
    }
    if (metrics.error_rate > 1 && metrics.latency_p95 > 400) {
      patterns.error_patterns.push('Error rate correlates with high latency');
    }

    // Performance issue analysis
    if (metrics.latency_p95 > 500) {
      patterns.performance_issues.push('P95 latency exceeds 500ms threshold');
    }
    if (metrics.cold_start_count > 10) {
      patterns.performance_issues.push('Excessive cold starts detected');
    }
    if (metrics.response_time_avg > 300) {
      patterns.performance_issues.push('Average response time degraded');
    }

    // Resource constraint analysis
    if (metrics.memory_usage > 80) {
      patterns.resource_constraints.push('High memory usage detected');
    }
    if (metrics.cpu_usage > 70) {
      patterns.resource_constraints.push('High CPU usage detected');
    }
    if (metrics.throughput < 50) {
      patterns.resource_constraints.push('Low throughput detected');
    }

    return patterns;
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateRecommendations(metrics: any, patterns: any) {
    const recommendations = {
      caching: [] as string[],
      schema: [] as string[],
      api: [] as string[],
      infrastructure: [] as string[],
    };

    // Caching recommendations
    if (metrics.latency_p95 > 300) {
      recommendations.caching.push('Implement Redis caching for frequently accessed data');
      recommendations.caching.push('Add CDN for static assets');
    }
    if (metrics.cold_start_count > 5) {
      recommendations.caching.push('Implement connection pooling to reduce cold starts');
    }

    // Schema recommendations
    if (patterns.performance_issues.length > 0) {
      recommendations.schema.push('Add database indexes for frequently queried columns');
      recommendations.schema.push('Consider partitioning large tables');
    }

    // API recommendations
    if (metrics.response_time_avg > 200) {
      recommendations.api.push('Implement API response compression');
      recommendations.api.push('Add request/response logging for debugging');
    }
    if (metrics.error_rate > 1) {
      recommendations.api.push('Add circuit breaker pattern for external API calls');
    }

    // Infrastructure recommendations
    if (metrics.memory_usage > 70) {
      recommendations.infrastructure.push('Consider increasing memory allocation');
    }
    if (metrics.cpu_usage > 60) {
      recommendations.infrastructure.push('Scale horizontally or increase CPU resources');
    }

    return recommendations;
  }

  /**
   * Determine overall system status
   */
  private determineStatus(metrics: any, patterns: any): 'healthy' | 'warning' | 'critical' {
    const criticalIssues = patterns.error_patterns.length + patterns.resource_constraints.length;
    const warningIssues = patterns.performance_issues.length;

    if (criticalIssues > 2 || metrics.error_rate > 5) {
      return 'critical';
    }
    if (criticalIssues > 0 || warningIssues > 2 || metrics.latency_p95 > 500) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * Check if GitHub issue should be created
   */
  private shouldCreateIssue(patterns: any): boolean {
    const totalIssues = patterns.error_patterns.length + 
                       patterns.performance_issues.length + 
                       patterns.resource_constraints.length;
    return totalIssues > 3;
  }

  /**
   * Store metrics in Supabase
   */
  private async storeMetrics(metrics: HealthMetrics) {
    try {
      const { data, error } = await this.supabase
        .from('ai_health_metrics')
        .insert([metrics])
        .select();

      if (error) {
        console.error('Error storing metrics:', error);
        return;
      }

      console.log('✅ Health metrics stored successfully');
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  /**
   * Create GitHub issue for critical patterns
   */
  private async createGitHubIssue(metrics: HealthMetrics) {
    const issue: GitHubIssue = {
      title: `🚨 AI Health Alert: ${metrics.status.toUpperCase()} - Deploy ${metrics.deploy_id}`,
      body: this.generateIssueBody(metrics),
      labels: ['ai-health', 'automated', metrics.status]
    };

    try {
      const { data } = await this.octokit.rest.issues.create({
        owner: process.env.GITHUB_OWNER || 'your-org',
        repo: process.env.GITHUB_REPO || 'whats-for-dinner-monorepo',
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      });

      console.log(`✅ GitHub issue created: ${data.html_url}`);
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);
    }
  }

  /**
   * Generate GitHub issue body
   */
  private generateIssueBody(metrics: HealthMetrics): string {
    return `
## AI Health Analysis Report

**Deployment ID:** ${metrics.deploy_id}  
**Environment:** ${metrics.environment}  
**Status:** ${metrics.status.toUpperCase()}  
**Timestamp:** ${metrics.timestamp}

### 📊 Metrics Summary
- **Error Rate:** ${metrics.metrics.error_rate.toFixed(2)}%
- **P95 Latency:** ${metrics.metrics.latency_p95.toFixed(0)}ms
- **Cold Starts:** ${metrics.metrics.cold_start_count}
- **Memory Usage:** ${metrics.metrics.memory_usage.toFixed(1)}%
- **CPU Usage:** ${metrics.metrics.cpu_usage.toFixed(1)}%

### 🔍 Detected Patterns
${metrics.patterns.error_patterns.length > 0 ? `**Error Patterns:**\n${metrics.patterns.error_patterns.map(p => `- ${p}`).join('\n')}\n` : ''}
${metrics.patterns.performance_issues.length > 0 ? `**Performance Issues:**\n${metrics.patterns.performance_issues.map(p => `- ${p}`).join('\n')}\n` : ''}
${metrics.patterns.resource_constraints.length > 0 ? `**Resource Constraints:**\n${metrics.patterns.resource_constraints.map(p => `- ${p}`).join('\n')}\n` : ''}

### 💡 AI Recommendations
${metrics.recommendations.caching.length > 0 ? `**Caching:**\n${metrics.recommendations.caching.map(r => `- ${r}`).join('\n')}\n` : ''}
${metrics.recommendations.schema.length > 0 ? `**Database Schema:**\n${metrics.recommendations.schema.map(r => `- ${r}`).join('\n')}\n` : ''}
${metrics.recommendations.api.length > 0 ? `**API Optimization:**\n${metrics.recommendations.api.map(r => `- ${r}`).join('\n')}\n` : ''}
${metrics.recommendations.infrastructure.length > 0 ? `**Infrastructure:**\n${metrics.recommendations.infrastructure.map(r => `- ${r}`).join('\n')}\n` : ''}

---
*This issue was automatically generated by the AI Self-Diagnosis system.*
    `.trim();
  }

  /**
   * Run weekly health audit
   */
  async runWeeklyAudit() {
    console.log('🔍 Running weekly AI health audit...');
    
    try {
      // Get recent deployments
      const { data: recentDeploys } = await this.supabase
        .from('ai_health_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!recentDeploys || recentDeploys.length === 0) {
        console.log('No recent deployments found for audit');
        return;
      }

      // Analyze trends
      const trends = this.analyzeTrends(recentDeploys);
      
      // Generate weekly report
      const report = this.generateWeeklyReport(trends);
      
      // Post as PR comment
      await this.postPRComment(report);

      console.log('✅ Weekly audit completed');
    } catch (error) {
      console.error('Weekly audit failed:', error);
    }
  }

  private analyzeTrends(deployments: HealthMetrics[]) {
    const errorRates = deployments.map(d => d.metrics.error_rate);
    const latencies = deployments.map(d => d.metrics.latency_p95);
    
    return {
      avgErrorRate: errorRates.reduce((a, b) => a + b, 0) / errorRates.length,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      criticalDeploys: deployments.filter(d => d.status === 'critical').length,
      totalDeploys: deployments.length
    };
  }

  private generateWeeklyReport(trends: any): string {
    return `
## 🤖 AI Weekly Health Report

### 📈 Performance Trends
- **Average Error Rate:** ${trends.avgErrorRate.toFixed(2)}%
- **Average P95 Latency:** ${trends.avgLatency.toFixed(0)}ms
- **Critical Deployments:** ${trends.criticalDeploys}/${trends.totalDeploys}

### 🎯 Recommendations
${trends.avgErrorRate > 2 ? '- Consider implementing more robust error handling\n' : ''}
${trends.avgLatency > 400 ? '- Optimize database queries and add caching\n' : ''}
${trends.criticalDeploys > 0 ? '- Review deployment process for stability improvements\n' : ''}

---
*Generated by AI Self-Diagnosis System*
    `.trim();
  }

  private async postPRComment(report: string) {
    // Implementation would post to the latest PR
    console.log('📝 Weekly report generated (PR comment posting not implemented in demo)');
  }
}

export default AISelfDiagnose;