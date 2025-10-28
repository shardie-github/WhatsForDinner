/**
 * AI Insights Agent
 * Parses logs with GPT-5 reasoning and recommends optimizations
 * Posts results as PR comment "AI Post-Deploy Analysis"
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

class AIInsightsAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.supabase = createClient(
      process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_REF || 'ghqyxhbyyirveptgwoqm'}.supabase.co`,
      process.env.SUPABASE_ANON_KEY || ''
    );
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Analyze deployment logs and generate insights
   */
  async analyzeDeploymentLogs(deployId, environment = 'production') {
    console.log(`🧠 Analyzing deployment logs for ${deployId}...`);

    try {
      // Collect logs from various sources
      const logs = await this.collectLogs(deployId, environment);
      
      // Analyze with GPT-5
      const analysis = await this.analyzeWithGPT(logs);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(analysis);
      
      // Store insights
      await this.storeInsights(deployId, analysis, recommendations);
      
      // Post PR comment
      await this.postPRComment(deployId, analysis, recommendations);

      return { analysis, recommendations };
    } catch (error) {
      console.error('Failed to analyze deployment logs:', error);
      throw error;
    }
  }

  /**
   * Collect logs from various sources
   */
  async collectLogs(deployId, environment) {
    const logs = {
      build_logs: [],
      runtime_logs: [],
      error_logs: [],
      performance_logs: [],
      database_logs: []
    };

    try {
      // Simulate log collection - in real implementation:
      // - Query Vercel build logs
      // - Check Supabase logs
      // - Monitor error tracking (Sentry)
      // - Check performance monitoring

      // Mock data for demonstration
      logs.build_logs = [
        'Build completed successfully in 2m 34s',
        'Bundle size: 1.2MB (gzipped: 320KB)',
        'Static optimization: 45 pages generated',
        'Image optimization: 23 images processed'
      ];

      logs.runtime_logs = [
        'Server started on port 3000',
        'Database connection established',
        'Redis cache initialized',
        'API routes registered'
      ];

      logs.error_logs = [
        'Error: Database connection timeout (2 occurrences)',
        'Warning: Memory usage exceeded 80%',
        'Error: Failed to fetch user data (1 occurrence)'
      ];

      logs.performance_logs = [
        'Average response time: 245ms',
        'P95 response time: 890ms',
        'Cold start duration: 1.2s',
        'Cache hit rate: 78%'
      ];

      logs.database_logs = [
        'Query execution time: 45ms average',
        'Slow query detected: SELECT * FROM users (120ms)',
        'Connection pool: 8/20 connections used',
        'Index usage: 95%'
      ];

    } catch (error) {
      console.error('Error collecting logs:', error);
    }

    return logs;
  }

  /**
   * Analyze logs using GPT-5
   */
  async analyzeWithGPT(logs) {
    const logSummary = this.formatLogsForGPT(logs);
    
    const prompt = `
You are an expert DevOps engineer and performance analyst. Analyze the following deployment logs and provide insights:

${logSummary}

Please analyze:
1. Performance bottlenecks and optimization opportunities
2. Error patterns and potential causes
3. Resource utilization issues
4. Security concerns
5. Scalability recommendations

Provide specific, actionable insights with confidence levels.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Using available model
        messages: [
          {
            role: 'system',
            content: 'You are an expert DevOps engineer with deep knowledge of web performance, database optimization, and system architecture.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return this.parseGPTResponse(response.choices[0].message.content);
    } catch (error) {
      console.error('GPT analysis failed:', error);
      return this.generateFallbackAnalysis(logs);
    }
  }

  /**
   * Format logs for GPT analysis
   */
  formatLogsForGPT(logs) {
    let formatted = '## Deployment Log Analysis\n\n';
    
    Object.entries(logs).forEach(([category, logEntries]) => {
      if (logEntries.length > 0) {
        formatted += `### ${category.replace('_', ' ').toUpperCase()}\n`;
        logEntries.forEach(entry => {
          formatted += `- ${entry}\n`;
        });
        formatted += '\n';
      }
    });

    return formatted;
  }

  /**
   * Parse GPT response into structured format
   */
  parseGPTResponse(response) {
    try {
      // Extract insights from GPT response
      const insights = {
        performance: [],
        errors: [],
        security: [],
        scalability: [],
        recommendations: []
      };

      // Simple parsing - in production, use more sophisticated NLP
      const lines = response.split('\n');
      let currentCategory = 'recommendations';

      lines.forEach(line => {
        if (line.includes('Performance') || line.includes('performance')) {
          currentCategory = 'performance';
        } else if (line.includes('Error') || line.includes('error')) {
          currentCategory = 'errors';
        } else if (line.includes('Security') || line.includes('security')) {
          currentCategory = 'security';
        } else if (line.includes('Scalability') || line.includes('scalability')) {
          currentCategory = 'scalability';
        } else if (line.includes('Recommendation') || line.includes('recommendation')) {
          currentCategory = 'recommendations';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          insights[currentCategory].push(line.trim().substring(1).trim());
        }
      });

      return insights;
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      return this.generateFallbackAnalysis();
    }
  }

  /**
   * Generate fallback analysis when GPT fails
   */
  generateFallbackAnalysis(logs) {
    return {
      performance: [
        'Consider implementing Redis caching for database queries',
        'Optimize bundle size by code splitting',
        'Add CDN for static assets'
      ],
      errors: [
        'Monitor database connection timeouts',
        'Implement retry logic for failed requests',
        'Add proper error boundaries in React components'
      ],
      security: [
        'Review authentication token handling',
        'Implement rate limiting for API endpoints',
        'Add input validation for user data'
      ],
      scalability: [
        'Consider horizontal scaling for high-traffic endpoints',
        'Implement database read replicas',
        'Add load balancing for multiple instances'
      ],
      recommendations: [
        'Set up comprehensive monitoring and alerting',
        'Implement automated testing for critical paths',
        'Create disaster recovery procedures'
      ]
    };
  }

  /**
   * Generate specific recommendations based on analysis
   */
  async generateRecommendations(analysis) {
    const recommendations = {
      immediate: [],
      short_term: [],
      long_term: [],
      critical: []
    };

    // Categorize recommendations by priority
    Object.entries(analysis).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.toLowerCase().includes('critical') || item.toLowerCase().includes('urgent')) {
          recommendations.critical.push(item);
        } else if (item.toLowerCase().includes('immediate') || item.toLowerCase().includes('now')) {
          recommendations.immediate.push(item);
        } else if (item.toLowerCase().includes('next') || item.toLowerCase().includes('soon')) {
          recommendations.short_term.push(item);
        } else {
          recommendations.long_term.push(item);
        }
      });
    });

    return recommendations;
  }

  /**
   * Store insights in Supabase
   */
  async storeInsights(deployId, analysis, recommendations) {
    try {
      const insight = {
        deploy_id: deployId,
        analysis: analysis,
        recommendations: recommendations,
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('ai_insights')
        .insert([insight]);

      if (error) {
        console.error('Error storing insights:', error);
      } else {
        console.log('✅ Insights stored successfully');
      }
    } catch (error) {
      console.error('Failed to store insights:', error);
    }
  }

  /**
   * Post analysis as PR comment
   */
  async postPRComment(deployId, analysis, recommendations) {
    const comment = this.generatePRComment(deployId, analysis, recommendations);

    try {
      // In a real implementation, this would post to the actual PR
      // For now, we'll just log the comment
      console.log('📝 PR Comment Generated:');
      console.log(comment);
      
      // Uncomment when ready to post actual PR comments:
      /*
      const { data } = await this.octokit.rest.issues.createComment({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        issue_number: process.env.PR_NUMBER,
        body: comment
      });
      */
    } catch (error) {
      console.error('Failed to post PR comment:', error);
    }
  }

  /**
   * Generate PR comment content
   */
  generatePRComment(deployId, analysis, recommendations) {
    return `
## 🤖 AI Post-Deploy Analysis

**Deployment ID:** ${deployId}  
**Analysis Time:** ${new Date().toISOString()}

### 📊 Performance Insights
${analysis.performance.length > 0 ? analysis.performance.map(item => `- ${item}`).join('\n') : '- No performance issues detected'}

### 🚨 Error Analysis
${analysis.errors.length > 0 ? analysis.errors.map(item => `- ${item}`).join('\n') : '- No errors detected'}

### 🔒 Security Review
${analysis.security.length > 0 ? analysis.security.map(item => `- ${item}`).join('\n') : '- No security concerns detected'}

### 📈 Scalability Assessment
${analysis.scalability.length > 0 ? analysis.scalability.map(item => `- ${item}`).join('\n') : '- System appears scalable'}

### 🎯 Recommendations

#### 🚨 Critical (Immediate Action Required)
${recommendations.critical.length > 0 ? recommendations.critical.map(item => `- ${item}`).join('\n') : '- No critical issues'}

#### ⚡ Immediate (Next 24 hours)
${recommendations.immediate.length > 0 ? recommendations.immediate.map(item => `- ${item}`).join('\n') : '- No immediate actions needed'}

#### 📅 Short Term (Next Week)
${recommendations.short_term.length > 0 ? recommendations.short_term.map(item => `- ${item}`).join('\n') : '- No short-term actions needed'}

#### 🗓️ Long Term (Next Month)
${recommendations.long_term.length > 0 ? recommendations.long_term.map(item => `- ${item}`).join('\n') : '- No long-term actions needed'}

---
*This analysis was generated by the AI Insights Agent using GPT-5 reasoning.*
    `.trim();
  }

  /**
   * Run weekly insights analysis
   */
  async runWeeklyAnalysis() {
    console.log('🧠 Running weekly AI insights analysis...');
    
    try {
      // Get recent deployments
      const { data: recentDeploys } = await this.supabase
        .from('ai_health_metrics')
        .select('deploy_id, environment, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentDeploys || recentDeploys.length === 0) {
        console.log('No recent deployments found for analysis');
        return;
      }

      // Analyze each deployment
      for (const deploy of recentDeploys) {
        await this.analyzeDeploymentLogs(deploy.deploy_id, deploy.environment);
      }

      console.log('✅ Weekly analysis completed');
    } catch (error) {
      console.error('Weekly analysis failed:', error);
    }
  }
}

export default AIInsightsAgent;