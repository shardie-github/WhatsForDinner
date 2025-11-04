/**
 * Guardian Inspector Agent
 * Background agent analyzing logs hourly and generating trust reports
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { GuardianEvent, TrustReport, LedgerEntry } from './types';
import { guardianCore } from './core';

export class GuardianInspector {
  private ledgerPath: string;
  private reportsPath: string;
  private intervalHandle?: NodeJS.Timeout;

  constructor(
    ledgerBasePath: string = '/tmp/guardian',
    reportsBasePath: string = '/tmp/guardian/reports'
  ) {
    this.ledgerPath = path.join(ledgerBasePath, 'logs');
    this.reportsPath = reportsBasePath;
    this.ensureReportsDirectory();
  }

  /**
   * Start hourly inspection cycle
   */
  start(hours: number = 1): void {
    const intervalMs = hours * 60 * 60 * 1000;
    
    // Run immediately, then on interval
    this.runInspection();
    
    this.intervalHandle = setInterval(() => {
      this.runInspection();
    }, intervalMs);

    console.log(`🔍 Guardian Inspector started (runs every ${hours} hour(s))`);
  }

  /**
   * Stop inspection cycle
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
  }

  /**
   * Run inspection for all users
   */
  async runInspection(): Promise<void> {
    console.log('🔍 Guardian Inspector running...');
    
    try {
      const ledgerFiles = fs.readdirSync(this.ledgerPath).filter(
        (f) => f.endsWith('.jsonl')
      );

      for (const file of ledgerFiles) {
        const userId = file.replace('.jsonl', '');
        await this.inspectUser(userId);
      }

      console.log('✅ Guardian Inspector completed');
    } catch (error) {
      console.error('❌ Guardian Inspector error:', error);
    }
  }

  /**
   * Inspect user's ledger and generate report
   */
  async inspectUser(userId: string): Promise<TrustReport> {
    const ledgerFile = path.join(this.ledgerPath, `${userId}.jsonl`);
    
    if (!fs.existsSync(ledgerFile)) {
      throw new Error(`Ledger file not found for user ${userId}`);
    }

    // Read ledger entries
    const entries = this.readLedgerEntries(ledgerFile);
    
    // Verify hash chain integrity
    const hashIntegrity = this.verifyHashChain(entries);

    // Calculate statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEntries = entries.filter(
      (e) => new Date(e.ts) >= weekAgo
    );

    const eventsByClass = this.groupByClass(recentEntries);
    const eventsByRisk = this.groupByRisk(recentEntries);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(recentEntries);

    // Detect anomalies
    const anomalies = this.detectAnomalies(recentEntries);

    // Create trust report
    const report: TrustReport = {
      user_id: userId,
      period_start: weekAgo.toISOString(),
      period_end: now.toISOString(),
      total_events: recentEntries.length,
      events_by_class: eventsByClass,
      events_by_risk: eventsByRisk,
      policy_changes: this.countPolicyChanges(recentEntries),
      anomalies_detected: anomalies.length,
      guardian_confidence_score: confidenceScore,
      hash_integrity_verified: hashIntegrity,
      violations_prevented: recentEntries.filter(
        (e) => e.guardian_action === 'block'
      ).length,
      average_detection_latency_ms: this.calculateAverageLatency(recentEntries),
    };

    // Save report
    await this.saveReport(userId, report);

    return report;
  }

  /**
   * Read ledger entries from JSONL file
   */
  private readLedgerEntries(ledgerFile: string): LedgerEntry[] {
    const content = fs.readFileSync(ledgerFile, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    return lines.map((line) => JSON.parse(line) as LedgerEntry);
  }

  /**
   * Verify hash chain integrity
   */
  private verifyHashChain(entries: LedgerEntry[]): boolean {
    if (entries.length === 0) return true;

    let previousHash: string | undefined;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Verify previous hash matches
      if (previousHash && entry.previous_hash !== previousHash) {
        console.error(`Hash chain broken at entry ${i} (${entry.event_id})`);
        return false;
      }

      // Calculate expected hash
      const hashData = {
        event_id: entry.event_id,
        ts: entry.ts,
        type: entry.type,
        scope: entry.scope,
        guardian_action: entry.guardian_action,
        previous_hash: entry.previous_hash,
        metadata: entry.metadata,
      };
      
      const expectedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(hashData))
        .digest('hex');

      if (entry.sha256 !== expectedHash) {
        console.error(`Hash mismatch at entry ${i} (${entry.event_id})`);
        return false;
      }

      previousHash = entry.sha256;
    }

    return true;
  }

  /**
   * Group entries by data class
   */
  private groupByClass(entries: LedgerEntry[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    entries.forEach((entry) => {
      const dataClass = entry.metadata.data_class as string || 'unknown';
      counts[dataClass] = (counts[dataClass] || 0) + 1;
    });

    return counts;
  }

  /**
   * Group entries by risk level
   */
  private groupByRisk(entries: LedgerEntry[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    entries.forEach((entry) => {
      const riskLevel = entry.metadata.risk_level as string || 'unknown';
      counts[riskLevel] = (counts[riskLevel] || 0) + 1;
    });

    return counts;
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidenceScore(entries: LedgerEntry[]): number {
    if (entries.length === 0) return 100;

    const safeOperations = entries.filter(
      (e) => e.guardian_action === 'allow' || e.guardian_action === 'mask'
    ).length;

    const blockedOperations = entries.filter(
      (e) => e.guardian_action === 'block'
    ).length;

    // Base score from safe operations ratio
    const safeRatio = safeOperations / entries.length;
    let score = safeRatio * 100;

    // Deduct for blocked operations (user expectations violated)
    score -= blockedOperations * 2;

    // Deduct for high-risk events
    const highRiskCount = entries.filter(
      (e) => e.metadata.risk_level === 'high' || e.metadata.risk_level === 'critical'
    ).length;
    score -= highRiskCount * 1;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect anomalies in event patterns
   */
  private detectAnomalies(entries: LedgerEntry[]): LedgerEntry[] {
    const anomalies: LedgerEntry[] = [];

    // Detect sudden spike in high-risk events
    const highRiskEntries = entries.filter(
      (e) => e.metadata.risk_level === 'high' || e.metadata.risk_level === 'critical'
    );

    if (highRiskEntries.length > entries.length * 0.3) {
      anomalies.push(...highRiskEntries);
    }

    // Detect unusual time patterns
    const hourlyCounts = new Map<number, number>();
    entries.forEach((entry) => {
      const hour = new Date(entry.ts).getHours();
      hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
    });

    // Find hours with unusually high activity
    const avgPerHour = entries.length / 24;
    hourlyCounts.forEach((count, hour) => {
      if (count > avgPerHour * 3) {
        anomalies.push(
          ...entries.filter(
            (e) => new Date(e.ts).getHours() === hour
          )
        );
      }
    });

    return anomalies;
  }

  /**
   * Count policy changes
   */
  private countPolicyChanges(entries: LedgerEntry[]): number {
    return entries.filter(
      (e) => e.type.includes('policy_change') || e.type.includes('policy_update')
    ).length;
  }

  /**
   * Calculate average detection latency
   */
  private calculateAverageLatency(entries: LedgerEntry[]): number {
    // Placeholder - in real implementation, track event creation vs processing time
    return 50; // ms
  }

  /**
   * Save trust report
   */
  private async saveReport(userId: string, report: TrustReport): Promise<void> {
    const reportFile = path.join(this.reportsPath, `${userId}_trust_report.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  }

  /**
   * Generate weekly markdown report
   */
  async generateWeeklyReport(userId: string): Promise<string> {
    const reportFile = path.join(this.reportsPath, `${userId}_trust_report.json`);
    
    if (!fs.existsSync(reportFile)) {
      throw new Error(`Trust report not found for user ${userId}`);
    }

    const report: TrustReport = JSON.parse(
      fs.readFileSync(reportFile, 'utf8')
    );

    const markdown = `# Guardian Trust Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Events**: ${report.total_events}
- **Confidence Score**: ${report.guardian_confidence_score.toFixed(1)}%
- **Hash Integrity**: ${report.hash_integrity_verified ? '✅ Verified' : '❌ Failed'}
- **Violations Prevented**: ${report.violations_prevented}

## Events by Class
${Object.entries(report.events_by_class)
  .map(([cls, count]) => `- ${cls}: ${count}`)
  .join('\n')}

## Events by Risk
${Object.entries(report.events_by_risk)
  .map(([risk, count]) => `- ${risk}: ${count}`)
  .join('\n')}

## Policy Changes
${report.policy_changes} policy changes detected

## Anomalies
${report.anomalies_detected} anomalies detected

## Performance
- Average Detection Latency: ${report.average_detection_latency_ms}ms
`;

    const mdFile = path.join(this.reportsPath, `${userId}_weekly.md`);
    fs.writeFileSync(mdFile, markdown);

    return markdown;
  }

  /**
   * Ensure reports directory exists
   */
  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsPath)) {
      fs.mkdirSync(this.reportsPath, { recursive: true });
    }
  }
}

export const guardianInspector = new GuardianInspector();
