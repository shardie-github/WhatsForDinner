/**
 * Guardian System Types
 * Self-governing privacy guardian that monitors and explains data access
 */

export type DataScope = 'user' | 'app' | 'api' | 'external';
export type DataClass = 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'metadata';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ResponseAction = 'allow' | 'mask' | 'redact' | 'block' | 'alert';

export interface GuardianEvent {
  event_id: string;
  timestamp: string;
  user_id: string;
  type: string;
  scope: DataScope;
  data_class: DataClass;
  risk_level: RiskLevel;
  source: string; // 'telemetry' | 'api_call' | 'content_processing'
  action_taken: ResponseAction;
  metadata: Record<string, unknown>;
  fingerprint_hash: string; // SHA256 hash of event data
  previous_hash?: string; // For hash chaining
}

export interface PolicyRule {
  id: string;
  name: string;
  allowed_scopes: DataScope[];
  data_classes: DataClass[];
  risk_weights: {
    impact: number; // 1-10
    likelihood: number; // 0-1
  };
  response_actions: ResponseAction[];
  conditions?: Record<string, unknown>;
}

export interface TrustReport {
  user_id: string;
  period_start: string;
  period_end: string;
  total_events: number;
  events_by_class: Record<DataClass, number>;
  events_by_risk: Record<RiskLevel, number>;
  policy_changes: number;
  anomalies_detected: number;
  guardian_confidence_score: number; // 0-100
  hash_integrity_verified: boolean;
  violations_prevented: number;
  average_detection_latency_ms: number;
}

export interface TrustFabricModel {
  user_id: string;
  comfort_zones: {
    privacy_mode_toggles: number; // frequency
    signals_disabled: string[];
    average_trust_responses: Record<DataClass, RiskLevel>;
  };
  adaptive_risk_weights: Record<DataClass, {
    impact: number;
    likelihood: number;
  }>;
  learned_preferences: Record<string, unknown>;
  version: string;
  last_updated: string;
}

export interface LedgerEntry {
  event_id: string;
  ts: string;
  type: string;
  scope: DataScope;
  user_decision?: string;
  guardian_action: ResponseAction;
  sha256: string;
  previous_hash?: string;
  metadata: Record<string, unknown>;
}

export interface GuardianRecommendation {
  id: string;
  type: 'tighter' | 'looser' | 'policy_update';
  data_class: DataClass;
  reason: string;
  impact: string;
  suggested_action: ResponseAction;
  confidence: number; // 0-1
}

export interface SensitiveContext {
  active: boolean;
  detected_sensors: string[]; // 'camera' | 'microphone' | 'location' | 'biometrics'
  auto_muted: boolean;
  detected_at: string;
}
