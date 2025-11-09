-- Affiliate Marketing System
-- Zero-effort setup - run this migration and you're done

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_commissions DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id TEXT,
  product_id TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE
);

-- Affiliate conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Affiliate commissions (for payouts)
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES affiliate_conversions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_clicks_referral ON affiliate_clicks(referral_id);
CREATE INDEX IF NOT EXISTS idx_conversions_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_conversions_order ON affiliate_conversions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON affiliate_commissions(status);

-- RLS Policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own affiliate data
CREATE POLICY "Users can view own affiliate" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own clicks" ON affiliate_clicks
  FOR SELECT USING (affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own conversions" ON affiliate_conversions
  FOR SELECT USING (affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own commissions" ON affiliate_commissions
  FOR SELECT USING (affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid()));

-- Public can track clicks (for conversion tracking)
CREATE POLICY "Public can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Service role can manage all (for automated processes)
CREATE POLICY "Service can manage affiliates" ON affiliates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage clicks" ON affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage conversions" ON affiliate_conversions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage commissions" ON affiliate_commissions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update affiliate stats
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'affiliate_clicks' THEN
    UPDATE affiliates
    SET total_clicks = total_clicks + 1
    WHERE id = NEW.affiliate_id;
  ELSIF TG_TABLE_NAME = 'affiliate_conversions' THEN
    UPDATE affiliates
    SET 
      total_conversions = total_conversions + 1,
      total_commissions = total_commissions + NEW.commission
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_affiliate_clicks_stats
  AFTER INSERT ON affiliate_clicks
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();

CREATE TRIGGER update_affiliate_conversions_stats
  AFTER INSERT ON affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();

-- Function for automatic commission creation
CREATE OR REPLACE FUNCTION create_commission_on_conversion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO affiliate_commissions (affiliate_id, conversion_id, amount, status)
  VALUES (NEW.affiliate_id, NEW.id, NEW.commission, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_commission
  AFTER INSERT ON affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION create_commission_on_conversion();
