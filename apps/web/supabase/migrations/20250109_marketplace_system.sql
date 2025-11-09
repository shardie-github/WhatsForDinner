-- Marketplace Commission System
-- Zero-effort setup - pre-configured

CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  buyer_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  commission DECIMAL(10,2) NOT NULL,
  seller_payout DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES marketplace_transactions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES marketplace_transactions(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_transactions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_transaction ON marketplace_commissions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payouts_seller ON marketplace_payouts(seller_id);

ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON marketplace_transactions
  FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Service can manage transactions" ON marketplace_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage commissions" ON marketplace_commissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own payouts" ON marketplace_payouts
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Service can manage payouts" ON marketplace_payouts
  FOR ALL USING (auth.role() = 'service_role');
