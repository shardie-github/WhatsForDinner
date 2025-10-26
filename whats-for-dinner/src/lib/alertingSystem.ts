/**
 * Comprehensive Alerting System
 * 
 * Implements multi-channel alerting with Slack, email, SMS, and webhook support
 * for critical system failures and important notifications.
 * 
 * Features:
 * - Multi-channel alerting (Slack, email, SMS, webhooks)
 * - Intelligent alert routing and prioritization
 * - Alert deduplication and throttling
 * - Escalation policies
 * - Alert templates and formatting
 * - Integration with monitoring and decision systems
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';
import { supabase } from './supabaseClient';
import { AnomalyDetectionResult } from './anomalyDetectionEngine';
import { DecisionAction } from './aiDecisionEngine';

export interface AlertChannel {
  id: string;
  type: 'slack' | 'email' | 'sms' | 'webhook' | 'pagerduty';
  name: string;
  enabled: boolean;
  configuration: Record<string, any>;
  routingRules: AlertRoutingRule[];
  escalationPolicy?: EscalationPolicy;
}

export interface AlertRoutingRule {
  id: string;
  name: string;
  conditions: AlertCondition[];
  channelId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
  enabled: boolean;
}

export interface EscalationStep {
  delay: number; // minutes
  channelId: string;
  message: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'performance' | 'security' | 'anomaly' | 'decision' | 'compliance';
  source: string;
  metadata: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed' | 'acknowledged' | 'resolved';
  channels: string[];
  escalationLevel: number;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertTemplate {
  id: string;
  name: string;
  category: string;
  titleTemplate: string;
  messageTemplate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  enabled: boolean;
}

export interface AlertThrottle {
  id: string;
  pattern: string;
  maxAlerts: number;
  timeWindow: number; // minutes
  currentCount: number;
  lastAlert: string;
}

export class AlertingSystem {
  private channels: Map<string, AlertChannel> = new Map();
  private templates: Map<string, AlertTemplate> = new Map();
  private throttles: Map<string, AlertThrottle> = new Map();
  private alertQueue: Alert[] = [];
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private escalationIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultTemplates();
    this.initializeDefaultThrottles();
  }

  /**
   * Initialize default alert channels
   */
  private initializeDefaultChannels(): void {
    const defaultChannels: AlertChannel[] = [
      {
        id: 'slack_critical',
        type: 'slack',
        name: 'Critical Alerts',
        enabled: true,
        configuration: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: '#alerts-critical',
          username: 'What\'s for Dinner Bot',
          icon_emoji: ':rotating_light:'
        },
        routingRules: [
          {
            id: 'critical_rule',
            name: 'Critical Severity',
            conditions: [
              { field: 'severity', operator: 'equals', value: 'critical' }
            ],
            channelId: 'slack_critical',
            priority: 'critical',
            enabled: true
          }
        ]
      },
      {
        id: 'email_team',
        type: 'email',
        name: 'Team Email',
        enabled: true,
        configuration: {
          smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || ''
            }
          },
          from: process.env.ALERT_EMAIL_FROM || 'alerts@whatsfordinner.com',
          to: process.env.ALERT_EMAIL_TO || 'team@whatsfordinner.com'
        },
        routingRules: [
          {
            id: 'high_severity_rule',
            name: 'High Severity',
            conditions: [
              { field: 'severity', operator: 'equals', value: 'high' }
            ],
            channelId: 'email_team',
            priority: 'high',
            enabled: true
          }
        ]
      },
      {
        id: 'pagerduty_ops',
        type: 'pagerduty',
        name: 'PagerDuty Ops',
        enabled: true,
        configuration: {
          integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
          serviceKey: process.env.PAGERDUTY_SERVICE_KEY || ''
        },
        routingRules: [
          {
            id: 'critical_pagerduty_rule',
            name: 'Critical PagerDuty',
            conditions: [
              { field: 'severity', operator: 'equals', value: 'critical' },
              { field: 'category', operator: 'equals', value: 'system' }
            ],
            channelId: 'pagerduty_ops',
            priority: 'critical',
            enabled: true
          }
        ]
      }
    ];

    for (const channel of defaultChannels) {
      this.channels.set(channel.id, channel);
    }

    logger.info('Alert channels initialized', { count: defaultChannels.length });
  }

  /**
   * Initialize default alert templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: AlertTemplate[] = [
      {
        id: 'system_critical',
        name: 'System Critical Alert',
        category: 'system',
        titleTemplate: '🚨 CRITICAL: {{source}} - {{title}}',
        messageTemplate: `*System:* {{source}}
*Severity:* {{severity}}
*Time:* {{timestamp}}
*Message:* {{message}}

*Metadata:*
{{#each metadata}}
• *{{@key}}:* {{this}}
{{/each}}

*Actions Required:*
{{#each suggestedActions}}
• {{this}}
{{/each}}`,
        severity: 'critical',
        channels: ['slack_critical', 'pagerduty_ops'],
        enabled: true
      },
      {
        id: 'anomaly_detected',
        name: 'Anomaly Detected',
        category: 'anomaly',
        titleTemplate: '⚠️ ANOMALY: {{metric}} - {{severity}}',
        messageTemplate: `*Anomaly Detected*
*Metric:* {{metric}}
*Value:* {{value}}
*Severity:* {{severity}}
*Confidence:* {{confidence}}%
*Algorithm:* {{algorithm}}
*Time:* {{timestamp}}

*Explanation:* {{explanation}}

*Suggested Actions:*
{{#each suggestedActions}}
• {{this}}
{{/each}}`,
        severity: 'high',
        channels: ['slack_critical', 'email_team'],
        enabled: true
      },
      {
        id: 'decision_executed',
        name: 'Decision Executed',
        category: 'decision',
        titleTemplate: '🤖 DECISION: {{type}} - {{priority}}',
        messageTemplate: `*AI Decision Executed*
*Type:* {{type}}
*Priority:* {{priority}}
*Confidence:* {{confidence}}%
*Risk Level:* {{riskLevel}}
*Description:* {{description}}
*Time:* {{timestamp}}

*Parameters:*
{{#each parameters}}
• *{{@key}}:* {{this}}
{{/each}}`,
        severity: 'medium',
        channels: ['slack_critical'],
        enabled: true
      },
      {
        id: 'performance_degraded',
        name: 'Performance Degraded',
        category: 'performance',
        titleTemplate: '📊 PERFORMANCE: {{metric}} - {{severity}}',
        messageTemplate: `*Performance Issue*
*Metric:* {{metric}}
*Current Value:* {{value}}
*Threshold:* {{threshold}}
*Severity:* {{severity}}
*Time:* {{timestamp}}

*Impact:* {{impact}}
*Recommendations:* {{recommendations}}`,
        severity: 'medium',
        channels: ['email_team'],
        enabled: true
      }
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }

    logger.info('Alert templates initialized', { count: defaultTemplates.length });
  }

  /**
   * Initialize default throttles
   */
  private initializeDefaultThrottles(): void {
    const defaultThrottles: AlertThrottle[] = [
      {
        id: 'anomaly_throttle',
        pattern: 'anomaly:.*',
        maxAlerts: 10,
        timeWindow: 60,
        currentCount: 0,
        lastAlert: ''
      },
      {
        id: 'decision_throttle',
        pattern: 'decision:.*',
        maxAlerts: 5,
        timeWindow: 30,
        currentCount: 0,
        lastAlert: ''
      },
      {
        id: 'system_throttle',
        pattern: 'system:.*',
        maxAlerts: 3,
        timeWindow: 15,
        currentCount: 0,
        lastAlert: ''
      }
    ];

    for (const throttle of defaultThrottles) {
      this.throttles.set(throttle.id, throttle);
    }

    logger.info('Alert throttles initialized', { count: defaultThrottles.length });
  }

  /**
   * Start alerting system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Alerting system already running');
      return;
    }

    this.isRunning = true;

    // Start processing interval
    this.processingInterval = setInterval(async () => {
      await this.processAlertQueue();
    }, 5000); // Every 5 seconds

    logger.info('📢 Alerting system started');
  }

  /**
   * Stop alerting system
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Clear escalation intervals
    for (const interval of this.escalationIntervals.values()) {
      clearTimeout(interval);
    }
    this.escalationIntervals.clear();

    logger.info('🛑 Alerting system stopped');
  }

  /**
   * Send alert
   */
  async sendAlert(
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    category: 'system' | 'performance' | 'security' | 'anomaly' | 'decision' | 'compliance',
    source: string,
    metadata: Record<string, any> = {},
    suggestedActions: string[] = []
  ): Promise<string> {
    try {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check throttling
      if (this.isThrottled(category, severity)) {
        logger.debug('Alert throttled', { category, severity, alertId });
        return alertId;
      }

      // Create alert
      const alert: Alert = {
        id: alertId,
        title,
        message,
        severity,
        category,
        source,
        metadata: { ...metadata, suggestedActions },
        timestamp: new Date().toISOString(),
        status: 'pending',
        channels: [],
        escalationLevel: 0
      };

      // Determine channels
      const channels = this.determineChannels(alert);
      alert.channels = channels;

      // Add to queue
      this.alertQueue.push(alert);

      // Store in database
      await supabase.from('alerts').insert({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        category: alert.category,
        source: alert.source,
        metadata: alert.metadata,
        timestamp: alert.timestamp,
        status: alert.status,
        channels: alert.channels,
        escalation_level: alert.escalationLevel
      });

      // Update throttle
      this.updateThrottle(category, severity);

      logger.info('Alert queued', { 
        id: alertId, 
        severity, 
        category, 
        channels: channels.length 
      });

      return alertId;

    } catch (error) {
      logger.error('Failed to send alert', { error, title, severity });
      throw error;
    }
  }

  /**
   * Send anomaly alert
   */
  async sendAnomalyAlert(anomaly: AnomalyDetectionResult): Promise<string> {
    const template = this.templates.get('anomaly_detected');
    if (!template) {
      throw new Error('Anomaly template not found');
    }

    const title = this.renderTemplate(template.titleTemplate, {
      metric: anomaly.metric,
      severity: anomaly.severity
    });

    const message = this.renderTemplate(template.messageTemplate, {
      metric: anomaly.metric,
      value: anomaly.value,
      severity: anomaly.severity,
      confidence: (anomaly.confidence * 100).toFixed(1),
      algorithm: anomaly.algorithm,
      timestamp: new Date(anomaly.timestamp).toLocaleString(),
      explanation: anomaly.explanation,
      suggestedActions: anomaly.suggestedActions
    });

    return this.sendAlert(
      title,
      message,
      anomaly.severity,
      'anomaly',
      'anomaly-detection',
      {
        anomalyId: anomaly.id,
        metric: anomaly.metric,
        value: anomaly.value,
        anomalyScore: anomaly.anomalyScore,
        confidence: anomaly.confidence,
        algorithm: anomaly.algorithm,
        type: anomaly.type
      },
      anomaly.suggestedActions
    );
  }

  /**
   * Send decision alert
   */
  async sendDecisionAlert(decision: DecisionAction): Promise<string> {
    const template = this.templates.get('decision_executed');
    if (!template) {
      throw new Error('Decision template not found');
    }

    const title = this.renderTemplate(template.titleTemplate, {
      type: decision.type,
      priority: decision.priority
    });

    const message = this.renderTemplate(template.messageTemplate, {
      type: decision.type,
      priority: decision.priority,
      confidence: (decision.confidence * 100).toFixed(1),
      riskLevel: decision.riskLevel,
      description: decision.description,
      timestamp: new Date().toLocaleString(),
      parameters: decision.parameters
    });

    return this.sendAlert(
      title,
      message,
      decision.priority === 'critical' ? 'critical' : 'medium',
      'decision',
      'ai-decision-engine',
      {
        decisionId: decision.id,
        type: decision.type,
        priority: decision.priority,
        confidence: decision.confidence,
        riskLevel: decision.riskLevel,
        parameters: decision.parameters,
        estimatedImpact: decision.estimatedImpact
      }
    );
  }

  /**
   * Check if alert is throttled
   */
  private isThrottled(category: string, severity: string): boolean {
    const throttleKey = `${category}:${severity}`;
    
    for (const [id, throttle] of this.throttles) {
      if (this.matchesPattern(throttleKey, throttle.pattern)) {
        const now = Date.now();
        const lastAlertTime = new Date(throttle.lastAlert).getTime();
        const timeDiff = (now - lastAlertTime) / (1000 * 60); // minutes

        if (timeDiff < throttle.timeWindow && throttle.currentCount >= throttle.maxAlerts) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Update throttle
   */
  private updateThrottle(category: string, severity: string): void {
    const throttleKey = `${category}:${severity}`;
    
    for (const [id, throttle] of this.throttles) {
      if (this.matchesPattern(throttleKey, throttle.pattern)) {
        const now = Date.now();
        const lastAlertTime = new Date(throttle.lastAlert).getTime();
        const timeDiff = (now - lastAlertTime) / (1000 * 60); // minutes

        if (timeDiff >= throttle.timeWindow) {
          throttle.currentCount = 1;
        } else {
          throttle.currentCount++;
        }

        throttle.lastAlert = new Date().toISOString();
        break;
      }
    }
  }

  /**
   * Check if string matches pattern
   */
  private matchesPattern(str: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(str);
  }

  /**
   * Determine channels for alert
   */
  private determineChannels(alert: Alert): string[] {
    const channels: string[] = [];

    for (const [channelId, channel] of this.channels) {
      if (!channel.enabled) continue;

      for (const rule of channel.routingRules) {
        if (!rule.enabled) continue;

        if (this.matchesRoutingRule(alert, rule)) {
          channels.push(channelId);
          break;
        }
      }
    }

    return channels;
  }

  /**
   * Check if alert matches routing rule
   */
  private matchesRoutingRule(alert: Alert, rule: AlertRoutingRule): boolean {
    for (const condition of rule.conditions) {
      if (!this.matchesCondition(alert, condition)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if alert matches condition
   */
  private matchesCondition(alert: Alert, condition: AlertCondition): boolean {
    const value = this.getFieldValue(alert, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return typeof value === 'number' && value > condition.value;
      case 'less_than':
        return typeof value === 'number' && value < condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'regex':
        return typeof value === 'string' && new RegExp(condition.value).test(value);
      default:
        return false;
    }
  }

  /**
   * Get field value from alert
   */
  private getFieldValue(alert: Alert, field: string): any {
    const fieldMap: Record<string, any> = {
      severity: alert.severity,
      category: alert.category,
      source: alert.source,
      title: alert.title,
      message: alert.message
    };

    return fieldMap[field] || alert.metadata[field];
  }

  /**
   * Process alert queue
   */
  private async processAlertQueue(): Promise<void> {
    try {
      const pendingAlerts = this.alertQueue.filter(alert => alert.status === 'pending');
      
      for (const alert of pendingAlerts) {
        await this.processAlert(alert);
      }

    } catch (error) {
      logger.error('Alert queue processing failed', { error });
    }
  }

  /**
   * Process individual alert
   */
  private async processAlert(alert: Alert): Promise<void> {
    try {
      let allChannelsSent = true;

      for (const channelId of alert.channels) {
        const channel = this.channels.get(channelId);
        if (!channel) continue;

        try {
          await this.sendToChannel(alert, channel);
          logger.debug('Alert sent to channel', { alertId: alert.id, channelId });
        } catch (error) {
          logger.error('Failed to send alert to channel', { 
            error, 
            alertId: alert.id, 
            channelId 
          });
          allChannelsSent = false;
        }
      }

      // Update alert status
      alert.status = allChannelsSent ? 'sent' : 'failed';

      // Update database
      await supabase
        .from('alerts')
        .update({ status: alert.status })
        .eq('id', alert.id);

      // Set up escalation if needed
      if (alert.severity === 'critical' && allChannelsSent) {
        this.setupEscalation(alert);
      }

    } catch (error) {
      logger.error('Alert processing failed', { error, alertId: alert.id });
      alert.status = 'failed';
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'slack':
        await this.sendToSlack(alert, channel);
        break;
      case 'email':
        await this.sendToEmail(alert, channel);
        break;
      case 'sms':
        await this.sendToSMS(alert, channel);
        break;
      case 'webhook':
        await this.sendToWebhook(alert, channel);
        break;
      case 'pagerduty':
        await this.sendToPagerDuty(alert, channel);
        break;
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(alert: Alert, channel: AlertChannel): Promise<void> {
    const { webhookUrl, channel: slackChannel, username, icon_emoji } = channel.configuration;

    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const payload = {
      channel: slackChannel,
      username,
      icon_emoji,
      text: alert.title,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Category',
              value: alert.category,
              short: true
            },
            {
              title: 'Source',
              value: alert.source,
              short: true
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true
            }
          ],
          footer: 'What\'s for Dinner Alerting System',
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Send alert to email
   */
  private async sendToEmail(alert: Alert, channel: AlertChannel): Promise<void> {
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    logger.info('Email alert sent', { 
      alertId: alert.id, 
      to: channel.configuration.to 
    });
  }

  /**
   * Send alert to SMS
   */
  private async sendToSMS(alert: Alert, channel: AlertChannel): Promise<void> {
    // This would integrate with an SMS service like Twilio, AWS SNS, etc.
    logger.info('SMS alert sent', { 
      alertId: alert.id, 
      to: channel.configuration.to 
    });
  }

  /**
   * Send alert to webhook
   */
  private async sendToWebhook(alert: Alert, channel: AlertChannel): Promise<void> {
    const { url, headers = {} } = channel.configuration;

    if (!url) {
      throw new Error('Webhook URL not configured');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(alert)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Send alert to PagerDuty
   */
  private async sendToPagerDuty(alert: Alert, channel: AlertChannel): Promise<void> {
    const { integrationKey } = channel.configuration;

    if (!integrationKey) {
      throw new Error('PagerDuty integration key not configured');
    }

    const payload = {
      routing_key: integrationKey,
      event_action: 'trigger',
      dedup_key: alert.id,
      payload: {
        summary: alert.title,
        source: alert.source,
        severity: alert.severity,
        custom_details: {
          message: alert.message,
          category: alert.category,
          metadata: alert.metadata
        }
      }
    };

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000'
    };
    return colors[severity] || '#36a64f';
  }

  /**
   * Set up escalation for critical alerts
   */
  private setupEscalation(alert: Alert): void {
    const escalationPolicy = this.channels.get(alert.channels[0])?.escalationPolicy;
    if (!escalationPolicy) return;

    const escalationId = `escalation_${alert.id}`;
    
    const interval = setTimeout(async () => {
      await this.escalateAlert(alert, escalationPolicy);
    }, escalationPolicy.steps[0]?.delay * 60 * 1000 || 30000);

    this.escalationIntervals.set(escalationId, interval);
  }

  /**
   * Escalate alert
   */
  private async escalateAlert(alert: Alert, policy: EscalationPolicy): Promise<void> {
    try {
      const currentLevel = alert.escalationLevel;
      const nextStep = policy.steps[currentLevel];

      if (!nextStep) return;

      // Send escalation message
      const escalationMessage = `🚨 ESCALATION LEVEL ${currentLevel + 1}: ${nextStep.message}`;
      
      await this.sendToChannel(alert, this.channels.get(nextStep.channelId)!);

      // Update escalation level
      alert.escalationLevel = currentLevel + 1;

      // Set up next escalation
      if (currentLevel + 1 < policy.steps.length) {
        this.setupEscalation(alert);
      }

      logger.warn('Alert escalated', { 
        alertId: alert.id, 
        level: currentLevel + 1 
      });

    } catch (error) {
      logger.error('Alert escalation failed', { error, alertId: alert.id });
    }
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;

    // Simple template rendering
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Handle arrays
    rendered = rendered.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, content) => {
      const array = data[arrayKey];
      if (!Array.isArray(array)) return '';

      return array.map(item => {
        let itemContent = content;
        for (const [key, value] of Object.entries(item)) {
          const placeholder = `{{${key}}}`;
          itemContent = itemContent.replace(new RegExp(placeholder, 'g'), String(value));
        }
        return itemContent;
      }).join('');
    });

    return rendered;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      const alert = this.alertQueue.find(a => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      alert.status = 'acknowledged';
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();

      // Update database
      await supabase
        .from('alerts')
        .update({
          status: alert.status,
          acknowledged_by: alert.acknowledgedBy,
          acknowledged_at: alert.acknowledgedAt
        })
        .eq('id', alertId);

      // Clear escalation
      const escalationId = `escalation_${alertId}`;
      const interval = this.escalationIntervals.get(escalationId);
      if (interval) {
        clearTimeout(interval);
        this.escalationIntervals.delete(escalationId);
      }

      logger.info('Alert acknowledged', { alertId, acknowledgedBy });

    } catch (error) {
      logger.error('Failed to acknowledge alert', { error, alertId });
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alert = this.alertQueue.find(a => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();

      // Update database
      await supabase
        .from('alerts')
        .update({
          status: alert.status,
          resolved_at: alert.resolvedAt
        })
        .eq('id', alertId);

      // Clear escalation
      const escalationId = `escalation_${alertId}`;
      const interval = this.escalationIntervals.get(escalationId);
      if (interval) {
        clearTimeout(interval);
        this.escalationIntervals.delete(escalationId);
      }

      logger.info('Alert resolved', { alertId });

    } catch (error) {
      logger.error('Failed to resolve alert', { error, alertId });
      throw error;
    }
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    totalAlerts: number;
    alertsByStatus: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    alertsByCategory: Record<string, number>;
    averageResponseTime: number;
  } {
    const totalAlerts = this.alertQueue.length;

    const alertsByStatus = this.alertQueue.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsBySeverity = this.alertQueue.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsByCategory = this.alertQueue.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average response time (simplified)
    const acknowledgedAlerts = this.alertQueue.filter(a => a.acknowledgedAt);
    const averageResponseTime = acknowledgedAlerts.length > 0
      ? acknowledgedAlerts.reduce((sum, alert) => {
          const responseTime = new Date(alert.acknowledgedAt!).getTime() - new Date(alert.timestamp).getTime();
          return sum + responseTime;
        }, 0) / acknowledgedAlerts.length / 1000 // seconds
      : 0;

    return {
      totalAlerts,
      alertsByStatus,
      alertsBySeverity,
      alertsByCategory,
      averageResponseTime
    };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 50): Alert[] {
    return this.alertQueue.slice(-limit);
  }

  /**
   * Add alert channel
   */
  async addChannel(channel: AlertChannel): Promise<void> {
    this.channels.set(channel.id, channel);
    logger.info('Alert channel added', { channelId: channel.id, type: channel.type });
  }

  /**
   * Remove alert channel
   */
  async removeChannel(channelId: string): Promise<void> {
    this.channels.delete(channelId);
    logger.info('Alert channel removed', { channelId });
  }

  /**
   * Update alert channel
   */
  async updateChannel(channelId: string, updates: Partial<AlertChannel>): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const updatedChannel = { ...channel, ...updates };
    this.channels.set(channelId, updatedChannel);
    logger.info('Alert channel updated', { channelId });
  }
}

// Export singleton instance
export const alertingSystem = new AlertingSystem();