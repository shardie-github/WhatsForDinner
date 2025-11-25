/**
 * Privacy-related TypeScript types
 */

export interface PrivacyPref {
  user_id: string;
  monitoring_enabled: boolean;
  data_retention_days: number;
  mfa_required: boolean;
  last_reviewed_at: string | null;
  paused_until: string | null;
  kill_switch_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppAllowlist {
  id: string;
  user_id: string;
  app_id: string;
  app_name: string;
  enabled: boolean;
  scope: 'metadata_only' | 'metadata_plus_usage' | 'none';
  created_at: string;
  updated_at: string;
}

export interface SignalToggle {
  id: string;
  user_id: string;
  signal_key: string;
  enabled: boolean;
  sampling_rate: number;
  created_at: string;
  updated_at: string;
}

export interface PrivacyTransparencyLog {
  id: string;
  user_id: string;
  action: string;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  old_value_hash: string | null;
  new_value_hash: string | null;
  metadata: Record<string, unknown> | null;
  ts: string;
  created_at: string;
}

export interface PrivacyData {
  preferences: PrivacyPref | null;
  apps: AppAllowlist[];
  signals: SignalToggle[];
}
