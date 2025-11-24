-- Marketing and Analytics Schema Migration
-- Adds tables for tracking marketing campaigns, conversions, and user analytics

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'social', 'content', 'paid'
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget DECIMAL(10, 2),
  target_audience JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Sequences
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL, -- 'signup', 'inactivity', 'upgrade_nudge'
  delay_days INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email Sequence Steps
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(sequence_id, step_order)
);

-- Email Sends
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,
  step_id UUID REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  message_id VARCHAR(255),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Conversion Events
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'signup', 'upgrade', 'feature_use'
  properties JSONB,
  source VARCHAR(100), -- 'organic', 'social', 'email', 'paid', 'referral'
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  revenue DECIMAL(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Onboarding Progress
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referee_email VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'signed_up', 'converted', 'rewarded'
  converted_at TIMESTAMP,
  reward_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(code),
  UNIQUE(referee_email, referrer_user_id)
);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL, -- 'credit', 'discount', 'premium_days'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'expired'
  applied_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Health Scores
CREATE TABLE IF NOT EXISTS user_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  status VARCHAR(50) NOT NULL DEFAULT 'healthy', -- 'healthy', 'at-risk', 'churned'
  last_active_date TIMESTAMP,
  days_since_last_active INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  feature_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Interventions
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'email', 'in-app', 'support'
  trigger VARCHAR(100) NOT NULL, -- 'inactivity_7_days', 'low_engagement', 'churn_risk'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'completed', 'dismissed'
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- A/B Test Experiments
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  variants JSONB NOT NULL, -- ['control', 'variant-a', 'variant-b']
  traffic_split JSONB NOT NULL, -- [33, 33, 34]
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- A/B Test Assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(experiment_id, user_id)
);

-- A/B Test Events
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES ab_test_assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'conversion'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sends_user_id ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_name ON conversion_events(event_name);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_user_health_scores_status ON user_health_scores(status);
CREATE INDEX IF NOT EXISTS idx_user_health_scores_last_active_date ON user_health_scores(last_active_date);
CREATE INDEX IF NOT EXISTS idx_interventions_user_id ON interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_experiment_user ON ab_test_assignments(experiment_id, user_id);

-- RLS Policies (if using Supabase)
-- ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_health_scores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
