-- Data Insights Monetization System
-- Zero-effort setup - GDPR/CCPA compliant

CREATE TABLE IF NOT EXISTS anonymized_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  anonymized_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_insight_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  data_points JSONB DEFAULT '[]'::jsonb,
  sample_size TEXT,
  update_frequency TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_insight_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id TEXT NOT NULL REFERENCES data_insight_packages(id),
  buyer_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  data_delivered JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Insert pre-configured packages
INSERT INTO data_insight_packages (id, name, description, price, data_points, sample_size, update_frequency) VALUES
  ('user-behavior', 'User Behavior Patterns', 'Aggregated user behavior and engagement patterns', 500.00, 
   '["Login frequency", "Feature usage", "Session duration", "Engagement trends"]'::jsonb, '10,000+ users', 'Monthly'),
  ('market-segmentation', 'Market Segmentation Analysis', 'Demographic and psychographic segmentation data', 1000.00,
   '["Age groups", "Geographic distribution", "Usage patterns", "Feature preferences"]'::jsonb, '50,000+ users', 'Monthly'),
  ('feature-adoption', 'Feature Adoption Trends', 'Which features are most popular and why', 750.00,
   '["Feature usage rates", "Adoption curves", "Churn by feature", "ROI by feature"]'::jsonb, '25,000+ users', 'Weekly'),
  ('predictive-analytics', 'Predictive Analytics Package', 'ML-powered predictions on user behavior and trends', 2000.00,
   '["Churn prediction", "LTV prediction", "Feature demand forecast", "Market trends"]'::jsonb, '100,000+ users', 'Daily')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_anonymized_data_type ON anonymized_data(data_type);
CREATE INDEX IF NOT EXISTS idx_insight_purchases_buyer ON data_insight_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_insight_purchases_status ON data_insight_purchases(status);

ALTER TABLE anonymized_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_insight_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_insight_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active packages" ON data_insight_packages
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service can manage all" ON anonymized_data
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage purchases" ON data_insight_purchases
  FOR ALL USING (auth.role() = 'service_role');
