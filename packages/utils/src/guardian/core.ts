/**
 * Guardian Core Service
 * Monitors data access, assesses risk, and enforces privacy boundaries
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import type {
  GuardianEvent,
  RiskAssessment,
  PolicyConfig,
  DataScope,
  DataClass,
  RiskLevel,
  ResponseAction,
} from './types';

export class Guardian {
  private policies: PolicyConfig;
  private ledgerPath: string;
  private policyPath: string;

  constructor(userId: string, ledgerDir: string = './guardian/logs') {
    this.ledgerPath = path.join(ledgerDir, `${userId}.jsonl`);
    this.policyPath = path.join(__dirname, 'policies', 'default.yaml');
    this.policies = this.loadPolicies();
    this.ensureLedgerDirectory();
  }

  private loadPolicies(): PolicyConfig {
    try {
      const policyContent = fs.readFileSync(this.policyPath, 'utf-8');
      const parsed = yaml.load(policyContent) as any;
      
      return {
        allowedScopes: parsed.allowed_scopes || ['user', 'app', 'api', 'external'],
        dataClasses: this.normalizeDataClasses(parsed.data_classes),
        riskWeights: parsed.risk_weights || { impact: 0.6, likelihood: 0.4 },
        responseActions: parsed.response_actions || {},
      } as PolicyConfig;
    } catch (error) {
      console.warn('Failed to load policies, using defaults:', error);
      return this.getDefaultPolicies();
    }
  }

  private normalizeDataClasses(classes: any): PolicyConfig['dataClasses'] {
    const normalized: PolicyConfig['dataClasses'] = {} as any;
    
    for (const [key, value] of Object.entries(classes || {})) {
      normalized[key as DataClass] = {
        riskWeight: (value as any).risk_weight || 0.5,
        defaultAction: (value as any).default_action || 'allow',
        requiresConsent: (value as any).requires_consent || false,
      };
    }
    
    return normalized;
  }

  private getDefaultPolicies(): PolicyConfig {
    return {
      allowedScopes: ['user', 'app', 'api', 'external'],
      dataClasses: {
        telemetry: { riskWeight: 0.3, defaultAction: 'allow', requiresConsent: true },
        location: { riskWeight: 0.8, defaultAction: 'mask', requiresConsent: true },
        audio: { riskWeight: 0.9, defaultAction: 'block', requiresConsent: true },
        biometrics: { riskWeight: 0.95, defaultAction: 'block', requiresConsent: true },
        content: { riskWeight: 0.6, defaultAction: 'redact', requiresConsent: false },
        credentials: { riskWeight: 1.0, defaultAction: 'block', requiresConsent: true },
        personal_info: { riskWeight: 0.7, defaultAction: 'mask', requiresConsent: true },
        metadata: { riskWeight: 0.2, defaultAction: 'allow', requiresConsent: false },
      },
      riskWeights: { impact: 0.6, likelihood: 0.4 },
      responseActions: {
        allow: { threshold: 30, description: 'Low risk - allow operation' },
        mask: { threshold: 50, description: 'Medium risk - mask sensitive data' },
        redact: { threshold: 70, description: 'High risk - redact sensitive content' },
        block: { threshold: 85, description: 'Very high risk - block operation' },
        alert: { threshold: 95, description: 'Critical risk - block and alert user' },
      },
    };
  }

  private ensureLedgerDirectory(): void {
    const dir = path.dirname(this.ledgerPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Assess risk for a data access event
   */
  assessRisk(
    scope: DataScope,
    dataClass: DataClass,
    metadata: Record<string, unknown> = {}
  ): RiskAssessment {
    const classConfig = this.policies.dataClasses[dataClass] || {
      riskWeight: 0.5,
      defaultAction: 'allow',
      requiresConsent: false,
    };

    // Calculate risk factors
    const baseRisk = classConfig.riskWeight * 100;
    
    // Scope risk multiplier
    const scopeMultiplier = {
      user: 0.3,
      app: 0.5,
      api: 0.8,
      external: 1.0,
    }[scope] || 1.0;

    // Metadata-based adjustments
    let impact = 1.0;
    let likelihood = 1.0;

    if (metadata.payloadSize) {
      const size = metadata.payloadSize as number;
      impact = Math.min(1.0, size / 100000); // Larger payloads = higher impact
    }

    if (metadata.target) {
      const target = metadata.target as string;
      if (target.includes('external') || target.includes('third-party')) {
        likelihood = 1.0; // External = high likelihood of exposure
      } else if (target === 'local_storage') {
        likelihood = 0.3; // Local = lower likelihood
      }
    }

    const riskScore = Math.min(
      100,
      baseRisk * scopeMultiplier * this.policies.riskWeights.impact * impact +
      baseRisk * scopeMultiplier * this.policies.riskWeights.likelihood * likelihood
    );

    const riskLevel: RiskLevel =
      riskScore >= 85 ? 'high' : riskScore >= 50 ? 'medium' : 'low';

    const guardianAction = this.determineAction(riskScore);

    const explanation = this.generateExplanation(
      scope,
      dataClass,
      riskLevel,
      guardianAction,
      metadata
    );

    return {
      riskScore: Math.round(riskScore),
      riskLevel,
      factors: [
        {
          factor: 'data_class',
          impact: classConfig.riskWeight,
          likelihood: 1.0,
          weight: classConfig.riskWeight,
        },
        {
          factor: 'scope',
          impact: scopeMultiplier,
          likelihood: 1.0,
          weight: scopeMultiplier,
        },
        {
          factor: 'payload_size',
          impact,
          likelihood: 1.0,
          weight: impact,
        },
        {
          factor: 'target',
          impact: 1.0,
          likelihood,
          weight: likelihood,
        },
      ],
      guardianAction,
      explanation,
    };
  }

  private determineAction(riskScore: number): ResponseAction {
    const actions: ResponseAction[] = ['allow', 'mask', 'redact', 'block', 'alert'];
    
    for (const action of actions) {
      const config = this.policies.responseActions[action];
      if (config && riskScore >= config.threshold) {
        continue;
      }
      return action;
    }
    
    return 'alert';
  }

  private generateExplanation(
    scope: DataScope,
    dataClass: DataClass,
    riskLevel: RiskLevel,
    action: ResponseAction,
    metadata: Record<string, unknown>
  ): string {
    const classNames: Record<DataClass, string> = {
      telemetry: 'usage analytics',
      location: 'location data',
      audio: 'audio recordings',
      biometrics: 'biometric data',
      content: 'content',
      credentials: 'credentials',
      personal_info: 'personal information',
      metadata: 'metadata',
    };

    const scopeNames: Record<DataScope, string> = {
      user: 'your device',
      app: 'the app',
      api: 'an API',
      external: 'an external service',
    };

    const actionExplanations: Record<ResponseAction, string> = {
      allow: 'allowed',
      mask: 'masked',
      redact: 'redacted',
      block: 'blocked',
      alert: 'blocked and alerted',
    };

    const className = classNames[dataClass] || dataClass;
    const scopeName = scopeNames[scope] || scope;
    const actionVerb = actionExplanations[action] || action;

    let explanation = `Your ${className} was ${actionVerb} when accessed by ${scopeName}.`;

    if (action === 'allow') {
      explanation += ' No sensitive data left your device.';
    } else if (action === 'mask') {
      explanation += ' Sensitive portions were hidden before processing.';
    } else if (action === 'redact') {
      explanation += ' Sensitive content was removed before transmission.';
    } else if (action === 'block') {
      explanation += ' This operation was prevented to protect your privacy.';
    }

    if (metadata.target) {
      const target = metadata.target as string;
      if (target.includes('analytics') || target.includes('telemetry')) {
        explanation += ' This data is used only for app improvement and never shared.';
      }
    }

    return explanation;
  }

  /**
   * Process a data access event
   */
  async processEvent(
    userId: string,
    scope: DataScope,
    dataClass: DataClass,
    action: string,
    target: string,
    metadata: Record<string, unknown> = {}
  ): Promise<GuardianEvent> {
    const assessment = this.assessRisk(scope, dataClass, metadata);
    
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Get previous hash for chaining
    const previousHash = this.getLastLedgerHash();
    
    const event: GuardianEvent = {
      eventId,
      timestamp,
      userId,
      scope,
      dataClass,
      action,
      target,
      metadata,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      guardianAction: assessment.guardianAction,
      explanation: assessment.explanation,
      fingerprint: '', // Will be calculated after creating event
      previousHash,
    };

    // Calculate fingerprint
    const eventString = JSON.stringify(event);
    event.fingerprint = crypto.createHash('sha256').update(eventString).digest('hex');

    // Append to ledger
    await this.appendToLedger(event);

    return event;
  }

  private getLastLedgerHash(): string | undefined {
    try {
      if (!fs.existsSync(this.ledgerPath)) {
        return undefined;
      }

      const lines = fs.readFileSync(this.ledgerPath, 'utf-8').trim().split('\n');
      if (lines.length === 0) {
        return undefined;
      }

      const lastLine = lines[lines.length - 1];
      const lastEntry = JSON.parse(lastLine);
      return lastEntry.sha256 || lastEntry.fingerprint;
    } catch (error) {
      console.warn('Failed to read last ledger hash:', error);
      return undefined;
    }
  }

  private async appendToLedger(event: GuardianEvent): Promise<void> {
    const ledgerEntry = {
      eventId: event.eventId,
      timestamp: event.timestamp,
      type: 'guardian_event',
      scope: event.scope,
      guardianAction: event.guardianAction,
      sha256: event.fingerprint,
      previousHash: event.previousHash,
      metadata: {
        dataClass: event.dataClass,
        action: event.action,
        target: event.target,
        riskScore: event.riskScore,
        riskLevel: event.riskLevel,
        explanation: event.explanation,
        ...event.metadata,
      },
    };

    const line = JSON.stringify(ledgerEntry) + '\n';
    await fs.promises.appendFile(this.ledgerPath, line, 'utf-8');
  }

  /**
   * Verify ledger integrity
   */
  verifyLedgerIntegrity(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      if (!fs.existsSync(this.ledgerPath)) {
        return { valid: true, errors: [] }; // Empty ledger is valid
      }

      const lines = fs.readFileSync(this.ledgerPath, 'utf-8').trim().split('\n');
      let previousHash: string | undefined;

      for (let i = 0; i < lines.length; i++) {
        const entry = JSON.parse(lines[i]);
        
        // Verify hash chain
        if (previousHash && entry.previousHash !== previousHash) {
          errors.push(`Hash chain broken at line ${i + 1}: expected ${previousHash}, got ${entry.previousHash}`);
        }

        // Verify entry hash
        const entryCopy = { ...entry };
        delete entryCopy.sha256;
        const calculatedHash = crypto.createHash('sha256').update(JSON.stringify(entryCopy)).digest('hex');
        
        if (entry.sha256 !== calculatedHash) {
          errors.push(`Hash mismatch at line ${i + 1}: expected ${calculatedHash}, got ${entry.sha256}`);
        }

        previousHash = entry.sha256;
      }
    } catch (error) {
      errors.push(`Failed to verify ledger: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get policy configuration
   */
  getPolicies(): PolicyConfig {
    return this.policies;
  }

  /**
   * Update policy (creates new ledger entry)
   */
  async updatePolicy(userId: string, updates: Partial<PolicyConfig>): Promise<void> {
    this.policies = { ...this.policies, ...updates };
    
    const policyEntry = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'policy_change',
      scope: 'user' as DataScope,
      guardianAction: 'allow' as ResponseAction,
      sha256: '',
      previousHash: this.getLastLedgerHash(),
      metadata: { updates },
    };

    const eventString = JSON.stringify(policyEntry);
    policyEntry.sha256 = crypto.createHash('sha256').update(eventString).digest('hex');

    const line = JSON.stringify(policyEntry) + '\n';
    await fs.promises.appendFile(this.ledgerPath, line, 'utf-8');
  }
}
