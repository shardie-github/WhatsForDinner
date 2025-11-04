/**
 * Guardian Core Service
 * Monitors all data access and transmission events
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type {
  GuardianEvent,
  PolicyRule,
  RiskLevel,
  ResponseAction,
  DataScope,
  DataClass,
} from './types';

export class GuardianCore {
  private policies: Map<string, PolicyRule> = new Map();
  private ledgerPath: string;
  private isActive: boolean = true;
  private privateModeActive: boolean = false;
  private lockdownActive: boolean = false;

  constructor(ledgerBasePath: string = '/tmp/guardian') {
    this.ledgerPath = path.join(ledgerBasePath, 'logs');
    this.ensureLedgerDirectory();
    this.loadPolicies();
  }

  /**
   * Initialize Guardian system
   */
  async initialize(): Promise<void> {
    console.log('🔒 Guardian system initializing...');
    this.loadPolicies();
    this.isActive = true;
    console.log('✅ Guardian system active');
  }

  /**
   * Load policies from YAML files
   */
  private loadPolicies(): void {
    try {
      const policiesPath = path.join(__dirname, 'policies', 'default.yaml');
      if (fs.existsSync(policiesPath)) {
        const fileContents = fs.readFileSync(policiesPath, 'utf8');
        const config = yaml.load(fileContents) as { policies: PolicyRule[] };
        
        config.policies.forEach((policy) => {
          this.policies.set(policy.id, policy);
        });
        console.log(`📋 Loaded ${this.policies.size} policies`);
      }
    } catch (error) {
      console.error('Failed to load policies:', error);
      // Use default policies if file doesn't exist
      this.policies.set('default', this.getDefaultPolicy());
    }
  }

  /**
   * Default fallback policy
   */
  private getDefaultPolicy(): PolicyRule {
    return {
      id: 'default',
      name: 'Default Policy',
      allowed_scopes: ['app', 'user'],
      data_classes: ['telemetry', 'metadata'],
      risk_weights: { impact: 3, likelihood: 0.4 },
      response_actions: ['allow', 'alert'],
    };
  }

  /**
   * Process a data access event and emit guardian event
   */
  async processEvent(
    event: Omit<GuardianEvent, 'event_id' | 'timestamp' | 'risk_level' | 'action_taken' | 'fingerprint_hash'>
  ): Promise<GuardianEvent> {
    // Check if Guardian is disabled
    if (!this.isActive || this.lockdownActive) {
      return this.createBlockedEvent(event);
    }

    // Private mode: freeze telemetry
    if (this.privateModeActive && event.source === 'telemetry') {
      return this.createBlockedEvent(event, 'Private mode active');
    }

    // Find matching policy
    const policy = this.findMatchingPolicy(event.scope, event.data_class);
    
    // Assess risk
    const riskLevel = this.assessRisk(event, policy);
    
    // Determine response action
    const action = this.determineAction(riskLevel, policy);

    // Create guardian event
    const guardianEvent: GuardianEvent = {
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: event.user_id,
      type: event.type,
      scope: event.scope,
      data_class: event.data_class,
      risk_level: riskLevel,
      source: event.source,
      action_taken: action,
      metadata: event.metadata,
      fingerprint_hash: '', // Will be set after hash calculation
    };

    // Calculate fingerprint hash
    guardianEvent.fingerprint_hash = this.calculateFingerprint(guardianEvent);

    // Apply action
    await this.applyAction(guardianEvent, action);

    // Store in ledger
    await this.appendToLedger(guardianEvent);

    return guardianEvent;
  }

  /**
   * Find matching policy for scope and data class
   */
  private findMatchingPolicy(scope: DataScope, dataClass: DataClass): PolicyRule {
    for (const policy of this.policies.values()) {
      if (
        policy.allowed_scopes.includes(scope) &&
        policy.data_classes.includes(dataClass)
      ) {
        return policy;
      }
    }
    return this.getDefaultPolicy();
  }

  /**
   * Assess risk level based on event and policy
   */
  private assessRisk(
    event: Omit<GuardianEvent, 'event_id' | 'timestamp' | 'risk_level' | 'action_taken' | 'fingerprint_hash'>,
    policy: PolicyRule
  ): RiskLevel {
    const { impact, likelihood } = policy.risk_weights;
    const riskScore = impact * likelihood;

    // Adjust based on sensitive context
    if (this.isSensitiveContext(event.metadata)) {
      riskScore *= 1.5;
    }

    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  /**
   * Determine response action based on risk and policy
   */
  private determineAction(riskLevel: RiskLevel, policy: PolicyRule): ResponseAction {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      if (policy.response_actions.includes('block')) return 'block';
      if (policy.response_actions.includes('alert')) return 'alert';
    }
    
    if (riskLevel === 'medium') {
      if (policy.response_actions.includes('mask')) return 'mask';
      if (policy.response_actions.includes('redact')) return 'redact';
    }

    return policy.response_actions[0] || 'allow';
  }

  /**
   * Check if event is in sensitive context
   */
  private isSensitiveContext(metadata: Record<string, unknown>): boolean {
    const sensors = metadata.sensors as string[] | undefined;
    return sensors?.includes('camera') || sensors?.includes('microphone') || false;
  }

  /**
   * Apply response action
   */
  private async applyAction(event: GuardianEvent, action: ResponseAction): Promise<void> {
    switch (action) {
      case 'block':
        console.log(`🚫 Guardian blocked: ${event.type} (${event.data_class})`);
        break;
      case 'alert':
        console.log(`⚠️ Guardian alert: ${event.type} (${event.risk_level})`);
        break;
      case 'mask':
      case 'redact':
        console.log(`🔒 Guardian ${action}: ${event.type}`);
        break;
      case 'allow':
        // Silent allow
        break;
    }
  }

  /**
   * Calculate fingerprint hash for event
   */
  private calculateFingerprint(event: Omit<GuardianEvent, 'fingerprint_hash'>): string {
    const hashData = {
      event_id: event.event_id,
      timestamp: event.timestamp,
      user_id: event.user_id,
      type: event.type,
      scope: event.scope,
      data_class: event.data_class,
    };
    return crypto.createHash('sha256').update(JSON.stringify(hashData)).digest('hex');
  }

  /**
   * Create blocked event
   */
  private createBlockedEvent(
    event: Omit<GuardianEvent, 'event_id' | 'timestamp' | 'risk_level' | 'action_taken' | 'fingerprint_hash'>,
    reason?: string
  ): GuardianEvent {
    const blockedEvent: GuardianEvent = {
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: event.user_id,
      type: event.type,
      scope: event.scope,
      data_class: event.data_class,
      risk_level: 'high',
      source: event.source,
      action_taken: 'block',
      metadata: { ...event.metadata, reason },
      fingerprint_hash: '',
    };
    blockedEvent.fingerprint_hash = this.calculateFingerprint(blockedEvent);
    return blockedEvent;
  }

  /**
   * Append event to immutable ledger
   */
  private async appendToLedger(event: GuardianEvent): Promise<void> {
    try {
      const ledgerFile = path.join(this.ledgerPath, `${event.user_id}.jsonl`);
      const previousHash = await this.getLastHash(ledgerFile);
      
      const ledgerEntry = {
        event_id: event.event_id,
        ts: event.timestamp,
        type: event.type,
        scope: event.scope,
        guardian_action: event.action_taken,
        sha256: event.fingerprint_hash,
        previous_hash: previousHash,
        metadata: {
          risk_level: event.risk_level,
          data_class: event.data_class,
          source: event.source,
        },
      };

      // Calculate hash chain
      const entryHash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ ...ledgerEntry, previous_hash: previousHash }))
        .digest('hex');
      
      ledgerEntry.sha256 = entryHash;

      // Append to JSONL file
      fs.appendFileSync(ledgerFile, JSON.stringify(ledgerEntry) + '\n');
    } catch (error) {
      console.error('Failed to append to ledger:', error);
    }
  }

  /**
   * Get last hash from ledger file
   */
  private async getLastHash(ledgerFile: string): Promise<string | undefined> {
    try {
      if (!fs.existsSync(ledgerFile)) return undefined;
      
      const lines = fs.readFileSync(ledgerFile, 'utf8').trim().split('\n');
      if (lines.length === 0) return undefined;
      
      const lastEntry = JSON.parse(lines[lines.length - 1]);
      return lastEntry.sha256;
    } catch {
      return undefined;
    }
  }

  /**
   * Ensure ledger directory exists
   */
  private ensureLedgerDirectory(): void {
    if (!fs.existsSync(this.ledgerPath)) {
      fs.mkdirSync(this.ledgerPath, { recursive: true });
    }
  }

  /**
   * Enable private mode (freeze telemetry)
   */
  enablePrivateMode(): void {
    this.privateModeActive = true;
    console.log('🔒 Private Mode activated');
  }

  /**
   * Disable private mode
   */
  disablePrivateMode(): void {
    this.privateModeActive = false;
    console.log('🔓 Private Mode deactivated');
  }

  /**
   * Emergency data lockdown
   */
  async lockdown(): Promise<void> {
    this.lockdownActive = true;
    this.privateModeActive = true;
    console.log('🚨 Emergency Data Lockdown activated');
    
    // Wipe local telemetry cache if exists
    // Pause background sync
  }

  /**
   * Release lockdown
   */
  releaseLockdown(): void {
    this.lockdownActive = false;
    this.privateModeActive = false;
    console.log('✅ Lockdown released');
  }

  /**
   * Get policies
   */
  getPolicies(): PolicyRule[] {
    return Array.from(this.policies.values());
  }

  /**
   * Update policy
   */
  updatePolicy(policyId: string, updates: Partial<PolicyRule>): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      this.policies.set(policyId, { ...policy, ...updates });
    }
  }
}

export const guardianCore = new GuardianCore();
