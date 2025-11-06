-- ============================================================================
-- BILLING, INVOICES, AND REFUNDS SCHEMA
-- ============================================================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(10,2) not null,
  tax_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  pdf_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  amount numeric(10,2) not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'processed', 'failed', 'cancelled')),
  stripe_refund_id text,
  processed_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tax calculations table (for multi-region support)
CREATE TABLE IF NOT EXISTS tax_calculations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  country text not null,
  region text,
  tax_rate numeric(5,2) not null,
  tax_amount numeric(10,2) not null,
  tax_type text not null check (tax_type in ('vat', 'sales_tax', 'gst', 'other')),
  created_at timestamptz default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_subscription ON refunds(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_tax_calculations_invoice ON tax_calculations(invoice_id);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_month text;
  last_number int;
  new_number text;
BEGIN
  year_month := to_char(now(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO last_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(last_number::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create invoice from subscription
CREATE OR REPLACE FUNCTION create_invoice_from_subscription(
  p_subscription_id uuid,
  p_amount numeric,
  p_tax_amount numeric DEFAULT 0
)
RETURNS uuid AS $$
DECLARE
  v_invoice_id uuid;
  v_invoice_number text;
  v_user_id uuid;
  v_total numeric;
BEGIN
  -- Get subscription details
  SELECT user_id INTO v_user_id
  FROM subscriptions
  WHERE id = p_subscription_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Generate invoice number
  v_invoice_number := generate_invoice_number();
  v_total := p_amount + p_tax_amount;
  
  -- Create invoice
  INSERT INTO invoices (
    user_id,
    subscription_id,
    invoice_number,
    amount,
    tax_amount,
    total_amount,
    status,
    due_date
  )
  VALUES (
    v_user_id,
    p_subscription_id,
    v_invoice_number,
    p_amount,
    p_tax_amount,
    v_total,
    'sent',
    now() + INTERVAL '30 days'
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own refunds
CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  USING (auth.uid() = user_id);

-- Users can request refunds
CREATE POLICY "Users can create refund requests"
  ON refunds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can manage all
CREATE POLICY "Admin can manage all billing"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all refunds"
  ON refunds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
