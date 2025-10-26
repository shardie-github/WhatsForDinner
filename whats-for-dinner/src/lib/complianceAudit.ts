import { supabase } from './supabaseClient';

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  risk_score: number;
  compliance_flags: any;
  created_at: string;
}

export interface AnomalyDetection {
  id: string;
  tenant_id: string;
  detection_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  resolved_at?: string;
  auto_resolved: boolean;
  resolution_actions: any[];
  metadata: any;
}

export interface ComplianceReport {
  tenant_id: string;
  report_period: string;
  total_audit_events: number;
  high_risk_events: number;
  anomalies_detected: number;
  compliance_score: number;
  recommendations: string[];
  violations: Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
}

export class ComplianceAudit {
  private static instance: ComplianceAudit;
  private anomalyThresholds: Map<string, number> = new Map();

  static getInstance(): ComplianceAudit {
    if (!ComplianceAudit.instance) {
      ComplianceAudit.instance = new ComplianceAudit();
      ComplianceAudit.instance.initializeThresholds();
    }
    return ComplianceAudit.instance;
  }

  /**
   * Log an audit event
   */
  async logAuditEvent(
    tenantId: string,
    userId: string | undefined,
    actionType: string,
    resourceType: string,
    resourceId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await supabase.rpc('log_compliance_audit', {
        tenant_id_param: tenantId,
        user_id_param: userId,
        action_type_param: actionType,
        resource_type_param: resourceType,
        resource_id_param: resourceId,
        old_values_param: oldValues,
        new_values_param: newValues,
        ip_address_param: ipAddress,
        user_agent_param: userAgent,
      });

      // Trigger anomaly detection
      await this.detectAnomalies(tenantId, actionType, resourceType);
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a tenant
   */
  async getAuditLogs(
    tenantId: string,
    filters: {
      actionType?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
      riskScore?: number;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('compliance_audit_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.riskScore) {
        query = query.gte('risk_score', filters.riskScore);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  /**
   * Detect anomalies for a tenant
   */
  async detectAnomalies(
    tenantId: string,
    actionType?: string,
    resourceType?: string
  ): Promise<void> {
    try {
      // Detect API abuse
      await supabase.rpc('detect_anomalies', {
        tenant_id_param: tenantId,
        detection_type_param: 'api_abuse',
        threshold_multiplier_param: 2.0,
      });

      // Detect billing anomalies
      await this.detectBillingAnomalies(tenantId);

      // Detect data privacy risks
      await this.detectDataPrivacyRisks(tenantId);

      // Detect performance degradation
      await this.detectPerformanceAnomalies(tenantId);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }
  }

  /**
   * Get anomaly detections for a tenant
   */
  async getAnomalies(
    tenantId: string,
    filters: {
      detectionType?: string;
      severity?: string;
      resolved?: boolean;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<AnomalyDetection[]> {
    try {
      let query = supabase
        .from('anomaly_detections')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('detected_at', { ascending: false });

      if (filters.detectionType) {
        query = query.eq('detection_type', filters.detectionType);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.resolved !== undefined) {
        if (filters.resolved) {
          query = query.not('resolved_at', 'is', null);
        } else {
          query = query.is('resolved_at', null);
        }
      }

      if (filters.startDate) {
        query = query.gte('detected_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('detected_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get anomalies: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting anomalies:', error);
      return [];
    }
  }

  /**
   * Resolve an anomaly
   */
  async resolveAnomaly(
    anomalyId: string,
    resolutionActions: any[],
    autoResolved: boolean = false
  ): Promise<void> {
    try {
      await supabase
        .from('anomaly_detections')
        .update({
          resolved_at: new Date().toISOString(),
          resolution_actions: resolutionActions,
          auto_resolved: autoResolved,
        })
        .eq('id', anomalyId);
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    tenantId: string,
    period: string = '30d'
  ): Promise<ComplianceReport> {
    try {
      const periodDays = this.parsePeriod(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get audit events
      const auditLogs = await this.getAuditLogs(tenantId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Get anomalies
      const anomalies = await this.getAnomalies(tenantId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Calculate metrics
      const totalAuditEvents = auditLogs.length;
      const highRiskEvents = auditLogs.filter(
        log => log.risk_score >= 0.7
      ).length;
      const anomaliesDetected = anomalies.length;
      const complianceScore = this.calculateComplianceScore(
        auditLogs,
        anomalies
      );

      // Generate recommendations
      const recommendations = this.generateComplianceRecommendations(
        auditLogs,
        anomalies
      );

      // Identify violations
      const violations = this.identifyViolations(auditLogs, anomalies);

      return {
        tenant_id: tenantId,
        report_period: period,
        total_audit_events: totalAuditEvents,
        high_risk_events: highRiskEvents,
        anomalies_detected: anomaliesDetected,
        compliance_score: complianceScore,
        recommendations,
        violations,
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Get real-time compliance dashboard data
   */
  async getComplianceDashboard(tenantId: string): Promise<any> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get recent audit events
      const recentAudits = await this.getAuditLogs(tenantId, {
        startDate: last24Hours.toISOString(),
      });

      // Get recent anomalies
      const recentAnomalies = await this.getAnomalies(tenantId, {
        startDate: last24Hours.toISOString(),
      });

      // Get audit trends
      const auditTrends = await this.getAuditTrends(tenantId, last7Days, now);

      // Get risk distribution
      const riskDistribution = this.calculateRiskDistribution(recentAudits);

      // Get top actions
      const topActions = this.getTopActions(recentAudits);

      return {
        recent_audits: recentAudits.slice(0, 10),
        recent_anomalies: recentAnomalies.slice(0, 5),
        audit_trends: auditTrends,
        risk_distribution: riskDistribution,
        top_actions: topActions,
        compliance_score: this.calculateComplianceScore(
          recentAudits,
          recentAnomalies
        ),
        last_updated: now.toISOString(),
      };
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      throw error;
    }
  }

  /**
   * Initialize anomaly detection thresholds
   */
  private initializeThresholds(): void {
    this.anomalyThresholds.set('api_abuse', 100); // requests per minute
    this.anomalyThresholds.set('billing_anomaly', 1000); // USD per day
    this.anomalyThresholds.set('data_privacy_risk', 10); // sensitive data access per hour
    this.anomalyThresholds.set('performance_degradation', 5000); // ms response time
  }

  /**
   * Detect billing anomalies
   */
  private async detectBillingAnomalies(tenantId: string): Promise<void> {
    try {
      const { data: billingData } = await supabase
        .from('api_usage_tracking')
        .select('cost_usd, timestamp')
        .eq('tenant_id', tenantId)
        .gte(
          'timestamp',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (!billingData || billingData.length === 0) return;

      const totalCost = billingData.reduce(
        (sum, record) => sum + record.cost_usd,
        0
      );
      const threshold = this.anomalyThresholds.get('billing_anomaly') || 1000;

      if (totalCost > threshold) {
        await supabase.from('anomaly_detections').insert({
          tenant_id: tenantId,
          detection_type: 'billing_anomaly',
          severity: totalCost > threshold * 2 ? 'critical' : 'high',
          description: `Unusual billing spike detected: $${totalCost.toFixed(2)} in 24 hours`,
          metadata: {
            total_cost: totalCost,
            threshold: threshold,
            period: '24h',
          },
        });
      }
    } catch (error) {
      console.error('Error detecting billing anomalies:', error);
    }
  }

  /**
   * Detect data privacy risks
   */
  private async detectDataPrivacyRisks(tenantId: string): Promise<void> {
    try {
      const { data: privacyEvents } = await supabase
        .from('compliance_audit_logs')
        .select('action_type, created_at')
        .eq('tenant_id', tenantId)
        .in('action_type', ['user_deletion', 'data_export', 'data_access'])
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (!privacyEvents) return;

      const threshold = this.anomalyThresholds.get('data_privacy_risk') || 10;

      if (privacyEvents.length > threshold) {
        await supabase.from('anomaly_detections').insert({
          tenant_id: tenantId,
          detection_type: 'data_privacy_risk',
          severity: 'high',
          description: `High frequency of data privacy events: ${privacyEvents.length} in 1 hour`,
          metadata: {
            event_count: privacyEvents.length,
            threshold: threshold,
            period: '1h',
          },
        });
      }
    } catch (error) {
      console.error('Error detecting data privacy risks:', error);
    }
  }

  /**
   * Detect performance anomalies
   */
  private async detectPerformanceAnomalies(tenantId: string): Promise<void> {
    try {
      const { data: performanceData } = await supabase
        .from('api_usage_tracking')
        .select('response_time_ms, timestamp')
        .eq('tenant_id', tenantId)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (!performanceData || performanceData.length === 0) return;

      const avgResponseTime =
        performanceData.reduce(
          (sum, record) => sum + record.response_time_ms,
          0
        ) / performanceData.length;
      const threshold =
        this.anomalyThresholds.get('performance_degradation') || 5000;

      if (avgResponseTime > threshold) {
        await supabase.from('anomaly_detections').insert({
          tenant_id: tenantId,
          detection_type: 'performance_degradation',
          severity: avgResponseTime > threshold * 2 ? 'critical' : 'medium',
          description: `Performance degradation detected: ${avgResponseTime.toFixed(0)}ms average response time`,
          metadata: {
            average_response_time: avgResponseTime,
            threshold: threshold,
            period: '1h',
          },
        });
      }
    } catch (error) {
      console.error('Error detecting performance anomalies:', error);
    }
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    auditLogs: AuditLog[],
    anomalies: AnomalyDetection[]
  ): number {
    let score = 100;

    // Deduct points for high-risk events
    const highRiskEvents = auditLogs.filter(
      log => log.risk_score >= 0.7
    ).length;
    score -= highRiskEvents * 5;

    // Deduct points for unresolved anomalies
    const unresolvedAnomalies = anomalies.filter(
      anomaly => !anomaly.resolved_at
    ).length;
    score -= unresolvedAnomalies * 10;

    // Deduct points for critical anomalies
    const criticalAnomalies = anomalies.filter(
      anomaly => anomaly.severity === 'critical'
    ).length;
    score -= criticalAnomalies * 20;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(
    auditLogs: AuditLog[],
    anomalies: AnomalyDetection[]
  ): string[] {
    const recommendations = [];

    const highRiskEvents = auditLogs.filter(
      log => log.risk_score >= 0.7
    ).length;
    if (highRiskEvents > 10) {
      recommendations.push(
        'Consider implementing additional access controls to reduce high-risk events'
      );
    }

    const unresolvedAnomalies = anomalies.filter(
      anomaly => !anomaly.resolved_at
    ).length;
    if (unresolvedAnomalies > 5) {
      recommendations.push(
        'Address unresolved anomalies to improve compliance posture'
      );
    }

    const criticalAnomalies = anomalies.filter(
      anomaly => anomaly.severity === 'critical'
    ).length;
    if (criticalAnomalies > 0) {
      recommendations.push(
        'Immediately address critical anomalies to prevent compliance violations'
      );
    }

    const dataPrivacyEvents = auditLogs.filter(log =>
      ['user_deletion', 'data_export', 'data_access'].includes(log.action_type)
    ).length;
    if (dataPrivacyEvents > 50) {
      recommendations.push('Review data privacy policies and access controls');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Compliance posture is good. Continue monitoring and regular audits.'
      );
    }

    return recommendations;
  }

  /**
   * Identify compliance violations
   */
  private identifyViolations(
    auditLogs: AuditLog[],
    anomalies: AnomalyDetection[]
  ): Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }> {
    const violations = [];

    // Check for excessive high-risk events
    const highRiskEvents = auditLogs.filter(
      log => log.risk_score >= 0.8
    ).length;
    if (highRiskEvents > 20) {
      violations.push({
        type: 'excessive_high_risk_events',
        severity: 'high',
        description: `${highRiskEvents} high-risk events detected`,
        recommendation: 'Implement stricter access controls and monitoring',
      });
    }

    // Check for unresolved critical anomalies
    const criticalAnomalies = anomalies.filter(
      anomaly => anomaly.severity === 'critical' && !anomaly.resolved_at
    );
    if (criticalAnomalies.length > 0) {
      violations.push({
        type: 'unresolved_critical_anomalies',
        severity: 'critical',
        description: `${criticalAnomalies.length} critical anomalies unresolved`,
        recommendation: 'Immediately address critical anomalies',
      });
    }

    // Check for data privacy violations
    const dataPrivacyEvents = auditLogs.filter(
      log => log.action_type === 'data_export' && log.risk_score >= 0.7
    ).length;
    if (dataPrivacyEvents > 10) {
      violations.push({
        type: 'data_privacy_violations',
        severity: 'high',
        description: `${dataPrivacyEvents} high-risk data privacy events`,
        recommendation: 'Review data export policies and access controls',
      });
    }

    return violations;
  }

  /**
   * Get audit trends
   */
  private async getAuditTrends(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('compliance_audit_logs')
        .select('created_at, risk_score')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (!data) return [];

      // Group by day and calculate daily metrics
      const dailyData = new Map();

      data.forEach(log => {
        const date = log.created_at.split('T')[0];
        if (!dailyData.has(date)) {
          dailyData.set(date, { date, total: 0, highRisk: 0 });
        }

        const dayData = dailyData.get(date);
        dayData.total++;
        if (log.risk_score >= 0.7) {
          dayData.highRisk++;
        }
      });

      return Array.from(dailyData.values());
    } catch (error) {
      console.error('Error getting audit trends:', error);
      return [];
    }
  }

  /**
   * Calculate risk distribution
   */
  private calculateRiskDistribution(auditLogs: AuditLog[]): any {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    auditLogs.forEach(log => {
      if (log.risk_score < 0.3) {
        distribution.low++;
      } else if (log.risk_score < 0.6) {
        distribution.medium++;
      } else if (log.risk_score < 0.8) {
        distribution.high++;
      } else {
        distribution.critical++;
      }
    });

    return distribution;
  }

  /**
   * Get top actions
   */
  private getTopActions(auditLogs: AuditLog[]): any[] {
    const actionCounts = new Map();

    auditLogs.forEach(log => {
      const action = log.action_type;
      actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
    });

    return Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Parse period string to days
   */
  private parsePeriod(period: string): number {
    const periodMap: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    return periodMap[period] || 30;
  }
}

export const complianceAudit = ComplianceAudit.getInstance();
