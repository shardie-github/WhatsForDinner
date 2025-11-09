-- Monetization Settings Table
-- Centralized control for all monetization channels

CREATE TABLE IF NOT EXISTS monetization_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  affiliate_enabled BOOLEAN DEFAULT false,
  affiliate_commission_rate DECIMAL(5,2) DEFAULT 10.00,
  api_monetization_enabled BOOLEAN DEFAULT false,
  data_insights_enabled BOOLEAN DEFAULT false,
  marketplace_enabled BOOLEAN DEFAULT false,
  marketplace_commission_rate DECIMAL(5,2) DEFAULT 10.00,
  automated_upsells_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO monetization_settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- RLS Policy (admin only)
ALTER TABLE monetization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON monetization_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
