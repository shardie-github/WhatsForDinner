#!/usr/bin/env node

/**
 * AI Anomaly Detection Agent
 * Monitors system metrics, user behavior, and AI responses for anomalies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../ai-monitoring'),
  verbose: process.env.VERBOSE === 'true',
  thresholds: {
    responseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    userSatisfaction: 3.0, // 3.0/5.0
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.8, // 80%
    dbConnections: 0.8, // 80% of max
    apiLatency: 2000, // 2 seconds
    anomalyScore: 0.7, // 70% confidence
  },
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

/**
 * Anomaly detection algorithms
 */
class AnomalyDetector {
  constructor() {
    this.baselineMetrics = new Map();
    this.anomalyHistory = [];
    this.alertThresholds = config.thresholds;
  }

  /**
   * Statistical anomaly detection using Z-score
   */
  detectStatisticalAnomaly(values, threshold = 2.5) {
    if (values.length < 3) return { isAnomaly: false, score: 0 };

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return { isAnomaly: false, score: 0 };

    const zScores = values.map(val => Math.abs((val - mean) / stdDev));
    const maxZScore = Math.max(...zScores);

    return {
      isAnomaly: maxZScore > threshold,
      score: maxZScore / threshold,
      mean,
      stdDev,
      zScores,
    };
  }

  /**
   * Moving average anomaly detection
   */
  detectMovingAverageAnomaly(values, windowSize = 10, threshold = 0.3) {
    if (values.length < windowSize) return { isAnomaly: false, score: 0 };

    const recent = values.slice(-windowSize);
    const older = values.slice(-windowSize * 2, -windowSize);

    if (older.length === 0) return { isAnomaly: false, score: 0 };

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const changePercent = Math.abs((recentAvg - olderAvg) / olderAvg);

    return {
      isAnomaly: changePercent > threshold,
      score: changePercent / threshold,
      recentAvg,
      olderAvg,
      changePercent,
    };
  }

  /**
   * Pattern-based anomaly detection
   */
  detectPatternAnomaly(values, expectedPattern) {
    if (values.length < expectedPattern.length)
      return { isAnomaly: false, score: 0 };

    const recent = values.slice(-expectedPattern.length);
    const correlation = this.calculateCorrelation(recent, expectedPattern);

    return {
      isAnomaly: correlation < 0.5,
      score: 1 - correlation,
      correlation,
      recent,
      expectedPattern,
    };
  }

  /**
   * Calculate correlation coefficient
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect anomalies in time series data
   */
  detectTimeSeriesAnomaly(data, metric, timeWindow = 24) {
    const values = data
      .map(item => item[metric])
      .filter(val => val !== undefined);

    if (values.length < 10)
      return { isAnomaly: false, score: 0, details: 'Insufficient data' };

    // Apply multiple detection methods
    const statistical = this.detectStatisticalAnomaly(values);
    const movingAvg = this.detectMovingAverageAnomaly(values);
    const pattern = this.detectPatternAnomaly(
      values,
      this.getExpectedPattern(metric)
    );

    // Combine results
    const scores = [statistical.score, movingAvg.score, pattern.score].filter(
      score => score > 0
    );
    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return {
      isAnomaly: avgScore > this.alertThresholds.anomalyScore,
      score: avgScore,
      details: {
        statistical,
        movingAvg,
        pattern,
        values: values.slice(-10), // Last 10 values
        metric,
        timeWindow,
      },
    };
  }

  /**
   * Get expected pattern for a metric
   */
  getExpectedPattern(metric) {
    const patterns = {
      response_time: [
        1000, 1200, 1100, 1300, 1000, 1200, 1100, 1300, 1000, 1200,
      ],
      user_satisfaction: [4.0, 4.2, 4.1, 4.3, 4.0, 4.2, 4.1, 4.3, 4.0, 4.2],
      error_rate: [0.02, 0.03, 0.02, 0.04, 0.02, 0.03, 0.02, 0.04, 0.02, 0.03],
      memory_usage: [0.6, 0.65, 0.62, 0.68, 0.6, 0.65, 0.62, 0.68, 0.6, 0.65],
    };

    return patterns[metric] || Array(10).fill(0);
  }
}

