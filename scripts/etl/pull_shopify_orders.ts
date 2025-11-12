#!/usr/bin/env tsx
/**
 * ETL Script: Pull Shopify Orders
 * 
 * Fetches orders from Shopify Admin API and stores in Supabase orders table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_shopify_orders.ts
 *   tsx scripts/etl/pull_shopify_orders.ts --cron  # Run in cron mode
 */

import pg from 'pg';

const { Pool } = pg;

interface ShopifyOrder {
  id: string;
  order_number: string;
  created_at: string;
  email: string;
  total_price: string;
  subtotal_price: string;
  total_shipping_price_set: { shop_money: { amount: string } };
  total_tax_set: { shop_money: { amount: string } };
  total_discounts_set: { shop_money: { amount: string } };
  currency: string;
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  source_name?: string;
}

async function fetchShopifyOrders(
  shopifyApiKey: string,
  shopifyPassword: string,
  shopifyStore: string,
  createdAtMin: string
): Promise<ShopifyOrder[]> {
  const auth = Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString('base64');
  const url = `https://${shopifyStore}.myshopify.com/admin/api/2024-01/orders.json`;
  
  const params = new URLSearchParams({
    created_at_min: createdAtMin,
    limit: '250',
    status: 'any',
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.orders || [];
}

async function storeOrders(dbUrl: string, orders: ShopifyOrder[]): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    for (const order of orders) {
      // Look up user_id by email (if users table exists)
      let userId: string | null = null;
      try {
        const userRes = await pool.query(
          'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
          [order.email]
        );
        if (userRes.rows.length > 0) {
          userId = userRes.rows[0].id;
        }
      } catch {
        // Users table might not exist or email might not match
      }

      const items = order.line_items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price_cents: Math.round(parseFloat(item.price) * 100),
      }));

      const subtotalCents = Math.round(parseFloat(order.subtotal_price) * 100);
      const shippingCents = Math.round(
        parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0') * 100
      );
      const taxCents = Math.round(
        parseFloat(order.total_tax_set?.shop_money?.amount || '0') * 100
      );
      const discountCents = Math.round(
        parseFloat(order.total_discounts_set?.shop_money?.amount || '0') * 100
      );
      const totalCents = Math.round(parseFloat(order.total_price) * 100);

      await pool.query(
        `INSERT INTO public.orders (
          id, order_number, placed_at, user_id, items, subtotal_cents, 
          shipping_cents, tax_cents, discount_cents, total_cents, currency, source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (order_number) 
        DO UPDATE SET
          items = EXCLUDED.items,
          subtotal_cents = EXCLUDED.subtotal_cents,
          shipping_cents = EXCLUDED.shipping_cents,
          tax_cents = EXCLUDED.tax_cents,
          discount_cents = EXCLUDED.discount_cents,
          total_cents = EXCLUDED.total_cents`,
        [
          order.id,
          order.order_number,
          order.created_at,
          userId,
          JSON.stringify(items),
          subtotalCents,
          shippingCents,
          taxCents,
          discountCents,
          totalCents,
          order.currency,
          order.source_name || 'shopify',
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const isCron = process.argv.includes('--cron');
  
  const shopifyApiKey = process.env.SHOPIFY_API_KEY;
  const shopifyPassword = process.env.SHOPIFY_PASSWORD;
  const shopifyStore = process.env.SHOPIFY_STORE;
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!shopifyApiKey || !shopifyPassword || !shopifyStore || !dbUrl) {
    throw new Error(
      'Missing required env vars: SHOPIFY_API_KEY, SHOPIFY_PASSWORD, SHOPIFY_STORE, SUPABASE_DB_URL'
    );
  }

  // Default to last 7 days
  const createdAtMin = new Date();
  createdAtMin.setDate(createdAtMin.getDate() - 7);
  const createdAtMinStr = createdAtMin.toISOString();

  if (!isCron) {
    console.log(`Fetching Shopify orders since ${createdAtMinStr}...`);
  }

  try {
    const orders = await fetchShopifyOrders(
      shopifyApiKey,
      shopifyPassword,
      shopifyStore,
      createdAtMinStr
    );

    if (orders.length === 0) {
      if (!isCron) {
        console.log('No Shopify orders found for date range.');
      }
      return;
    }

    await storeOrders(dbUrl, orders);

    if (!isCron) {
      console.log(`✅ Stored ${orders.length} Shopify orders`);
    }
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { fetchShopifyOrders, storeOrders };
