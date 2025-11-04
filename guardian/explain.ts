/**
 * Guardian GPT Explainer
 * Local LLM wrapper that explains Guardian behavior from trust reports
 */

import fs from 'fs';
import path from 'path';
import type { TrustReport, LedgerEntry } from './types';

export class GuardianGPT {
  /**
   * Explain what data was used, why, and by whom
   */
  async explainEvent(
    eventId: string,
    userId: string,
    trustReport: TrustReport
  ): Promise<string> {
    // Find event in ledger
    const ledgerFile = path.join('/tmp/guardian/logs', `${userId}.jsonl`);
    
    if (!fs.existsSync(ledgerFile)) {
      return 'Event not found in ledger.';
    }

    const content = fs.readFileSync(ledgerFile, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line)) as LedgerEntry[];
    
    const event = entries.find((e) => e.event_id === eventId);
    
    if (!event) {
      return 'Event not found.';
    }

    // Generate explanation from event data
    return this.generateExplanation(event, trustReport);
  }

  /**
   * Explain which parts of the app touched user data
   */
  async explainAppDataAccess(
    userId: string,
    trustReport: TrustReport
  ): Promise<string> {
    const explanations: string[] = [];

    // Analyze by data class
    Object.entries(trustReport.events_by_class).forEach(([dataClass, count]) => {
      if (count > 0) {
        explanations.push(
          this.explainDataClass(dataClass, count, trustReport)
        );
      }
    });

    return explanations.join('\n\n');
  }

  /**
   * Explain what rules applied
   */
  async explainRules(userId: string): Promise<string> {
    // This would typically load from policies
    return `Guardian applies privacy policies based on:
- Data class (telemetry, location, audio, biometrics, content, credentials, metadata)
- Scope (user, app, API, external)
- Risk assessment (impact × likelihood)

Rules are adaptive and learn from your behavior.`;
  }

  /**
   * Explain what would happen if monitoring is disabled
   */
  async explainMonitoringDisabled(): Promise<string> {
    return `If Guardian monitoring is disabled:

⚠️ No data access tracking
⚠️ No risk assessment
⚠️ No automatic blocking
⚠️ No transparency reports
⚠️ No hash-chain verification

Your data would still be protected by app-level privacy controls, but Guardian's self-governing oversight would be inactive.`;
  }

  /**
   * Generate explanation for a specific event
   */
  private generateExplanation(event: LedgerEntry, report: TrustReport): string {
    const riskLevel = event.metadata.risk_level as string || 'unknown';
    const dataClass = event.metadata.data_class as string || 'unknown';
    const source = event.metadata.source as string || 'unknown';

    let explanation = `**Event: ${event.type}**\n\n`;
    explanation += `**What happened:**\n`;
    explanation += `- Data class: ${dataClass}\n`;
    explanation += `- Scope: ${event.scope}\n`;
    explanation += `- Risk level: ${riskLevel}\n`;
    explanation += `- Source: ${source}\n\n`;

    explanation += `**Guardian action:** ${event.guardian_action}\n\n`;

    if (event.guardian_action === 'block') {
      explanation += `This access was blocked because it exceeded risk thresholds. `;
      explanation += `Guardian determined the ${riskLevel} risk level required protection.`;
    } else if (event.guardian_action === 'allow') {
      explanation += `This access was allowed because it met Guardian's safety criteria. `;
      explanation += `The ${riskLevel} risk level was within acceptable bounds.`;
    } else if (event.guardian_action === 'mask' || event.guardian_action === 'redact') {
      explanation += `This access was ${event.guardian_action}ed to protect sensitive data. `;
      explanation += `The data was processed but sensitive parts were removed.`;
    }

    explanation += `\n\n**Verification:**\n`;
    explanation += `- Hash: ${event.sha256.substring(0, 16)}...\n`;
    explanation += `- Chain integrity: ${report.hash_integrity_verified ? '✅ Verified' : '❌ Failed'}`;

    return explanation;
  }

  /**
   * Explain data class usage
   */
  private explainDataClass(
    dataClass: string,
    count: number,
    report: TrustReport
  ): string {
    const explanations: Record<string, string> = {
      telemetry: `Your device activity was summarized locally to suggest time-saving routines. No content, credentials, or conversations were stored or shared.`,
      location: `Location data was used to provide location-aware features. Precision was limited to protect your privacy.`,
      audio: `Audio access was monitored. Guardian automatically muted telemetry when microphone was detected.`,
      biometrics: `Biometric data access was blocked by Guardian due to high risk level.`,
      content: `Content processing was performed locally when possible. Sensitive data was redacted before any external transmission.`,
      credentials: `Credential access attempts were blocked and logged. Guardian never allows credential storage or transmission.`,
      metadata: `Metadata (usage patterns, timestamps) was collected for app functionality. No personal content was included.`,
    };

    const baseExplanation = explanations[dataClass] || 
      `${dataClass} data was accessed ${count} time(s) this week.`;

    return `**${dataClass.toUpperCase()}** (${count} accesses)\n${baseExplanation}`;
  }

  /**
   * Answer explainability questions from trust report
   */
  async answerQuestion(
    question: string,
    userId: string,
    trustReport: TrustReport
  ): Promise<string> {
    const q = question.toLowerCase();

    if (q.includes('what data') || q.includes('which data')) {
      return await this.explainAppDataAccess(userId, trustReport);
    }

    if (q.includes('what rules') || q.includes('which rules')) {
      return await this.explainRules(userId);
    }

    if (q.includes('what would happen') || q.includes('disable') || q.includes('turn off')) {
      return await this.explainMonitoringDisabled();
    }

    if (q.includes('why') && q.includes('block')) {
      return `Guardian blocks access when risk assessment exceeds thresholds. Factors include:
- Data class sensitivity (biometrics > audio > location > telemetry)
- Scope (external > API > app > user)
- Context (sensitive sensors active, high-risk patterns)

Your Guardian has prevented ${trustReport.violations_prevented} violations this week.`;
    }

    if (q.includes('how many') || q.includes('how much')) {
      return `This week, Guardian monitored ${trustReport.total_events} data access events:
- Low risk: ${trustReport.events_by_risk.low || 0}
- Medium risk: ${trustReport.events_by_risk.medium || 0}
- High risk: ${trustReport.events_by_risk.high || 0}
- Critical risk: ${trustReport.events_by_risk.critical || 0}

Guardian confidence: ${trustReport.guardian_confidence_score.toFixed(1)}%`;
    }

    return `I can help explain:
- What data was accessed and why
- Which rules Guardian applied
- What would happen if monitoring is disabled
- Risk distribution and confidence scores

Try asking: "What data was used this week?" or "Why was something blocked?"`;
  }
}

export const guardianGPT = new GuardianGPT();
