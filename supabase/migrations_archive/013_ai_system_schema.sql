-- AI System Schema Migration
-- This migration creates the necessary tables for the AI automation system

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_timestamp ON ai_health_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_deploy_id ON ai_health_metrics(deploy_id);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_environment ON ai_health_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_status ON ai_health_metrics(status);

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_namespace ON ai_embeddings(namespace);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_created_at ON ai_embeddings(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_embedding ON ai_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_ai_insights_deploy_id ON ai_insights(deploy_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_cost_analysis_timestamp ON ai_cost_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_cost_analysis_created_at ON ai_cost_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_model ON ai_performance_metrics(model);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_provider ON ai_performance_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_operation ON ai_performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_user_id ON ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_environment ON ai_performance_metrics(environment);

CREATE INDEX IF NOT EXISTS idx_ai_performance_reports_timestamp ON ai_performance_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_reports_period ON ai_performance_reports(period);

CREATE INDEX IF NOT EXISTS idx_ai_integrity_reports_timestamp ON ai_integrity_reports(timestamp);

-- Enable Row Level Security
ALTER TABLE ai_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_integrity_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for AI health metrics
CREATE POLICY "Allow authenticated users to read ai_health_metrics"
  ON ai_health_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_health_metrics"
  ON ai_health_metrics FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI embeddings
CREATE POLICY "Allow authenticated users to read ai_embeddings"
  ON ai_embeddings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_embeddings"
  ON ai_embeddings FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI insights
CREATE POLICY "Allow authenticated users to read ai_insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_insights"
  ON ai_insights FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI cost analysis
CREATE POLICY "Allow authenticated users to read ai_cost_analysis"
  ON ai_cost_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_cost_analysis"
  ON ai_cost_analysis FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI performance metrics
CREATE POLICY "Allow users to read own ai_performance_metrics"
  ON ai_performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow service role to manage ai_performance_metrics"
  ON ai_performance_metrics FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI performance reports
CREATE POLICY "Allow authenticated users to read ai_performance_reports"
  ON ai_performance_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_performance_reports"
  ON ai_performance_reports FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI integrity reports
CREATE POLICY "Allow authenticated users to read ai_integrity_reports"
  ON ai_integrity_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_integrity_reports"
  ON ai_integrity_reports FOR ALL
  TO service_role
  USING (true);

-- Create function to get foreign keys (for database integrity watcher)
CREATE OR REPLACE FUNCTION get_foreign_keys()
RETURNS TABLE (
  child_table TEXT,
  child_column TEXT,
  parent_table TEXT,
  parent_column TEXT,
  constraint_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.table_name::TEXT as child_table,
    kcu.column_name::TEXT as child_column,
    ccu.table_name::TEXT as parent_table,
    ccu.column_name::TEXT as parent_column,
    tc.constraint_name::TEXT as constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Create function to execute SQL (for database integrity watcher)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TABLE (result JSONB) AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_ai_data()
RETURNS void AS $$
BEGIN
  -- Clean up old health metrics (older than 90 days)
  DELETE FROM ai_health_metrics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old insights (older than 30 days)
  DELETE FROM ai_insights 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old performance metrics (older than 7 days)
  DELETE FROM ai_performance_metrics 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Clean up old cost analysis (older than 90 days)
  DELETE FROM ai_cost_analysis 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old performance reports (older than 30 days)
  DELETE FROM ai_performance_reports 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old integrity reports (older than 30 days)
  DELETE FROM ai_integrity_reports 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up old data (runs daily)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-ai-data', '0 2 * * *', 'SELECT cleanup_ai_data();');

-- Create function to get AI system status
CREATE OR REPLACE FUNCTION get_ai_system_status()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'health_metrics_count', (SELECT COUNT(*) FROM ai_health_metrics),
    'embeddings_count', (SELECT COUNT(*) FROM ai_embeddings),
    'insights_count', (SELECT COUNT(*) FROM ai_insights),
    'performance_metrics_count', (SELECT COUNT(*) FROM ai_performance_metrics),
    'last_health_check', (SELECT MAX(created_at) FROM ai_health_metrics),
    'last_performance_check', (SELECT MAX(created_at) FROM ai_performance_metrics),
    'system_status', 'active'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_health_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_health_metrics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_embeddings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_embeddings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_cost_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_cost_analysis TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_metrics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_reports TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_integrity_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_integrity_reports TO service_role;

GRANT EXECUTE ON FUNCTION get_foreign_keys() TO authenticated;
GRANT EXECUTE ON FUNCTION get_foreign_keys() TO service_role;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION cleanup_ai_data() TO service_role;

GRANT EXECUTE ON FUNCTION get_ai_system_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_system_status() TO service_role;