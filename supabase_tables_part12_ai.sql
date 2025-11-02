-- ============================================================================
-- PART 12: AI SYSTEM SCHEMA - Run after Part 11
-- ============================================================================

-- Create AI health metrics table
CREATE TABLE IF NOT EXISTS ai_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deploy_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('staging', 'production', 'preview')),
  metrics JSONB NOT NULL DEFAULT '{}',
  patterns JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI embeddings table
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deploy_id TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI cost analysis table
CREATE TABLE IF NOT EXISTS ai_cost_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics_summary JSONB NOT NULL DEFAULT '{}',
  prediction JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance metrics table
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  operation TEXT NOT NULL CHECK (operation IN ('completion', 'embedding', 'moderation', 'image')),
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  request_id TEXT NOT NULL,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance reports table
CREATE TABLE IF NOT EXISTS ai_performance_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  avg_latency DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  trends JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI integrity reports table
CREATE TABLE IF NOT EXISTS ai_integrity_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_checks INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  checks JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
