/**
 * AI-Powered Decision Engine
 * 
 * Implements intelligent decision-making for automated remediation and optimization
 * using machine learning, rule-based systems, and contextual analysis.
 * 
 * Features:
 * - Multi-layered decision architecture
 * - Risk assessment and safety guardrails
 * - Automated remediation actions
 * - Optimization recommendations
 * - Learning from outcomes
 * - Human override capabilities
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';
import { performanceOptimizer } from './performanceOptimizer';
import { supabase } from './supabaseClient';
import { AnomalyDetectionResult } from './anomalyDetectionEngine';

export interface DecisionContext {
  anomaly?: AnomalyDetectionResult;
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'critical';
    components: Record<string, 'healthy' | 'degraded' | 'critical'>;
  };
  recentMetrics: Record<string, number>;
  historicalData: Record<string, any[]>;
  userActivity: {
    activeUsers: number;
    peakHours: boolean;
    recentErrors: number;
  };
  resourceUtilization: {
    cpu: number;
    memory: number;
    database: number;
    ai: number;
  };
  recentActions: string[];
  timeOfDay: number;
  dayOfWeek: number;
}

export interface DecisionAction {
  id: string;
  type: 'remediation' | 'optimization' | 'alert' | 'monitor';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  parameters: Record<string, any>;
  estimatedImpact: {
    performance: number; // -100 to 100
    reliability: number; // -100 to 100
    cost: number; // -100 to 100
    userExperience: number; // -100 to 100
  };
  prerequisites: string[];
  rollbackPlan: string;
  executionTime: number; // seconds
  humanApprovalRequired: boolean;
}

export interface DecisionOutcome {
  actionId: string;
  success: boolean;
  actualImpact: Record<string, number>;
  executionTime: number;
  errors: string[];
  metrics: Record<string, number>;
  timestamp: string;
}

export interface LearningInsight {
  id: string;
  pattern: string;
  confidence: number;
  recommendation: string;
  evidence: any[];
  timestamp: string;
}

export class AIDecisionEngine {
  private decisionHistory: DecisionAction[] = [];
  private outcomeHistory: DecisionOutcome[] = [];
  private learningInsights: LearningInsight[] = [];
  private isRunning: boolean = false;
  private decisionInterval: NodeJS.Timeout | null = null;
  private safetyThresholds: Record<string, number> = {};
  private actionTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeSafetyThresholds();
    this.initializeActionTemplates();
  }

  /**
   * Initialize safety thresholds
   */
  private initializeSafetyThresholds(): void {
    this.safetyThresholds = {
      maxRiskLevel: 0.7,
      minConfidence: 0.6,
      maxConcurrentActions: 3,
      maxResourceImpact: 0.5,
      minTimeBetweenActions: 300, // 5 minutes
      maxActionsPerHour: 10
    };
  }

  /**
   * Initialize action templates
   */
  private initializeActionTemplates(): void {
    this.actionTemplates.set('enable_caching', {
      type: 'optimization',
      description: 'Enable caching for improved performance',
      parameters: { cacheType: 'redis', ttl: 3600 },
      estimatedImpact: { performance: 30, reliability: 10, cost: -5, userExperience: 25 },
      executionTime: 30,
      humanApprovalRequired: false
    });

    this.actionTemplates.set('scale_resources', {
      type: 'remediation',
      description: 'Scale up resources to handle increased load',
      parameters: { scaleFactor: 1.5, resourceType: 'cpu' },
      estimatedImpact: { performance: 40, reliability: 30, cost: 20, userExperience: 35 },
      executionTime: 120,
      humanApprovalRequired: true
    });

    this.actionTemplates.set('optimize_query', {
      type: 'optimization',
      description: 'Optimize database query performance',
      parameters: { queryId: '', optimizationType: 'index' },
      estimatedImpact: { performance: 25, reliability: 15, cost: -10, userExperience: 20 },
      executionTime: 60,
      humanApprovalRequired: false
    });

    this.actionTemplates.set('enable_circuit_breaker', {
      type: 'remediation',
      description: 'Enable circuit breaker for failing service',
      parameters: { service: '', threshold: 0.5, timeout: 30000 },
      estimatedImpact: { performance: 20, reliability: 40, cost: 0, userExperience: 30 },
      executionTime: 45,
      humanApprovalRequired: false
    });

    this.actionTemplates.set('restart_service', {
      type: 'remediation',
      description: 'Restart failing service',
      parameters: { service: '', graceful: true },
      estimatedImpact: { performance: 15, reliability: 35, cost: 0, userExperience: 25 },
      executionTime: 90,
      humanApprovalRequired: true
    });

    this.actionTemplates.set('optimize_ai_model', {
      type: 'optimization',
      description: 'Optimize AI model configuration',
      parameters: { model: '', optimizationType: 'prompt' },
      estimatedImpact: { performance: 20, reliability: 10, cost: -15, userExperience: 15 },
      executionTime: 180,
      humanApprovalRequired: false
    });
  }

  /**
   * Start decision engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Decision engine already running');
      return;
    }

    this.isRunning = true;

    // Start decision interval
    this.decisionInterval = setInterval(async () => {
      await this.runDecisionCycle();
    }, 30000); // Every 30 seconds

    logger.info('🧠 AI Decision Engine started');
  }

  /**
   * Stop decision engine
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.decisionInterval) {
      clearInterval(this.decisionInterval);
      this.decisionInterval = null;
    }

    logger.info('🛑 AI Decision Engine stopped');
  }

  /**
   * Run decision cycle
   */
  private async runDecisionCycle(): Promise<void> {
    try {
      logger.debug('Running AI decision cycle');

      // Gather decision context
      const context = await this.gatherDecisionContext();

      // Analyze context and generate decisions
      const decisions = await this.analyzeContext(context);

      // Execute decisions
      for (const decision of decisions) {
        await this.executeDecision(decision);
      }

      // Learn from recent outcomes
      await this.learnFromOutcomes();

    } catch (error) {
      logger.error('Decision cycle failed', { error });
    }
  }

  /**
   * Gather decision context
   */
  private async gatherDecisionContext(): Promise<DecisionContext> {
    try {
      // Get system health
      const systemHealth = await this.getSystemHealth();

      // Get recent metrics
      const recentMetrics = await this.getRecentMetrics();

      // Get historical data
      const historicalData = await this.getHistoricalData();

      // Get user activity
      const userActivity = await this.getUserActivity();

      // Get resource utilization
      const resourceUtilization = await this.getResourceUtilization();

      // Get recent actions
      const recentActions = this.getRecentActions();

      const now = new Date();
      const timeOfDay = now.getHours();
      const dayOfWeek = now.getDay();

      return {
        systemHealth,
        recentMetrics,
        historicalData,
        userActivity,
        resourceUtilization,
        recentActions,
        timeOfDay,
        dayOfWeek
      };

    } catch (error) {
      logger.error('Failed to gather decision context', { error });
      throw error;
    }
  }

  /**
   * Get system health
   */
  private async getSystemHealth(): Promise<DecisionContext['systemHealth']> {
    try {
      // This would integrate with health check systems
      return {
        overall: 'healthy',
        components: {
          database: 'healthy',
          api: 'healthy',
          frontend: 'healthy',
          mobile: 'healthy',
          ai: 'healthy'
        }
      };
    } catch (error) {
      logger.error('Failed to get system health', { error });
      return {
        overall: 'degraded',
        components: {}
      };
    }
  }

  /**
   * Get recent metrics
   */
  private async getRecentMetrics(): Promise<Record<string, number>> {
    try {
      const { data } = await supabase
        .from('system_metrics')
        .select('metric_type, value')
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      const metrics: Record<string, number> = {};
      data?.forEach(metric => {
        metrics[metric.metric_type] = metric.value;
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to get recent metrics', { error });
      return {};
    }
  }

  /**
   * Get historical data
   */
  private async getHistoricalData(): Promise<Record<string, any[]>> {
    try {
      // This would fetch historical data for analysis
      return {};
    } catch (error) {
      logger.error('Failed to get historical data', { error });
      return {};
    }
  }

  /**
   * Get user activity
   */
  private async getUserActivity(): Promise<DecisionContext['userActivity']> {
    try {
      // This would integrate with user analytics
      return {
        activeUsers: 100,
        peakHours: true,
        recentErrors: 5
      };
    } catch (error) {
      logger.error('Failed to get user activity', { error });
      return {
        activeUsers: 0,
        peakHours: false,
        recentErrors: 0
      };
    }
  }

  /**
   * Get resource utilization
   */
  private async getResourceUtilization(): Promise<DecisionContext['resourceUtilization']> {
    try {
      // This would integrate with resource monitoring
      return {
        cpu: 0.6,
        memory: 0.7,
        database: 0.4,
        ai: 0.3
      };
    } catch (error) {
      logger.error('Failed to get resource utilization', { error });
      return {
        cpu: 0,
        memory: 0,
        database: 0,
        ai: 0
      };
    }
  }

  /**
   * Get recent actions
   */
  private getRecentActions(): string[] {
    return this.decisionHistory.slice(-10).map(action => action.id);
  }

  /**
   * Analyze context and generate decisions
   */
  private async analyzeContext(context: DecisionContext): Promise<DecisionAction[]> {
    const decisions: DecisionAction[] = [];

    try {
      // Analyze anomalies
      if (context.anomaly) {
        const anomalyDecisions = await this.analyzeAnomaly(context.anomaly, context);
        decisions.push(...anomalyDecisions);
      }

      // Analyze system health
      const healthDecisions = await this.analyzeSystemHealth(context);
      decisions.push(...healthDecisions);

      // Analyze performance metrics
      const performanceDecisions = await this.analyzePerformance(context);
      decisions.push(...performanceDecisions);

      // Analyze resource utilization
      const resourceDecisions = await this.analyzeResourceUtilization(context);
      decisions.push(...resourceDecisions);

      // Filter and prioritize decisions
      const filteredDecisions = this.filterAndPrioritizeDecisions(decisions, context);

      return filteredDecisions;

    } catch (error) {
      logger.error('Context analysis failed', { error });
      return [];
    }
  }

  /**
   * Analyze anomaly and generate decisions
   */
  private async analyzeAnomaly(
    anomaly: AnomalyDetectionResult,
    context: DecisionContext
  ): Promise<DecisionAction[]> {
    const decisions: DecisionAction[] = [];

    try {
      // Map anomaly to potential actions
      const actionMappings: Record<string, string[]> = {
        error_rate: ['enable_circuit_breaker', 'restart_service', 'scale_resources'],
        response_time_ms: ['optimize_query', 'enable_caching', 'scale_resources'],
        memory_usage_percent: ['restart_service', 'scale_resources'],
        cpu_usage_percent: ['scale_resources', 'optimize_query'],
        ai_cost_per_hour: ['optimize_ai_model', 'enable_caching']
      };

      const potentialActions = actionMappings[anomaly.metric] || [];
      
      for (const actionType of potentialActions) {
        const decision = await this.createDecision(actionType, anomaly, context);
        if (decision) {
          decisions.push(decision);
        }
      }

    } catch (error) {
      logger.error('Anomaly analysis failed', { error });
    }

    return decisions;
  }

  /**
   * Analyze system health
   */
  private async analyzeSystemHealth(context: DecisionContext): Promise<DecisionAction[]> {
    const decisions: DecisionAction[] = [];

    try {
      if (context.systemHealth.overall === 'critical') {
        const decision = await this.createDecision('restart_service', null, context);
        if (decision) {
          decisions.push(decision);
        }
      }

      // Check individual components
      for (const [component, health] of Object.entries(context.systemHealth.components)) {
        if (health === 'critical') {
          const decision = await this.createDecision('restart_service', null, context, { service: component });
          if (decision) {
            decisions.push(decision);
          }
        }
      }

    } catch (error) {
      logger.error('System health analysis failed', { error });
    }

    return decisions;
  }

  /**
   * Analyze performance metrics
   */
  private async analyzePerformance(context: DecisionContext): Promise<DecisionAction[]> {
    const decisions: DecisionAction[] = [];

    try {
      // Check response time
      if (context.recentMetrics.response_time_ms > 2000) {
        const decision = await this.createDecision('optimize_query', null, context);
        if (decision) {
          decisions.push(decision);
        }
      }

      // Check error rate
      if (context.recentMetrics.error_rate > 0.05) {
        const decision = await this.createDecision('enable_circuit_breaker', null, context);
        if (decision) {
          decisions.push(decision);
        }
      }

    } catch (error) {
      logger.error('Performance analysis failed', { error });
    }

    return decisions;
  }

  /**
   * Analyze resource utilization
   */
  private async analyzeResourceUtilization(context: DecisionContext): Promise<DecisionAction[]> {
    const decisions: DecisionAction[] = [];

    try {
      // Check CPU utilization
      if (context.resourceUtilization.cpu > 0.8) {
        const decision = await this.createDecision('scale_resources', null, context, { resourceType: 'cpu' });
        if (decision) {
          decisions.push(decision);
        }
      }

      // Check memory utilization
      if (context.resourceUtilization.memory > 0.9) {
        const decision = await this.createDecision('scale_resources', null, context, { resourceType: 'memory' });
        if (decision) {
          decisions.push(decision);
        }
      }

    } catch (error) {
      logger.error('Resource utilization analysis failed', { error });
    }

    return decisions;
  }

  /**
   * Create decision from template
   */
  private async createDecision(
    actionType: string,
    anomaly: AnomalyDetectionResult | null,
    context: DecisionContext,
    customParams: Record<string, any> = {}
  ): Promise<DecisionAction | null> {
    try {
      const template = this.actionTemplates.get(actionType);
      if (!template) {
        logger.warn('Unknown action type', { actionType });
        return null;
      }

      // Calculate confidence based on context
      const confidence = this.calculateConfidence(actionType, anomaly, context);

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(actionType, context);

      // Check safety thresholds
      if (confidence < this.safetyThresholds.minConfidence) {
        logger.debug('Decision rejected due to low confidence', { actionType, confidence });
        return null;
      }

      if (riskLevel === 'high' && !template.humanApprovalRequired) {
        logger.debug('Decision requires human approval due to high risk', { actionType, riskLevel });
        return null;
      }

      // Create decision
      const decision: DecisionAction = {
        id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: template.type,
        priority: this.calculatePriority(anomaly, context),
        confidence,
        riskLevel,
        description: template.description,
        parameters: { ...template.parameters, ...customParams },
        estimatedImpact: template.estimatedImpact,
        prerequisites: [],
        rollbackPlan: this.generateRollbackPlan(actionType),
        executionTime: template.executionTime,
        humanApprovalRequired: template.humanApprovalRequired
      };

      return decision;

    } catch (error) {
      logger.error('Failed to create decision', { error, actionType });
      return null;
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    actionType: string,
    anomaly: AnomalyDetectionResult | null,
    context: DecisionContext
  ): number {
    let confidence = 0.5; // Base confidence

    // Anomaly-based confidence
    if (anomaly) {
      confidence += anomaly.confidence * 0.3;
      if (anomaly.severity === 'critical') confidence += 0.2;
      if (anomaly.severity === 'high') confidence += 0.1;
    }

    // Context-based confidence
    if (context.systemHealth.overall === 'critical') confidence += 0.2;
    if (context.systemHealth.overall === 'degraded') confidence += 0.1;

    // Historical success rate
    const successRate = this.getHistoricalSuccessRate(actionType);
    confidence += successRate * 0.2;

    // Resource utilization confidence
    if (context.resourceUtilization.cpu > 0.8) confidence += 0.1;
    if (context.resourceUtilization.memory > 0.9) confidence += 0.1;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(actionType: string, context: DecisionContext): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Action type risk
    const actionRisks: Record<string, number> = {
      'enable_caching': 0.1,
      'optimize_query': 0.2,
      'optimize_ai_model': 0.3,
      'enable_circuit_breaker': 0.4,
      'scale_resources': 0.6,
      'restart_service': 0.8
    };

    riskScore += actionRisks[actionType] || 0.5;

    // Context risk
    if (context.userActivity.peakHours) riskScore += 0.2;
    if (context.systemHealth.overall === 'critical') riskScore += 0.3;
    if (context.recentActions.length > 5) riskScore += 0.1;

    if (riskScore >= 0.7) return 'high';
    if (riskScore >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate priority
   */
  private calculatePriority(
    anomaly: AnomalyDetectionResult | null,
    context: DecisionContext
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (anomaly?.severity === 'critical') return 'critical';
    if (context.systemHealth.overall === 'critical') return 'critical';
    if (anomaly?.severity === 'high') return 'high';
    if (context.systemHealth.overall === 'degraded') return 'high';
    if (anomaly?.severity === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Generate rollback plan
   */
  private generateRollbackPlan(actionType: string): string {
    const rollbackPlans: Record<string, string> = {
      'enable_caching': 'Disable caching and clear cache',
      'scale_resources': 'Scale back to previous resource allocation',
      'optimize_query': 'Revert query optimization changes',
      'enable_circuit_breaker': 'Disable circuit breaker',
      'restart_service': 'Monitor service and restart if needed',
      'optimize_ai_model': 'Revert AI model configuration'
    };

    return rollbackPlans[actionType] || 'Manual intervention required';
  }

  /**
   * Get historical success rate
   */
  private getHistoricalSuccessRate(actionType: string): number {
    const outcomes = this.outcomeHistory.filter(outcome => 
      this.decisionHistory.find(decision => 
        decision.id === outcome.actionId && 
        this.actionTemplates.get(actionType)?.type === decision.type
      )
    );

    if (outcomes.length === 0) return 0.5;

    const successfulOutcomes = outcomes.filter(outcome => outcome.success);
    return successfulOutcomes.length / outcomes.length;
  }

  /**
   * Filter and prioritize decisions
   */
  private filterAndPrioritizeDecisions(
    decisions: DecisionAction[],
    context: DecisionContext
  ): DecisionAction[] {
    // Remove duplicates
    const uniqueDecisions = decisions.filter((decision, index, self) =>
      index === self.findIndex(d => d.type === decision.type && d.parameters.service === decision.parameters.service)
    );

    // Sort by priority and confidence
    const sortedDecisions = uniqueDecisions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    // Limit concurrent actions
    const maxActions = this.safetyThresholds.maxConcurrentActions;
    return sortedDecisions.slice(0, maxActions);
  }

  /**
   * Execute decision
   */
  private async executeDecision(decision: DecisionAction): Promise<void> {
    try {
      logger.info('Executing decision', { 
        id: decision.id, 
        type: decision.type, 
        priority: decision.priority 
      });

      // Check if human approval is required
      if (decision.humanApprovalRequired) {
        logger.info('Decision requires human approval', { id: decision.id });
        // This would integrate with approval workflow
        return;
      }

      // Execute the action
      const startTime = Date.now();
      let success = false;
      let errors: string[] = [];

      try {
        switch (decision.type) {
          case 'remediation':
            success = await this.executeRemediation(decision);
            break;
          case 'optimization':
            success = await this.executeOptimization(decision);
            break;
          case 'alert':
            success = await this.executeAlert(decision);
            break;
          case 'monitor':
            success = await this.executeMonitoring(decision);
            break;
        }
      } catch (error) {
        errors.push(error.message);
        logger.error('Decision execution failed', { error, decisionId: decision.id });
      }

      const executionTime = Date.now() - startTime;

      // Record outcome
      const outcome: DecisionOutcome = {
        actionId: decision.id,
        success,
        actualImpact: {}, // This would be measured after execution
        executionTime,
        errors,
        metrics: {}, // This would be measured after execution
        timestamp: new Date().toISOString()
      };

      this.outcomeHistory.push(outcome);

      // Store in database
      await supabase.from('decision_outcomes').insert({
        action_id: decision.id,
        success,
        execution_time: executionTime,
        errors,
        metrics: outcome.metrics,
        timestamp: outcome.timestamp
      });

      logger.info('Decision executed', { 
        id: decision.id, 
        success, 
        executionTime 
      });

    } catch (error) {
      logger.error('Failed to execute decision', { error, decisionId: decision.id });
    }
  }

  /**
   * Execute remediation action
   */
  private async executeRemediation(decision: DecisionAction): Promise<boolean> {
    try {
      const { parameters } = decision;

      switch (decision.description) {
        case 'Enable circuit breaker for failing service':
          // Implement circuit breaker logic
          logger.info('Enabling circuit breaker', { service: parameters.service });
          return true;

        case 'Restart failing service':
          // Implement service restart logic
          logger.info('Restarting service', { service: parameters.service });
          return true;

        case 'Scale up resources to handle increased load':
          // Implement resource scaling logic
          logger.info('Scaling resources', { parameters });
          return true;

        default:
          logger.warn('Unknown remediation action', { description: decision.description });
          return false;
      }
    } catch (error) {
      logger.error('Remediation execution failed', { error });
      return false;
    }
  }

  /**
   * Execute optimization action
   */
  private async executeOptimization(decision: DecisionAction): Promise<boolean> {
    try {
      const { parameters } = decision;

      switch (decision.description) {
        case 'Enable caching for improved performance':
          // Implement caching logic
          logger.info('Enabling caching', { parameters });
          return true;

        case 'Optimize database query performance':
          // Implement query optimization logic
          logger.info('Optimizing query', { parameters });
          return true;

        case 'Optimize AI model configuration':
          // Implement AI model optimization logic
          logger.info('Optimizing AI model', { parameters });
          return true;

        default:
          logger.warn('Unknown optimization action', { description: decision.description });
          return false;
      }
    } catch (error) {
      logger.error('Optimization execution failed', { error });
      return false;
    }
  }

  /**
   * Execute alert action
   */
  private async executeAlert(decision: DecisionAction): Promise<boolean> {
    try {
      // Implement alerting logic
      logger.info('Sending alert', { parameters: decision.parameters });
      return true;
    } catch (error) {
      logger.error('Alert execution failed', { error });
      return false;
    }
  }

  /**
   * Execute monitoring action
   */
  private async executeMonitoring(decision: DecisionAction): Promise<boolean> {
    try {
      // Implement monitoring logic
      logger.info('Executing monitoring action', { parameters: decision.parameters });
      return true;
    } catch (error) {
      logger.error('Monitoring execution failed', { error });
      return false;
    }
  }

  /**
   * Learn from outcomes
   */
  private async learnFromOutcomes(): Promise<void> {
    try {
      // Analyze recent outcomes
      const recentOutcomes = this.outcomeHistory.slice(-100);
      
      // Generate learning insights
      const insights = await this.generateLearningInsights(recentOutcomes);
      
      // Update decision models
      await this.updateDecisionModels(insights);

    } catch (error) {
      logger.error('Learning from outcomes failed', { error });
    }
  }

  /**
   * Generate learning insights
   */
  private async generateLearningInsights(outcomes: DecisionOutcome[]): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    try {
      // Analyze success patterns
      const successfulOutcomes = outcomes.filter(o => o.success);
      const failedOutcomes = outcomes.filter(o => !o.success);

      // Pattern: High confidence decisions tend to succeed
      if (successfulOutcomes.length > 10) {
        const avgConfidence = successfulOutcomes.reduce((sum, o) => {
          const decision = this.decisionHistory.find(d => d.id === o.actionId);
          return sum + (decision?.confidence || 0);
        }, 0) / successfulOutcomes.length;

        if (avgConfidence > 0.8) {
          insights.push({
            id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pattern: 'High confidence decisions succeed',
            confidence: 0.9,
            recommendation: 'Increase confidence threshold for better success rate',
            evidence: successfulOutcomes.slice(0, 5),
            timestamp: new Date().toISOString()
          });
        }
      }

      // Pattern: Certain action types fail more often
      const actionTypeFailures = failedOutcomes.reduce((acc, outcome) => {
        const decision = this.decisionHistory.find(d => d.id === outcome.actionId);
        if (decision) {
          acc[decision.type] = (acc[decision.type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      for (const [actionType, failureCount] of Object.entries(actionTypeFailures)) {
        if (failureCount > 3) {
          insights.push({
            id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pattern: `${actionType} actions fail frequently`,
            confidence: 0.7,
            recommendation: `Review and improve ${actionType} action implementation`,
            evidence: failedOutcomes.filter(o => {
              const decision = this.decisionHistory.find(d => d.id === o.actionId);
              return decision?.type === actionType;
            }).slice(0, 3),
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      logger.error('Learning insight generation failed', { error });
    }

    return insights;
  }

  /**
   * Update decision models
   */
  private async updateDecisionModels(insights: LearningInsight[]): Promise<void> {
    try {
      for (const insight of insights) {
        this.learningInsights.push(insight);

        // Update safety thresholds based on insights
        if (insight.pattern.includes('High confidence decisions succeed')) {
          this.safetyThresholds.minConfidence = Math.min(0.8, this.safetyThresholds.minConfidence + 0.05);
        }

        // Update action templates based on insights
        if (insight.pattern.includes('actions fail frequently')) {
          const actionType = insight.pattern.split(' ')[0];
          const template = this.actionTemplates.get(actionType);
          if (template) {
            template.humanApprovalRequired = true;
          }
        }
      }

      logger.info('Decision models updated', { insightsCount: insights.length });

    } catch (error) {
      logger.error('Decision model update failed', { error });
    }
  }

  /**
   * Get decision statistics
   */
  getDecisionStatistics(): {
    totalDecisions: number;
    successfulDecisions: number;
    failedDecisions: number;
    decisionsByType: Record<string, number>;
    averageConfidence: number;
    averageExecutionTime: number;
  } {
    const totalDecisions = this.decisionHistory.length;
    const successfulDecisions = this.outcomeHistory.filter(o => o.success).length;
    const failedDecisions = this.outcomeHistory.filter(o => !o.success).length;

    const decisionsByType = this.decisionHistory.reduce((acc, decision) => {
      acc[decision.type] = (acc[decision.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageConfidence = this.decisionHistory.length > 0
      ? this.decisionHistory.reduce((sum, d) => sum + d.confidence, 0) / this.decisionHistory.length
      : 0;

    const averageExecutionTime = this.outcomeHistory.length > 0
      ? this.outcomeHistory.reduce((sum, o) => sum + o.executionTime, 0) / this.outcomeHistory.length
      : 0;

    return {
      totalDecisions,
      successfulDecisions,
      failedDecisions,
      decisionsByType,
      averageConfidence,
      averageExecutionTime
    };
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 50): DecisionAction[] {
    return this.decisionHistory.slice(-limit);
  }

  /**
   * Get learning insights
   */
  getLearningInsights(): LearningInsight[] {
    return this.learningInsights;
  }
}

// Export singleton instance
export const aiDecisionEngine = new AIDecisionEngine();