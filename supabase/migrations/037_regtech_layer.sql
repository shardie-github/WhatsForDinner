-- ============================================================================
-- REGTECH LAYER MIGRATION
-- ============================================================================
-- Privacy, Compliance, and Regulatory Technology Tables
-- Includes DSAR, Controls Monitoring, Risk Register, Vendor Mgmt, DPIA
-- ============================================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE dsar_request_type AS ENUM ('export', 'erase', 'restrict', 'rectify');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_request_status AS ENUM ('received', 'verifying', 'in_progress', 'complete', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_channel AS ENUM ('portal', 'email', 'api');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_region AS ENUM ('gdpr', 'ccpa', 'cpra', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_artifact_kind AS ENUM ('data_export', 'erasure_log', 'correction_log', 'restriction_token');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lawful_basis AS ENUM ('consent', 'contract', 'legitimate_interest', 'legal_obligation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_category AS ENUM ('security', 'privacy', 'operational', 'vendor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_severity AS ENUM ('low', 'med', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_likelihood AS ENUM ('unlikely', 'possible', 'likely');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'accepted', 'transferred');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_framework AS ENUM ('soc2', 'iso27001', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_frequency AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_kind AS ENUM ('log', 'screenshot', 'report', 'config');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_status AS ENUM ('passing', 'failing', 'waived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_result AS ENUM ('pass', 'fail', 'waive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_category AS ENUM ('hosting', 'analytics', 'ads', 'payments', 'crm', 'devtools');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_risk_level AS ENUM ('low', 'med', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_status AS ENUM ('approved', 'pending', 'denied');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE residual_risk AS ENUM ('low', 'med', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dpia_decision AS ENUM ('proceed', 'revise', 'block');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE regulatory_region AS ENUM ('gdpr', 'ccpa', 'cpra', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- DSAR Requests table
CREATE TABLE IF NOT EXISTS dsar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email varchar(255) NOT NULL,
  type dsar_request_type NOT NULL,
  status dsar_request_status DEFAULT 'received' NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  verified_at timestamptz,
  completed_at timestamptz,
  reason text,
  channel dsar_channel DEFAULT 'portal' NOT NULL,
  region dsar_region DEFAULT 'gdpr' NOT NULL,
  window_deadline timestamptz NOT NULL,
  artifacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_dsar_requests_user_id ON dsar_requests(user_id);
CREATE INDEX idx_dsar_requests_email ON dsar_requests(email);
CREATE INDEX idx_dsar_requests_status ON dsar_requests(status);
CREATE INDEX idx_dsar_requests_region ON dsar_requests(region);
CREATE INDEX idx_dsar_requests_window_deadline ON dsar_requests(window_deadline);

-- DSAR Artifacts table
CREATE TABLE IF NOT EXISTS dsar_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES dsar_requests(id) ON DELETE CASCADE NOT NULL,
  kind dsar_artifact_kind NOT NULL,
  url text NOT NULL,
  checksum text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_dsar_artifacts_request_id ON dsar_artifacts(request_id);
CREATE INDEX idx_dsar_artifacts_kind ON dsar_artifacts(kind);

-- Processing Activities table
CREATE TABLE IF NOT EXISTS processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  purpose text NOT NULL,
  lawful_basis lawful_basis NOT NULL,
  data_categories text[] DEFAULT '{}' NOT NULL,
  recipients text[] DEFAULT '{}' NOT NULL,
  dpa_links text[] DEFAULT '{}' NOT NULL,
  retention_days integer,
  systems text[] DEFAULT '{}' NOT NULL,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_processing_activities_name ON processing_activities(name);
CREATE INDEX idx_processing_activities_lawful_basis ON processing_activities(lawful_basis);

-- Risk Register table
CREATE TABLE IF NOT EXISTS risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category risk_category NOT NULL,
  severity risk_severity NOT NULL,
  likelihood risk_likelihood NOT NULL,
  owner text NOT NULL,
  status risk_status DEFAULT 'open' NOT NULL,
  controls text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_risk_register_category ON risk_register(category);
CREATE INDEX idx_risk_register_severity ON risk_register(severity);
CREATE INDEX idx_risk_register_status ON risk_register(status);
CREATE INDEX idx_risk_register_owner ON risk_register(owner);

-- Controls table
CREATE TABLE IF NOT EXISTS controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  framework control_framework NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  owner text NOT NULL,
  frequency control_frequency DEFAULT 'monthly' NOT NULL,
  evidence_kind evidence_kind DEFAULT 'report' NOT NULL,
  last_checked_at timestamptz,
  status control_status DEFAULT 'failing' NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_controls_key ON controls(key);
CREATE INDEX idx_controls_framework ON controls(framework);
CREATE INDEX idx_controls_status ON controls(status);
CREATE INDEX idx_controls_owner ON controls(owner);

-- Control Evidence table
CREATE TABLE IF NOT EXISTS control_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid REFERENCES controls(id) ON DELETE CASCADE NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  result control_result NOT NULL,
  artifact_url text NOT NULL,
  artifact_checksum text NOT NULL,
  collector text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_control_evidence_control_id ON control_evidence(control_id);
CREATE INDEX idx_control_evidence_result ON control_evidence(result);
CREATE INDEX idx_control_evidence_ts ON control_evidence(ts);
CREATE INDEX idx_control_evidence_collector ON control_evidence(collector);

-- Vendor Catalog table
CREATE TABLE IF NOT EXISTS vendor_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category vendor_category NOT NULL,
  dpa_url text,
  subprocessor boolean DEFAULT false NOT NULL,
  pii_access boolean DEFAULT false NOT NULL,
  risk_level vendor_risk_level DEFAULT 'med' NOT NULL,
  status vendor_status DEFAULT 'pending' NOT NULL,
  owner text NOT NULL,
  review_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_vendor_catalog_name ON vendor_catalog(name);
CREATE INDEX idx_vendor_catalog_category ON vendor_catalog(category);
CREATE INDEX idx_vendor_catalog_status ON vendor_catalog(status);
CREATE INDEX idx_vendor_catalog_risk_level ON vendor_catalog(risk_level);

-- DPIA Records table
CREATE TABLE IF NOT EXISTS dpia_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_activity_id uuid REFERENCES processing_activities(id) ON DELETE SET NULL,
  summary text NOT NULL,
  risks text[] DEFAULT '{}' NOT NULL,
  mitigations text[] DEFAULT '{}' NOT NULL,
  residual_risk residual_risk NOT NULL,
  decision dpia_decision DEFAULT 'proceed' NOT NULL,
  reviewer text NOT NULL,
  reviewed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_dpia_records_processing_activity_id ON dpia_records(processing_activity_id);
CREATE INDEX idx_dpia_records_residual_risk ON dpia_records(residual_risk);
CREATE INDEX idx_dpia_records_decision ON dpia_records(decision);

-- Legal Hold table
CREATE TABLE IF NOT EXISTS legal_hold (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_legal_hold_active ON legal_hold(active);
CREATE INDEX idx_legal_hold_scope ON legal_hold(scope);

-- Regulatory Reports table
CREATE TABLE IF NOT EXISTS regulatory_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  region regulatory_region NOT NULL,
  metrics jsonb NOT NULL,
  generated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_regulatory_reports_region ON regulatory_reports(region);
CREATE INDEX idx_regulatory_reports_period ON regulatory_reports(period_start, period_end);
CREATE INDEX idx_regulatory_reports_generated_at ON regulatory_reports(generated_at);

-- RLS Policies

-- DSAR Requests: Users can read their own requests
ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY dsar_requests_user_select ON dsar_requests
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

CREATE POLICY dsar_requests_user_insert ON dsar_requests
  FOR INSERT
  WITH CHECK (true); -- Anyone can submit DSAR

CREATE POLICY dsar_requests_admin_update ON dsar_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- DSAR Artifacts: Users can read their own artifacts
ALTER TABLE dsar_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY dsar_artifacts_user_select ON dsar_artifacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dsar_requests 
      WHERE dsar_requests.id = dsar_artifacts.request_id 
      AND (dsar_requests.user_id = auth.uid() OR dsar_requests.email = current_setting('request.jwt.claims', true)::json->>'email')
    ) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Control Evidence: Read-only for auditors and admins
ALTER TABLE control_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY control_evidence_read ON control_evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Processing Activities: Read-only for auditors, full access for privacy officer
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY processing_activities_read ON processing_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY processing_activities_modify ON processing_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Risk Register: Read for auditors, modify for privacy officer
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_register_read ON risk_register
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY risk_register_modify ON risk_register
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Controls: Read for auditors, modify for privacy officer
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY controls_read ON controls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY controls_modify ON controls
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Vendor Catalog: Read for auditors, modify for privacy officer
ALTER TABLE vendor_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_catalog_read ON vendor_catalog
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY vendor_catalog_modify ON vendor_catalog
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- DPIA Records: Read for auditors, modify for privacy officer
ALTER TABLE dpia_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY dpia_records_read ON dpia_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY dpia_records_modify ON dpia_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Regulatory Reports: Read for auditors and privacy officer
ALTER TABLE regulatory_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY regulatory_reports_read ON regulatory_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Update admin_users role enum to include privacy_officer and auditor
-- Note: This assumes the enum exists, adjust if needed
DO $$ 
BEGIN
  ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'privacy_officer';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'auditor';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
