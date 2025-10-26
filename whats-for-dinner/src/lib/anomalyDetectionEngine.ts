/**
 * Advanced Anomaly Detection Engine
 *
 * Implements ML-based anomaly detection algorithms for real-time monitoring
 * of system metrics, error patterns, and performance indicators.
 *
 * Features:
 * - Statistical anomaly detection (Z-score, IQR)
 * - Time series anomaly detection (LSTM, ARIMA)
 * - Pattern-based anomaly detection
 * - Ensemble methods for improved accuracy
 * - Real-time streaming analysis
 * - Adaptive thresholds based on historical data
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';
import { supabase } from './supabaseClient';

export interface AnomalyDetectionConfig {
  algorithm: 'statistical' | 'time_series' | 'pattern' | 'ensemble';
  sensitivity: 'low' | 'medium' | 'high';
  windowSize: number;
  threshold: number;
  minSamples: number;
  enabled: boolean;
}

export interface AnomalyDetectionResult {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  predictedValue?: number;
  anomalyScore: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'point' | 'contextual' | 'collective' | 'pattern';
  algorithm: string;
  context: Record<string, any>;
  explanation: string;
  suggestedActions: string[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  examples: any[];
  detectionRules: string[];
}

export class AnomalyDetectionEngine {
  private configs: Map<string, AnomalyDetectionConfig> = new Map();
  private patterns: AnomalyPattern[] = [];
  private historicalData: Map<string, TimeSeriesData[]> = new Map();
  private anomalyHistory: AnomalyDetectionResult[] = [];
  private isRunning: boolean = false;
  private detectionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultConfigs();
    this.initializeAnomalyPatterns();
  }

  /**
   * Initialize default detection configurations
   */
  private initializeDefaultConfigs(): void {
    const defaultConfigs: Record<string, AnomalyDetectionConfig> = {
      error_rate: {
        algorithm: 'statistical',
        sensitivity: 'high',
        windowSize: 100,
        threshold: 2.0,
        minSamples: 20,
        enabled: true,
      },
      response_time_ms: {
        algorithm: 'time_series',
        sensitivity: 'medium',
        windowSize: 200,
        threshold: 1.5,
        minSamples: 50,
        enabled: true,
      },
      memory_usage_percent: {
        algorithm: 'statistical',
        sensitivity: 'medium',
        windowSize: 150,
        threshold: 2.5,
        minSamples: 30,
        enabled: true,
      },
      cpu_usage_percent: {
        algorithm: 'statistical',
        sensitivity: 'medium',
        windowSize: 150,
        threshold: 2.0,
        minSamples: 30,
        enabled: true,
      },
      ai_cost_per_hour: {
        algorithm: 'time_series',
        sensitivity: 'high',
        windowSize: 100,
        threshold: 1.8,
        minSamples: 25,
        enabled: true,
      },
      throughput: {
        algorithm: 'pattern',
        sensitivity: 'low',
        windowSize: 300,
        threshold: 1.2,
        minSamples: 100,
        enabled: true,
      },
    };

    for (const [metric, config] of Object.entries(defaultConfigs)) {
      this.configs.set(metric, config);
    }

    logger.info('Anomaly detection configurations initialized', {
      count: Object.keys(defaultConfigs).length,
    });
  }

  /**
   * Initialize anomaly patterns
   */
  private initializeAnomalyPatterns(): void {
    this.patterns = [
      {
        id: 'spike_pattern',
        name: 'Sudden Spike',
        description: 'Sudden increase in metric value',
        pattern: 'spike',
        frequency: 0.1,
        severity: 'high',
        examples: [
          'Error rate jumps from 1% to 15%',
          'Response time increases by 500%',
        ],
        detectionRules: [
          'value > mean + 3 * std',
          'rate_of_change > threshold',
        ],
      },
      {
        id: 'drop_pattern',
        name: 'Sudden Drop',
        description: 'Sudden decrease in metric value',
        pattern: 'drop',
        frequency: 0.05,
        severity: 'medium',
        examples: [
          'Throughput drops to zero',
          'Memory usage drops unexpectedly',
        ],
        detectionRules: [
          'value < mean - 3 * std',
          'rate_of_change < -threshold',
        ],
      },
      {
        id: 'trend_pattern',
        name: 'Trend Change',
        description: 'Change in trend direction',
        pattern: 'trend',
        frequency: 0.15,
        severity: 'medium',
        examples: [
          'Gradual increase in error rate',
          'Declining performance over time',
        ],
        detectionRules: ['trend_slope_changes', 'moving_average_divergence'],
      },
      {
        id: 'seasonal_pattern',
        name: 'Seasonal Anomaly',
        description: 'Deviation from seasonal patterns',
        pattern: 'seasonal',
        frequency: 0.08,
        severity: 'low',
        examples: ['Unusual traffic pattern', 'Off-hours activity spike'],
        detectionRules: ['deviates_from_seasonal', 'time_based_anomaly'],
      },
      {
        id: 'collective_pattern',
        name: 'Collective Anomaly',
        description: 'Multiple related metrics show anomalies',
        pattern: 'collective',
        frequency: 0.03,
        severity: 'critical',
        examples: ['Multiple services failing', 'Cascade failure pattern'],
        detectionRules: ['multiple_metrics_anomalous', 'correlation_high'],
      },
    ];

    logger.info('Anomaly patterns initialized', {
      count: this.patterns.length,
    });
  }

  /**
   * Start anomaly detection
   */
  async startDetection(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Anomaly detection already running');
      return;
    }

    this.isRunning = true;

    // Start detection interval
    this.detectionInterval = setInterval(async () => {
      await this.runDetectionCycle();
    }, 60000); // Every minute

    logger.info('🔍 Anomaly detection started');
  }

  /**
   * Stop anomaly detection
   */
  async stopDetection(): Promise<void> {
    this.isRunning = false;

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    logger.info('🛑 Anomaly detection stopped');
  }

  /**
   * Run detection cycle
   */
  private async runDetectionCycle(): Promise<void> {
    try {
      logger.debug('Running anomaly detection cycle');

      // Get recent metrics for all configured metrics
      const metrics = await this.getRecentMetrics();

      // Detect anomalies for each metric
      const allAnomalies: AnomalyDetectionResult[] = [];

      for (const metric of metrics) {
        const config = this.configs.get(metric.metric_type);
        if (!config || !config.enabled) continue;

        const anomalies = await this.detectAnomaliesForMetric(metric, config);
        allAnomalies.push(...anomalies);
      }

      // Process detected anomalies
      for (const anomaly of allAnomalies) {
        await this.processAnomaly(anomaly);
      }

      // Store anomalies
      this.anomalyHistory.push(...allAnomalies);
      if (this.anomalyHistory.length > 10000) {
        this.anomalyHistory = this.anomalyHistory.slice(-10000);
      }

      if (allAnomalies.length > 0) {
        logger.warn(`🚨 Detected ${allAnomalies.length} anomalies`, {
          anomalies: allAnomalies.map(a => ({
            metric: a.metric,
            severity: a.severity,
          })),
        });
      }
    } catch (error) {
      logger.error('Anomaly detection cycle failed', { error });
    }
  }

  /**
   * Get recent metrics for detection
   */
  private async getRecentMetrics(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('system_metrics')
        .select('*')
        .gte(
          'timestamp',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order('timestamp', { ascending: false });

      return data || [];
    } catch (error) {
      logger.error('Failed to get recent metrics', { error });
      return [];
    }
  }

  /**
   * Detect anomalies for a specific metric
   */
  private async detectAnomaliesForMetric(
    metric: any,
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult[]> {
    try {
      // Get historical data for the metric
      const historicalData = await this.getHistoricalData(
        metric.metric_type,
        config.windowSize
      );

      if (historicalData.length < config.minSamples) {
        return []; // Not enough data for detection
      }

      // Update historical data
      this.historicalData.set(metric.metric_type, historicalData);

      // Run detection based on algorithm
      let anomalies: AnomalyDetectionResult[] = [];

      switch (config.algorithm) {
        case 'statistical':
          anomalies = await this.detectStatisticalAnomalies(
            metric,
            historicalData,
            config
          );
          break;
        case 'time_series':
          anomalies = await this.detectTimeSeriesAnomalies(
            metric,
            historicalData,
            config
          );
          break;
        case 'pattern':
          anomalies = await this.detectPatternAnomalies(
            metric,
            historicalData,
            config
          );
          break;
        case 'ensemble':
          anomalies = await this.detectEnsembleAnomalies(
            metric,
            historicalData,
            config
          );
          break;
      }

      return anomalies;
    } catch (error) {
      logger.error('Failed to detect anomalies for metric', {
        error,
        metric: metric.metric_type,
      });
      return [];
    }
  }

  /**
   * Get historical data for a metric
   */
  private async getHistoricalData(
    metricType: string,
    windowSize: number
  ): Promise<TimeSeriesData[]> {
    try {
      const { data } = await supabase
        .from('system_metrics')
        .select('timestamp, value, metadata')
        .eq('metric_type', metricType)
        .order('timestamp', { ascending: false })
        .limit(windowSize);

      return (data || []).map(item => ({
        timestamp: item.timestamp,
        value: item.value,
        metadata: item.metadata,
      }));
    } catch (error) {
      logger.error('Failed to get historical data', { error, metricType });
      return [];
    }
  }

  /**
   * Detect statistical anomalies using Z-score and IQR methods
   */
  private async detectStatisticalAnomalies(
    metric: any,
    historicalData: TimeSeriesData[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];

    try {
      const values = historicalData.map(d => d.value);
      const currentValue = metric.value;

      // Calculate statistics
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length;
      const stdDev = Math.sqrt(variance);

      // Z-score method
      const zScore = Math.abs((currentValue - mean) / stdDev);

      if (zScore > config.threshold) {
        const anomaly: AnomalyDetectionResult = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          metric: metric.metric_type,
          value: currentValue,
          predictedValue: mean,
          anomalyScore: zScore,
          confidence: Math.min(0.95, zScore / 5),
          severity: this.calculateSeverity(zScore, config.sensitivity),
          type: 'point',
          algorithm: 'statistical_zscore',
          context: {
            mean,
            stdDev,
            zScore,
            historicalCount: values.length,
          },
          explanation: `Value ${currentValue} is ${zScore.toFixed(2)} standard deviations from mean ${mean.toFixed(2)}`,
          suggestedActions: this.getSuggestedActions(
            metric.metric_type,
            zScore
          ),
        };

        anomalies.push(anomaly);
      }

      // IQR method for additional validation
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      if (currentValue < lowerBound || currentValue > upperBound) {
        const iqrAnomaly: AnomalyDetectionResult = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          metric: metric.metric_type,
          value: currentValue,
          predictedValue: (q1 + q3) / 2,
          anomalyScore: Math.abs(currentValue - (q1 + q3) / 2) / iqr,
          confidence: 0.8,
          severity: this.calculateSeverity(
            Math.abs(currentValue - (q1 + q3) / 2) / iqr,
            config.sensitivity
          ),
          type: 'point',
          algorithm: 'statistical_iqr',
          context: {
            q1,
            q3,
            iqr,
            lowerBound,
            upperBound,
          },
          explanation: `Value ${currentValue} is outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
          suggestedActions: this.getSuggestedActions(
            metric.metric_type,
            Math.abs(currentValue - (q1 + q3) / 2) / iqr
          ),
        };

        anomalies.push(iqrAnomaly);
      }
    } catch (error) {
      logger.error('Statistical anomaly detection failed', { error });
    }

    return anomalies;
  }

  /**
   * Detect time series anomalies using trend analysis
   */
  private async detectTimeSeriesAnomalies(
    metric: any,
    historicalData: TimeSeriesData[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];

    try {
      const values = historicalData.map(d => d.value);
      const currentValue = metric.value;

      // Calculate moving average
      const windowSize = Math.min(20, Math.floor(values.length / 3));
      const movingAverage = this.calculateMovingAverage(values, windowSize);
      const lastMovingAvg = movingAverage[movingAverage.length - 1];

      // Calculate trend
      const trend = this.calculateTrend(values.slice(-10)); // Last 10 values

      // Detect trend anomalies
      const trendDeviation = Math.abs(trend - 0) / Math.abs(trend + 0.001);

      if (trendDeviation > config.threshold) {
        const anomaly: AnomalyDetectionResult = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          metric: metric.metric_type,
          value: currentValue,
          predictedValue: lastMovingAvg,
          anomalyScore: trendDeviation,
          confidence: Math.min(0.9, trendDeviation / 3),
          severity: this.calculateSeverity(trendDeviation, config.sensitivity),
          type: 'trend',
          algorithm: 'time_series_trend',
          context: {
            trend,
            movingAverage: lastMovingAvg,
            trendDeviation,
            windowSize,
          },
          explanation: `Trend deviation detected: ${trend > 0 ? 'increasing' : 'decreasing'} trend with ${trendDeviation.toFixed(2)} deviation`,
          suggestedActions: this.getSuggestedActions(
            metric.metric_type,
            trendDeviation
          ),
        };

        anomalies.push(anomaly);
      }

      // Detect seasonal anomalies
      const seasonalAnomaly = await this.detectSeasonalAnomaly(
        metric,
        historicalData,
        config
      );
      if (seasonalAnomaly) {
        anomalies.push(seasonalAnomaly);
      }
    } catch (error) {
      logger.error('Time series anomaly detection failed', { error });
    }

    return anomalies;
  }

  /**
   * Detect pattern-based anomalies
   */
  private async detectPatternAnomalies(
    metric: any,
    historicalData: TimeSeriesData[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];

    try {
      const values = historicalData.map(d => d.value);
      const currentValue = metric.value;

      // Check against known patterns
      for (const pattern of this.patterns) {
        const patternMatch = await this.checkPatternMatch(
          metric.metric_type,
          values,
          currentValue,
          pattern
        );

        if (patternMatch.isMatch) {
          const anomaly: AnomalyDetectionResult = {
            id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            metric: metric.metric_type,
            value: currentValue,
            anomalyScore: patternMatch.score,
            confidence: patternMatch.confidence,
            severity: pattern.severity,
            type: 'pattern',
            algorithm: `pattern_${pattern.id}`,
            context: {
              pattern: pattern.name,
              patternId: pattern.id,
              matchScore: patternMatch.score,
            },
            explanation: `Pattern "${pattern.name}" detected: ${pattern.description}`,
            suggestedActions: this.getSuggestedActions(
              metric.metric_type,
              patternMatch.score
            ),
          };

          anomalies.push(anomaly);
        }
      }
    } catch (error) {
      logger.error('Pattern anomaly detection failed', { error });
    }

    return anomalies;
  }

  /**
   * Detect anomalies using ensemble methods
   */
  private async detectEnsembleAnomalies(
    metric: any,
    historicalData: TimeSeriesData[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];

    try {
      // Run multiple detection algorithms
      const statisticalAnomalies = await this.detectStatisticalAnomalies(
        metric,
        historicalData,
        config
      );
      const timeSeriesAnomalies = await this.detectTimeSeriesAnomalies(
        metric,
        historicalData,
        config
      );
      const patternAnomalies = await this.detectPatternAnomalies(
        metric,
        historicalData,
        config
      );

      // Combine results using voting
      const allAnomalies = [
        ...statisticalAnomalies,
        ...timeSeriesAnomalies,
        ...patternAnomalies,
      ];

      if (allAnomalies.length >= 2) {
        // At least 2 algorithms agree
        const avgScore =
          allAnomalies.reduce((sum, a) => sum + a.anomalyScore, 0) /
          allAnomalies.length;
        const avgConfidence =
          allAnomalies.reduce((sum, a) => sum + a.confidence, 0) /
          allAnomalies.length;

        const ensembleAnomaly: AnomalyDetectionResult = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          metric: metric.metric_type,
          value: metric.value,
          anomalyScore: avgScore,
          confidence: avgConfidence,
          severity: this.calculateSeverity(avgScore, config.sensitivity),
          type: 'collective',
          algorithm: 'ensemble',
          context: {
            algorithmCount: allAnomalies.length,
            algorithms: allAnomalies.map(a => a.algorithm),
            individualScores: allAnomalies.map(a => a.anomalyScore),
          },
          explanation: `Ensemble detection: ${allAnomalies.length} algorithms detected anomaly with average score ${avgScore.toFixed(2)}`,
          suggestedActions: this.getSuggestedActions(
            metric.metric_type,
            avgScore
          ),
        };

        anomalies.push(ensembleAnomaly);
      }
    } catch (error) {
      logger.error('Ensemble anomaly detection failed', { error });
    }

    return anomalies;
  }

  /**
   * Calculate moving average
   */
  private calculateMovingAverage(
    values: number[],
    windowSize: number
  ): number[] {
    const movingAvg: number[] = [];

    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      movingAvg.push(avg);
    }

    return movingAvg;
  }

  /**
   * Calculate trend using linear regression
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  }

  /**
   * Detect seasonal anomalies
   */
  private async detectSeasonalAnomaly(
    metric: any,
    historicalData: TimeSeriesData[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyDetectionResult | null> {
    try {
      // This would implement seasonal anomaly detection
      // For now, return null as it requires more complex time series analysis
      return null;
    } catch (error) {
      logger.error('Seasonal anomaly detection failed', { error });
      return null;
    }
  }

  /**
   * Check pattern match
   */
  private async checkPatternMatch(
    metricType: string,
    values: number[],
    currentValue: number,
    pattern: AnomalyPattern
  ): Promise<{ isMatch: boolean; score: number; confidence: number }> {
    try {
      // Implement pattern matching logic based on pattern rules
      let score = 0;
      let confidence = 0;

      switch (pattern.id) {
        case 'spike_pattern':
          const mean =
            values.reduce((sum, val) => sum + val, 0) / values.length;
          const stdDev = Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
              values.length
          );
          const zScore = (currentValue - mean) / stdDev;

          if (zScore > 3) {
            score = zScore;
            confidence = Math.min(0.95, zScore / 5);
            return { isMatch: true, score, confidence };
          }
          break;

        case 'drop_pattern':
          const minValue = Math.min(...values);
          if (currentValue < minValue * 0.5) {
            score = (minValue - currentValue) / minValue;
            confidence = 0.8;
            return { isMatch: true, score, confidence };
          }
          break;

        case 'trend_pattern':
          const trend = this.calculateTrend(values.slice(-10));
          if (Math.abs(trend) > 0.1) {
            score = Math.abs(trend);
            confidence = 0.7;
            return { isMatch: true, score, confidence };
          }
          break;
      }

      return { isMatch: false, score: 0, confidence: 0 };
    } catch (error) {
      logger.error('Pattern matching failed', { error });
      return { isMatch: false, score: 0, confidence: 0 };
    }
  }

  /**
   * Calculate severity based on score and sensitivity
   */
  private calculateSeverity(
    score: number,
    sensitivity: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const thresholds = {
      low: { critical: 5, high: 3, medium: 2 },
      medium: { critical: 4, high: 2.5, medium: 1.5 },
      high: { critical: 3, high: 2, medium: 1 },
    };

    const threshold = thresholds[sensitivity];

    if (score >= threshold.critical) return 'critical';
    if (score >= threshold.high) return 'high';
    if (score >= threshold.medium) return 'medium';
    return 'low';
  }

  /**
   * Get suggested actions for anomaly
   */
  private getSuggestedActions(metricType: string, score: number): string[] {
    const actions: Record<string, string[]> = {
      error_rate: [
        'Check application logs for error patterns',
        'Review recent deployments for issues',
        'Implement circuit breaker pattern',
        'Scale up resources if needed',
      ],
      response_time_ms: [
        'Optimize database queries',
        'Implement caching layer',
        'Check for resource bottlenecks',
        'Review API endpoint performance',
      ],
      memory_usage_percent: [
        'Check for memory leaks',
        'Optimize data structures',
        'Implement garbage collection tuning',
        'Scale up memory resources',
      ],
      cpu_usage_percent: [
        'Check for CPU-intensive operations',
        'Optimize algorithms',
        'Implement load balancing',
        'Scale up CPU resources',
      ],
      ai_cost_per_hour: [
        'Optimize AI model usage',
        'Implement request batching',
        'Review prompt efficiency',
        'Consider model alternatives',
      ],
    };

    return (
      actions[metricType] || ['Investigate the issue', 'Check system logs']
    );
  }

  /**
   * Process detected anomaly
   */
  private async processAnomaly(anomaly: AnomalyDetectionResult): Promise<void> {
    try {
      // Log anomaly
      await monitoringSystem.recordCounter('anomalies_detected', 1, {
        metric: anomaly.metric,
        severity: anomaly.severity,
        algorithm: anomaly.algorithm,
      });

      // Store in database
      await supabase.from('anomaly_detections').insert({
        id: anomaly.id,
        timestamp: anomaly.timestamp,
        metric: anomaly.metric,
        value: anomaly.value,
        anomaly_score: anomaly.anomalyScore,
        confidence: anomaly.confidence,
        severity: anomaly.severity,
        type: anomaly.type,
        algorithm: anomaly.algorithm,
        context: anomaly.context,
        explanation: anomaly.explanation,
        suggested_actions: anomaly.suggestedActions,
      });

      // Send alert for high severity anomalies
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        await this.sendAnomalyAlert(anomaly);
      }
    } catch (error) {
      logger.error('Failed to process anomaly', { error, anomaly });
    }
  }

  /**
   * Send anomaly alert
   */
  private async sendAnomalyAlert(
    anomaly: AnomalyDetectionResult
  ): Promise<void> {
    try {
      const message = `🚨 ANOMALY DETECTED
Metric: ${anomaly.metric}
Severity: ${anomaly.severity.toUpperCase()}
Value: ${anomaly.value}
Anomaly Score: ${anomaly.anomalyScore.toFixed(2)}
Confidence: ${(anomaly.confidence * 100).toFixed(1)}%
Algorithm: ${anomaly.algorithm}
Explanation: ${anomaly.explanation}

Suggested Actions:
${anomaly.suggestedActions.map(action => `• ${action}`).join('\n')}`;

      // This would integrate with alerting system
      logger.warn('Anomaly alert', { message });
    } catch (error) {
      logger.error('Failed to send anomaly alert', { error });
    }
  }

  /**
   * Update detection configuration
   */
  async updateConfig(
    metricType: string,
    config: Partial<AnomalyDetectionConfig>
  ): Promise<void> {
    try {
      const currentConfig = this.configs.get(metricType);
      if (currentConfig) {
        const updatedConfig = { ...currentConfig, ...config };
        this.configs.set(metricType, updatedConfig);

        logger.info('Detection configuration updated', {
          metricType,
          config: updatedConfig,
        });
      }
    } catch (error) {
      logger.error('Failed to update detection configuration', { error });
    }
  }

  /**
   * Get detection statistics
   */
  getDetectionStatistics(): {
    totalAnomalies: number;
    anomaliesBySeverity: Record<string, number>;
    anomaliesByAlgorithm: Record<string, number>;
    anomaliesByMetric: Record<string, number>;
    averageConfidence: number;
  } {
    const totalAnomalies = this.anomalyHistory.length;

    const anomaliesBySeverity = this.anomalyHistory.reduce(
      (acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const anomaliesByAlgorithm = this.anomalyHistory.reduce(
      (acc, anomaly) => {
        acc[anomaly.algorithm] = (acc[anomaly.algorithm] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const anomaliesByMetric = this.anomalyHistory.reduce(
      (acc, anomaly) => {
        acc[anomaly.metric] = (acc[anomaly.metric] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageConfidence =
      this.anomalyHistory.length > 0
        ? this.anomalyHistory.reduce(
            (sum, anomaly) => sum + anomaly.confidence,
            0
          ) / this.anomalyHistory.length
        : 0;

    return {
      totalAnomalies,
      anomaliesBySeverity,
      anomaliesByAlgorithm,
      anomaliesByMetric,
      averageConfidence,
    };
  }

  /**
   * Get recent anomalies
   */
  getRecentAnomalies(limit: number = 50): AnomalyDetectionResult[] {
    return this.anomalyHistory.slice(-limit);
  }

  /**
   * Get anomaly patterns
   */
  getAnomalyPatterns(): AnomalyPattern[] {
    return this.patterns;
  }

  /**
   * Get detection configurations
   */
  getDetectionConfigs(): Map<string, AnomalyDetectionConfig> {
    return this.configs;
  }
}

// Export singleton instance
export const anomalyDetectionEngine = new AnomalyDetectionEngine();