/**
 * System metrics monitoring
 */
class SystemMetricsMonitor {
  constructor() {
    this.metrics = new Map();
    this.anomalyDetector = new AnomalyDetector();
  }

  async collectSystemMetrics() {
    try {
      log('Collecting system metrics...', 'yellow');

      const metrics = {
        timestamp: new Date().toISOString(),
        responseTime: await this.getResponseTimeMetrics(),
        errorRate: await this.getErrorRateMetrics(),
        userSatisfaction: await this.getUserSatisfactionMetrics(),
        memoryUsage: await this.getMemoryUsageMetrics(),
        cpuUsage: await this.getCpuUsageMetrics(),
        dbConnections: await this.getDbConnectionMetrics(),
        apiLatency: await this.getApiLatencyMetrics(),
      };

      // Store metrics
      this.metrics.set(metrics.timestamp, metrics);

      // Keep only last 1000 entries
      if (this.metrics.size > 1000) {
        const oldestKey = this.metrics.keys().next().value;
        this.metrics.delete(oldestKey);
      }

      logVerbose(
        `Collected metrics for ${Object.keys(metrics).length} categories`
      );
      return metrics;
    } catch (error) {
      log(`Error collecting system metrics: ${error.message}`, 'red');
      throw error;
    }
  }

  async getResponseTimeMetrics() {
    try {
      const { data, error } = await supabase
        .from('meal_analytics')
        .select('response_time')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('response_time', 'is', null);

      if (error) throw error;

      const times = data.map(item => item.response_time);
      return {
        current: times.length > 0 ? times[times.length - 1] : 0,
        average:
          times.length > 0
            ? times.reduce((sum, time) => sum + time, 0) / times.length
            : 0,
        max: times.length > 0 ? Math.max(...times) : 0,
        min: times.length > 0 ? Math.min(...times) : 0,
        count: times.length,
      };
    } catch (error) {
      log(`Error getting response time metrics: ${error.message}`, 'red');
      return { current: 0, average: 0, max: 0, min: 0, count: 0 };
    }
  }

  async getErrorRateMetrics() {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('level, created_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const total = data.length;
      const errors = data.filter(log => log.level === 'error').length;
      const errorRate = total > 0 ? errors / total : 0;

      return {
        current: errorRate,
        total,
        errors,
        warnings: data.filter(log => log.level === 'warning').length,
      };
    } catch (error) {
      log(`Error getting error rate metrics: ${error.message}`, 'red');
      return { current: 0, total: 0, errors: 0, warnings: 0 };
    }
  }

  async getUserSatisfactionMetrics() {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('satisfaction_rating')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('satisfaction_rating', 'is', null);

      if (error) throw error;

      const ratings = data.map(item => item.satisfaction_rating);
      return {
        current: ratings.length > 0 ? ratings[ratings.length - 1] : 0,
        average:
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0,
        count: ratings.length,
      };
    } catch (error) {
      log(`Error getting user satisfaction metrics: ${error.message}`, 'red');
      return { current: 0, average: 0, count: 0 };
    }
  }

  async getMemoryUsageMetrics() {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('memory_usage')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('memory_usage', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return {
        current: data.length > 0 ? data[0].memory_usage : 0,
        timestamp:
          data.length > 0 ? data[0].created_at : new Date().toISOString(),
      };
    } catch (error) {
      log(`Error getting memory usage metrics: ${error.message}`, 'red');
      return { current: 0, timestamp: new Date().toISOString() };
    }
  }

  async getCpuUsageMetrics() {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('cpu_usage')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('cpu_usage', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return {
        current: data.length > 0 ? data[0].cpu_usage : 0,
        timestamp:
          data.length > 0 ? data[0].created_at : new Date().toISOString(),
      };
    } catch (error) {
      log(`Error getting CPU usage metrics: ${error.message}`, 'red');
      return { current: 0, timestamp: new Date().toISOString() };
    }
  }

  async getDbConnectionMetrics() {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('db_connections, max_connections')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('db_connections', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const current = data.length > 0 ? data[0].db_connections : 0;
      const max = data.length > 0 ? data[0].max_connections : 100;

      return {
        current,
        max,
        usage: max > 0 ? current / max : 0,
      };
    } catch (error) {
      log(`Error getting DB connection metrics: ${error.message}`, 'red');
      return { current: 0, max: 100, usage: 0 };
    }
  }

  async getApiLatencyMetrics() {
    try {
      const { data, error } = await supabase
        .from('api_metrics')
        .select('latency')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('latency', 'is', null);

      if (error) throw error;

      const latencies = data.map(item => item.latency);
      return {
        current: latencies.length > 0 ? latencies[latencies.length - 1] : 0,
        average:
          latencies.length > 0
            ? latencies.reduce((sum, latency) => sum + latency, 0) /
              latencies.length
            : 0,
        p95: latencies.length > 0 ? this.calculatePercentile(latencies, 95) : 0,
        p99: latencies.length > 0 ? this.calculatePercentile(latencies, 99) : 0,
      };
    } catch (error) {
      log(`Error getting API latency metrics: ${error.message}`, 'red');
      return { current: 0, average: 0, p95: 0, p99: 0 };
    }
  }

  calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  async detectAnomalies() {
    try {
      log('Detecting anomalies...', 'yellow');

      const anomalies = [];
      const metricsData = Array.from(this.metrics.values());

      if (metricsData.length < 10) {
        log('Insufficient data for anomaly detection', 'yellow');
        return [];
      }

      // Check each metric for anomalies
      const metrics = [
        'responseTime',
        'errorRate',
        'userSatisfaction',
        'memoryUsage',
        'cpuUsage',
        'dbConnections',
        'apiLatency',
      ];

      for (const metric of metrics) {
        const data = metricsData.map(item => ({
          [metric]: item[metric]?.current || item[metric]?.average || 0,
          timestamp: item.timestamp,
        }));

        const anomaly = this.anomalyDetector.detectTimeSeriesAnomaly(
          data,
          metric
        );

        if (anomaly.isAnomaly) {
          anomalies.push({
            type: 'metric_anomaly',
            metric,
            score: anomaly.score,
            details: anomaly.details,
            timestamp: new Date().toISOString(),
            severity: this.calculateSeverity(anomaly.score),
          });
        }
      }

      // Check for threshold violations
      const thresholdViolations = await this.checkThresholdViolations(
        metricsData[metricsData.length - 1]
      );
      anomalies.push(...thresholdViolations);

      // Store anomalies
      this.anomalyHistory.push(...anomalies);

      // Keep only last 1000 anomalies
      if (this.anomalyHistory.length > 1000) {
        this.anomalyHistory = this.anomalyHistory.slice(-1000);
      }

      log(
        `Detected ${anomalies.length} anomalies`,
        anomalies.length > 0 ? 'red' : 'green'
      );
      return anomalies;
    } catch (error) {
      log(`Error detecting anomalies: ${error.message}`, 'red');
      throw error;
    }
  }

  async checkThresholdViolations(currentMetrics) {
    const violations = [];

    // Response time threshold
    if (
      currentMetrics.responseTime?.current > this.alertThresholds.responseTime
    ) {
      violations.push({
        type: 'threshold_violation',
        metric: 'responseTime',
        value: currentMetrics.responseTime.current,
        threshold: this.alertThresholds.responseTime,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // Error rate threshold
    if (currentMetrics.errorRate?.current > this.alertThresholds.errorRate) {
      violations.push({
        type: 'threshold_violation',
        metric: 'errorRate',
        value: currentMetrics.errorRate.current,
        threshold: this.alertThresholds.errorRate,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // User satisfaction threshold
    if (
      currentMetrics.userSatisfaction?.current <
      this.alertThresholds.userSatisfaction
    ) {
      violations.push({
        type: 'threshold_violation',
        metric: 'userSatisfaction',
        value: currentMetrics.userSatisfaction.current,
        threshold: this.alertThresholds.userSatisfaction,
        severity: 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    // Memory usage threshold
    if (
      currentMetrics.memoryUsage?.current > this.alertThresholds.memoryUsage
    ) {
      violations.push({
        type: 'threshold_violation',
        metric: 'memoryUsage',
        value: currentMetrics.memoryUsage.current,
        threshold: this.alertThresholds.memoryUsage,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // CPU usage threshold
    if (currentMetrics.cpuUsage?.current > this.alertThresholds.cpuUsage) {
      violations.push({
        type: 'threshold_violation',
        metric: 'cpuUsage',
        value: currentMetrics.cpuUsage.current,
        threshold: this.alertThresholds.cpuUsage,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // DB connections threshold
    if (
      currentMetrics.dbConnections?.usage > this.alertThresholds.dbConnections
    ) {
      violations.push({
        type: 'threshold_violation',
        metric: 'dbConnections',
        value: currentMetrics.dbConnections.usage,
        threshold: this.alertThresholds.dbConnections,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // API latency threshold
    if (currentMetrics.apiLatency?.current > this.alertThresholds.apiLatency) {
      violations.push({
        type: 'threshold_violation',
        metric: 'apiLatency',
        value: currentMetrics.apiLatency.current,
        threshold: this.alertThresholds.apiLatency,
        severity: 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    return violations;
  }

  calculateSeverity(score) {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  async generateAnomalyReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalAnomalies: this.anomalyHistory.length,
          criticalAnomalies: this.anomalyHistory.filter(
            a => a.severity === 'critical'
          ).length,
          highAnomalies: this.anomalyHistory.filter(a => a.severity === 'high')
            .length,
          mediumAnomalies: this.anomalyHistory.filter(
            a => a.severity === 'medium'
          ).length,
          lowAnomalies: this.anomalyHistory.filter(a => a.severity === 'low')
            .length,
        },
        recentAnomalies: this.anomalyHistory.slice(-20),
        metrics: {
          totalMetrics: this.metrics.size,
          lastUpdate:
            this.metrics.size > 0
              ? Array.from(this.metrics.keys())[this.metrics.size - 1]
              : null,
        },
        recommendations: this.generateRecommendations(),
      };

      return report;
    } catch (error) {
      log(`Error generating anomaly report: ${error.message}`, 'red');
      throw error;
    }
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze anomaly patterns
    const criticalAnomalies = this.anomalyHistory.filter(
      a => a.severity === 'critical'
    );
    const highAnomalies = this.anomalyHistory.filter(
      a => a.severity === 'high'
    );

    // Response time recommendations
    const responseTimeAnomalies = this.anomalyHistory.filter(
      a => a.metric === 'responseTime'
    );
    if (responseTimeAnomalies.length > 5) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        issue: 'Frequent response time anomalies',
        recommendation:
          'Consider implementing caching, database optimization, or scaling resources',
        impact: 'High',
      });
    }

    // Error rate recommendations
    const errorRateAnomalies = this.anomalyHistory.filter(
      a => a.metric === 'errorRate'
    );
    if (errorRateAnomalies.length > 3) {
      recommendations.push({
        category: 'reliability',
        priority: 'high',
        issue: 'High error rate anomalies',
        recommendation:
          'Review error handling, add monitoring, and implement circuit breakers',
        impact: 'High',
      });
    }

    // User satisfaction recommendations
    const satisfactionAnomalies = this.anomalyHistory.filter(
      a => a.metric === 'userSatisfaction'
    );
    if (satisfactionAnomalies.length > 3) {
      recommendations.push({
        category: 'user_experience',
        priority: 'medium',
        issue: 'User satisfaction anomalies',
        recommendation:
          'Review AI responses, improve prompt quality, and gather more user feedback',
        impact: 'Medium',
      });
    }

    // Resource usage recommendations
    const resourceAnomalies = this.anomalyHistory.filter(a =>
      ['memoryUsage', 'cpuUsage', 'dbConnections'].includes(a.metric)
    );
    if (resourceAnomalies.length > 5) {
      recommendations.push({
        category: 'infrastructure',
        priority: 'high',
        issue: 'Resource usage anomalies',
        recommendation:
          'Consider auto-scaling, resource optimization, or infrastructure upgrades',
        impact: 'High',
      });
    }

    return recommendations;
  }
}

/**
 * User behavior anomaly detection
 */
class UserBehaviorAnalyzer {
  constructor() {
    this.anomalyDetector = new AnomalyDetector();
  }

  async analyzeUserBehavior() {
    try {
      log('Analyzing user behavior...', 'yellow');

      const behaviorMetrics = await this.collectBehaviorMetrics();
      const anomalies = [];

      // Analyze session patterns
      const sessionAnomalies = await this.analyzeSessionPatterns(
        behaviorMetrics.sessions
      );
      anomalies.push(...sessionAnomalies);

      // Analyze usage patterns
      const usageAnomalies = await this.analyzeUsagePatterns(
        behaviorMetrics.usage
      );
      anomalies.push(...usageAnomalies);

      // Analyze feedback patterns
      const feedbackAnomalies = await this.analyzeFeedbackPatterns(
        behaviorMetrics.feedback
      );
      anomalies.push(...feedbackAnomalies);

      log(
        `Detected ${anomalies.length} user behavior anomalies`,
        anomalies.length > 0 ? 'red' : 'green'
      );
      return anomalies;
    } catch (error) {
      log(`Error analyzing user behavior: ${error.message}`, 'red');
      throw error;
    }
  }

  async collectBehaviorMetrics() {
    try {
      const [sessions, usage, feedback] = await Promise.all([
        this.getSessionMetrics(),
        this.getUsageMetrics(),
        this.getFeedbackMetrics(),
      ]);

      return { sessions, usage, feedback };
    } catch (error) {
      log(`Error collecting behavior metrics: ${error.message}`, 'red');
      throw error;
    }
  }

  async getSessionMetrics() {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      return data.map(session => ({
        duration: session.duration || 0,
        page_views: session.page_views || 0,
        actions: session.actions || 0,
        user_id: session.user_id,
        created_at: session.created_at,
      }));
    } catch (error) {
      log(`Error getting session metrics: ${error.message}`, 'red');
      return [];
    }
  }

  async getUsageMetrics() {
    try {
      const { data, error } = await supabase
        .from('meal_analytics')
        .select('*')
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      return data.map(meal => ({
        user_id: meal.user_id,
        generated_at: meal.created_at,
        response_time: meal.response_time || 0,
        success: meal.success || false,
      }));
    } catch (error) {
      log(`Error getting usage metrics: ${error.message}`, 'red');
      return [];
    }
  }

  async getFeedbackMetrics() {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      return data.map(feedback => ({
        user_id: feedback.user_id,
        rating: feedback.satisfaction_rating || 0,
        feedback_type: feedback.feedback_type,
        created_at: feedback.created_at,
      }));
    } catch (error) {
      log(`Error getting feedback metrics: ${error.message}`, 'red');
      return [];
    }
  }

  async analyzeSessionPatterns(sessions) {
    const anomalies = [];

    if (sessions.length < 10) return anomalies;

    // Analyze session duration
    const durations = sessions.map(s => s.duration);
    const durationAnomaly =
      this.anomalyDetector.detectStatisticalAnomaly(durations);

    if (durationAnomaly.isAnomaly) {
      anomalies.push({
        type: 'session_duration_anomaly',
        metric: 'session_duration',
        score: durationAnomaly.score,
        details: durationAnomaly,
        severity: this.calculateSeverity(durationAnomaly.score),
        timestamp: new Date().toISOString(),
      });
    }

    // Analyze page views per session
    const pageViews = sessions.map(s => s.page_views);
    const pageViewAnomaly =
      this.anomalyDetector.detectStatisticalAnomaly(pageViews);

    if (pageViewAnomaly.isAnomaly) {
      anomalies.push({
        type: 'page_view_anomaly',
        metric: 'page_views',
        score: pageViewAnomaly.score,
        details: pageViewAnomaly,
        severity: this.calculateSeverity(pageViewAnomaly.score),
        timestamp: new Date().toISOString(),
      });
    }

    return anomalies;
  }

  async analyzeUsagePatterns(usage) {
    const anomalies = [];

    if (usage.length < 10) return anomalies;

    // Analyze response times
    const responseTimes = usage.map(u => u.response_time);
    const responseTimeAnomaly =
      this.anomalyDetector.detectStatisticalAnomaly(responseTimes);

    if (responseTimeAnomaly.isAnomaly) {
      anomalies.push({
        type: 'usage_response_time_anomaly',
        metric: 'response_time',
        score: responseTimeAnomaly.score,
        details: responseTimeAnomaly,
        severity: this.calculateSeverity(responseTimeAnomaly.score),
        timestamp: new Date().toISOString(),
      });
    }

    // Analyze success rate
    const successRate = usage.filter(u => u.success).length / usage.length;
    if (successRate < 0.8) {
      anomalies.push({
        type: 'low_success_rate',
        metric: 'success_rate',
        score: 1 - successRate,
        details: { successRate, total: usage.length },
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    return anomalies;
  }

  async analyzeFeedbackPatterns(feedback) {
    const anomalies = [];

    if (feedback.length < 10) return anomalies;

    // Analyze rating distribution
    const ratings = feedback.map(f => f.rating);
    const ratingAnomaly =
      this.anomalyDetector.detectStatisticalAnomaly(ratings);

    if (ratingAnomaly.isAnomaly) {
      anomalies.push({
        type: 'feedback_rating_anomaly',
        metric: 'rating',
        score: ratingAnomaly.score,
        details: ratingAnomaly,
        severity: this.calculateSeverity(ratingAnomaly.score),
        timestamp: new Date().toISOString(),
      });
    }

    // Analyze feedback frequency
    const feedbackCount = feedback.length;
    const expectedFeedback = 50; // Expected feedback per day
    if (feedbackCount < expectedFeedback * 0.5) {
      anomalies.push({
        type: 'low_feedback_frequency',
        metric: 'feedback_count',
        score: 1 - feedbackCount / expectedFeedback,
        details: { feedbackCount, expected: expectedFeedback },
        severity: 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    return anomalies;
  }

  calculateSeverity(score) {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }
}

/**
 * Main anomaly detection function
 */
async function runAnomalyDetection() {
  try {
    log('Starting anomaly detection process...', 'blue');

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Initialize monitors
    const systemMonitor = new SystemMetricsMonitor();
    const behaviorAnalyzer = new UserBehaviorAnalyzer();

    // Collect system metrics
    await systemMonitor.collectSystemMetrics();

    // Detect system anomalies
    const systemAnomalies = await systemMonitor.detectAnomalies();

    // Analyze user behavior
    const behaviorAnomalies = await behaviorAnalyzer.analyzeUserBehavior();

    // Combine all anomalies
    const allAnomalies = [...systemAnomalies, ...behaviorAnomalies];

    // Generate reports
    const systemReport = await systemMonitor.generateAnomalyReport();
    const behaviorReport = {
      timestamp: new Date().toISOString(),
      totalAnomalies: behaviorAnomalies.length,
      anomalies: behaviorAnomalies,
      summary: {
        sessionAnomalies: behaviorAnomalies.filter(a =>
          a.type.includes('session')
        ).length,
        usageAnomalies: behaviorAnomalies.filter(a => a.type.includes('usage'))
          .length,
        feedbackAnomalies: behaviorAnomalies.filter(a =>
          a.type.includes('feedback')
        ).length,
      },
    };

    // Generate combined report
    const combinedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAnomalies: allAnomalies.length,
        systemAnomalies: systemAnomalies.length,
        behaviorAnomalies: behaviorAnomalies.length,
        criticalAnomalies: allAnomalies.filter(a => a.severity === 'critical')
          .length,
        highAnomalies: allAnomalies.filter(a => a.severity === 'high').length,
        mediumAnomalies: allAnomalies.filter(a => a.severity === 'medium')
          .length,
        lowAnomalies: allAnomalies.filter(a => a.severity === 'low').length,
      },
      systemReport,
      behaviorReport,
      allAnomalies,
      recommendations: [
        ...systemReport.recommendations,
        ...this.generateBehaviorRecommendations(behaviorAnomalies),
      ],
    };

    // Save reports
    fs.writeFileSync(
      path.join(config.outputDir, 'anomaly-detection-report.json'),
      JSON.stringify(combinedReport, null, 2)
    );

    // Generate HTML report
    const htmlReport = generateAnomalyHTMLReport(combinedReport);
    fs.writeFileSync(
      path.join(config.outputDir, 'anomaly-detection-report.html'),
      htmlReport
    );

    // Generate alerts for critical anomalies
    const criticalAnomalies = allAnomalies.filter(
      a => a.severity === 'critical'
    );
    if (criticalAnomalies.length > 0) {
      await generateCriticalAlerts(criticalAnomalies);
    }

    log('Anomaly detection completed successfully!', 'green');
    log(`Results saved to: ${config.outputDir}`, 'blue');

    return combinedReport;
  } catch (error) {
    log(`Anomaly detection failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate behavior recommendations
 */
function generateBehaviorRecommendations(anomalies) {
  const recommendations = [];

  // Session duration recommendations
  const sessionAnomalies = anomalies.filter(a => a.type.includes('session'));
  if (sessionAnomalies.length > 3) {
    recommendations.push({
      category: 'user_experience',
      priority: 'medium',
      issue: 'Session duration anomalies',
      recommendation:
        'Review user interface, improve navigation, and optimize page load times',
      impact: 'Medium',
    });
  }

  // Usage pattern recommendations
  const usageAnomalies = anomalies.filter(a => a.type.includes('usage'));
  if (usageAnomalies.length > 3) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      issue: 'Usage pattern anomalies',
      recommendation:
        'Optimize API responses, improve error handling, and enhance user guidance',
      impact: 'High',
    });
  }

  // Feedback recommendations
  const feedbackAnomalies = anomalies.filter(a => a.type.includes('feedback'));
  if (feedbackAnomalies.length > 3) {
    recommendations.push({
      category: 'user_satisfaction',
      priority: 'high',
      issue: 'Feedback pattern anomalies',
      recommendation:
        'Improve AI responses, enhance user experience, and implement better feedback collection',
      impact: 'High',
    });
  }

  return recommendations;
}

/**
 * Generate critical alerts
 */
async function generateCriticalAlerts(criticalAnomalies) {
  try {
    const alerts = criticalAnomalies.map(anomaly => ({
      type: 'critical_anomaly',
      severity: 'critical',
      message: `Critical anomaly detected: ${anomaly.metric}`,
      details: anomaly,
      timestamp: new Date().toISOString(),
      requires_immediate_attention: true,
    }));

    // Save alerts
    fs.writeFileSync(
      path.join(config.outputDir, 'critical-alerts.json'),
      JSON.stringify(alerts, null, 2)
    );

    // Log alerts
    alerts.forEach(alert => {
      log(`🚨 CRITICAL ALERT: ${alert.message}`, 'red');
    });
  } catch (error) {
    log(`Error generating critical alerts: ${error.message}`, 'red');
  }
}

/**
 * Generate HTML anomaly report
 */
function generateAnomalyHTMLReport(report) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anomaly Detection Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .section h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .stat-card.critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .stat-card.high {
            background: #fff3cd;
            color: #856404;
        }
        
        .stat-card.medium {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .stat-card.low {
            background: #d4edda;
            color: #155724;
        }
        
        .anomaly-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .anomaly-item.critical {
            border-left: 4px solid #dc3545;
        }
        
        .anomaly-item.high {
            border-left: 4px solid #fd7e14;
        }
        
        .anomaly-item.medium {
            border-left: 4px solid #ffc107;
        }
        
        .anomaly-item.low {
            border-left: 4px solid #28a745;
        }
        
        .anomaly-item h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .anomaly-details {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #666;
        }
        
        .recommendation {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }
        
        .recommendation.high {
            border-left-color: #dc3545;
        }
        
        .recommendation.medium {
            border-left-color: #ffc107;
        }
        
        .recommendation.low {
            border-left-color: #28a745;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .metric-value {
            font-weight: bold;
        }
        
        .score {
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .score.critical {
            background: #dc3545;
            color: white;
        }
        
        .score.high {
            background: #fd7e14;
            color: white;
        }
        
        .score.medium {
            background: #ffc107;
            color: #333;
        }
        
        .score.low {
            background: #28a745;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Anomaly Detection Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="container">
        <!-- Summary Statistics -->
        <div class="section">
            <h2>Anomaly Summary</h2>
            <div class="stats-grid">
                <div class="stat-card critical">
                    <h3>${report.summary.criticalAnomalies}</h3>
                    <p>Critical Anomalies</p>
                </div>
                
                <div class="stat-card high">
                    <h3>${report.summary.highAnomalies}</h3>
                    <p>High Severity</p>
                </div>
                
                <div class="stat-card medium">
                    <h3>${report.summary.mediumAnomalies}</h3>
                    <p>Medium Severity</p>
                </div>
                
                <div class="stat-card low">
                    <h3>${report.summary.lowAnomalies}</h3>
                    <p>Low Severity</p>
                </div>
                
                <div class="stat-card">
                    <h3>${report.summary.totalAnomalies}</h3>
                    <p>Total Anomalies</p>
                </div>
                
                <div class="stat-card">
                    <h3>${report.summary.systemAnomalies}</h3>
                    <p>System Anomalies</p>
                </div>
                
                <div class="stat-card">
                    <h3>${report.summary.behaviorAnomalies}</h3>
                    <p>Behavior Anomalies</p>
                </div>
            </div>
        </div>
        
        <!-- Recent Anomalies -->
        <div class="section">
            <h2>Recent Anomalies</h2>
            ${report.allAnomalies
              .slice(-10)
              .map(
                anomaly => `
                <div class="anomaly-item ${anomaly.severity}">
                    <h3>${anomaly.type.replace(/_/g, ' ').toUpperCase()}</h3>
                    <p><strong>Metric:</strong> ${anomaly.metric}</p>
                    <p><strong>Score:</strong> <span class="score ${anomaly.severity}">${anomaly.score.toFixed(2)}</span></p>
                    <p><strong>Timestamp:</strong> ${new Date(anomaly.timestamp).toLocaleString()}</p>
                    
                    <div class="anomaly-details">
                        <pre>${JSON.stringify(anomaly.details, null, 2)}</pre>
                    </div>
                </div>
            `
              )
              .join('')}
        </div>
        
        <!-- Recommendations -->
        <div class="section">
            <h2>Recommendations</h2>
            ${report.recommendations
              .map(
                rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.issue}</h4>
                    <p><strong>Category:</strong> ${rec.category}</p>
                    <p><strong>Priority:</strong> ${rec.priority}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                    <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                </div>
            `
              )
              .join('')}
        </div>
        
        <!-- System Metrics -->
        <div class="section">
            <h2>System Metrics Summary</h2>
            <div class="metric">
                <span>Total Metrics Collected</span>
                <span class="metric-value">${report.systemReport.metrics.totalMetrics}</span>
            </div>
            <div class="metric">
                <span>Last Update</span>
                <span class="metric-value">${report.systemReport.metrics.lastUpdate ? new Date(report.systemReport.metrics.lastUpdate).toLocaleString() : 'N/A'}</span>
            </div>
        </div>
        
        <!-- Behavior Analysis -->
        <div class="section">
            <h2>User Behavior Analysis</h2>
            <div class="metric">
                <span>Session Anomalies</span>
                <span class="metric-value">${report.behaviorReport.summary.sessionAnomalies}</span>
            </div>
            <div class="metric">
                <span>Usage Anomalies</span>
                <span class="metric-value">${report.behaviorReport.summary.usageAnomalies}</span>
            </div>
            <div class="metric">
                <span>Feedback Anomalies</span>
                <span class="metric-value">${report.behaviorReport.summary.feedbackAnomalies}</span>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Run anomaly detection if called directly
if (require.main === module) {
  runAnomalyDetection()
    .then(() => {
      log('Anomaly detection completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Anomaly detection failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  runAnomalyDetection,
  AnomalyDetector,
  SystemMetricsMonitor,
  UserBehaviorAnalyzer,
};
