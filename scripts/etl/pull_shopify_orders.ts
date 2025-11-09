#!/usr/bin/env node
/**
 * ETL Script: Pull Orders from Shopify
 * 
 * Fetches orders from Shopify Admin API and inserts into Supabase orders table.
 * 
 * Usage:
 *   node scripts/etl/pull_shopify_orders.ts [--dry-run] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]
 * 
 * Environment Variables:
 *   SHOPIFY_API_KEY - Shopify API key
 *   SHOPIFY_PASSWORD - Shopify API password
 *   SHOPIFY_STORE - Shopify store name (e.g., 'my-store' for my-store.myshopify.com)
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  name: string;
  financial_status: string;
  fulfillment_status: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_shipping_price_set: {
    shop_money: {
      amount: string;
    };
  };
  total_discounts: string;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku?: string;
  }>;
  shipping_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  refunds?: Array<{
    id: number;
    created_at: string;
    amount: string;
  }>;
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

/**
 * Exponential backoff retry wrapper
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < options.maxRetries) {
        const delay = Math.min(
          options.baseDelay * Math.pow(2, attempt),
          options.maxDelay
        );
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Fetch orders from Shopify Admin API
 */
async function fetchShopifyOrders(
  apiKey: string,
  password: string,
  store: string,
  startDate: string,
  endDate: string
): Promise<ShopifyOrder[]> {
  const baseUrl = `https://${apiKey}:${password}@${store}.myshopify.com/admin/api/2024-01`;
  const url = `${baseUrl}/orders.json`;
  
  console.log(`Fetching Shopify orders from ${startDate} to ${endDate}...`);
  
  const allOrders: ShopifyOrder[] = [];
  let pageInfo: string | null = null;
  let hasNextPage = true;
  
  while (hasNextPage) {
    const params = new URLSearchParams({
      status: 'any',
      created_at_min: `${startDate}T00:00:00-05:00`, // America/Toronto timezone
      created_at_max: `${endDate}T23:59:59-05:00`,
      limit: '250', // Max per page
    });
    
    if (pageInfo) {
      params.append('page_info', pageInfo);
    }
    
    const ordersPage = await withRetry(async () => {
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }
      
      // Extract pagination info from Link header
      const linkHeader = response.headers.get('link');
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>; rel="next"/);
        pageInfo = nextMatch ? nextMatch[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
      
      const data = await response.json();
      return data.orders || [];
    });
    
    allOrders.push(...ordersPage);
    console.log(`Fetched ${ordersPage.length} orders (total: ${allOrders.length})`);
  }
  
  return allOrders;
}

/**
 * Insert orders into Supabase
 */
async function insertOrders(
  supabase: any,
  orders: ShopifyOrder[],
  dryRun: boolean
): Promise<{ inserted: number; updated: number; failed: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  
  for (const order of orders) {
    try {
      // Determine order status
      let status = 'pending';
      if (order.financial_status === 'paid' && !order.cancelled_at) {
        status = 'paid';
      } else if (order.financial_status === 'refunded' || order.refunds?.length) {
        status = 'refunded';
      } else if (order.cancelled_at) {
        status = 'cancelled';
      }
      
      // Calculate refund amount
      const refundAmountCents = order.refunds
        ? Math.round(order.refunds.reduce((sum, refund) => sum + parseFloat(refund.amount), 0) * 100)
        : 0;
      
      const orderRecord = {
        external_id: `shopify_${order.id}`,
        order_number: order.order_number.toString(),
        status,
        total_cents: Math.round(parseFloat(order.total_price) * 100),
        subtotal_cents: Math.round(parseFloat(order.subtotal_price) * 100),
        tax_cents: Math.round(parseFloat(order.total_tax) * 100),
        shipping_cents: Math.round(parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0') * 100),
        discount_cents: Math.round(parseFloat(order.total_discounts) * 100),
        currency: 'USD', // Adjust based on your store currency
        payment_method: order.financial_status,
        items: order.line_items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
          sku: item.sku,
        })),
        customer_email: order.email,
        customer_name: order.name,
        shipping_address: order.shipping_address || {},
        billing_address: order.billing_address || {},
        metadata: {
          financial_status: order.financial_status,
          fulfillment_status: order.fulfillment_status,
        },
        ordered_at: order.created_at,
        paid_at: order.financial_status === 'paid' ? order.created_at : null,
        refunded_at: order.refunds?.[0]?.created_at || null,
        refund_amount_cents: refundAmountCents,
        source: 'shopify',
        etl_pulled_at: new Date().toISOString(),
      };
      
      if (dryRun) {
        console.log(`[DRY RUN] Would insert:`, orderRecord);
        inserted++;
      } else {
        const { error } = await supabase
          .from('orders')
          .upsert(orderRecord, {
            onConflict: 'external_id',
          });
        
        if (error) {
          console.error(`Error inserting order ${order.id}:`, error);
          failed++;
        } else {
          inserted++;
        }
      }
    } catch (error) {
      console.error(`Error processing order ${order.id}:`, error);
      failed++;
    }
  }
  
  return { inserted, updated, failed };
}

/**
 * Log ETL job execution
 */
async function logEtlJob(
  supabase: any,
  jobName: string,
  status: 'started' | 'completed' | 'failed',
  startedAt: Date,
  completedAt: Date | null,
  recordsProcessed: number,
  recordsInserted: number,
  recordsUpdated: number,
  recordsFailed: number,
  errorMessage: string | null,
  dryRun: boolean
) {
  if (dryRun) {
    console.log(`[DRY RUN] Would log ETL job:`, {
      jobName,
      status,
      recordsProcessed,
      recordsInserted,
      recordsUpdated,
      recordsFailed,
    });
    return;
  }
  
  const { error } = await supabase.from('etl_logs').insert({
    job_name: jobName,
    status,
    started_at: startedAt.toISOString(),
    completed_at: completedAt?.toISOString() || null,
    records_processed: recordsProcessed,
    records_inserted: recordsInserted,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    error_message: errorMessage,
    dry_run: dryRun,
  });
  
  if (error) {
    console.error(`Error logging ETL job:`, error);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cronMode = args.includes('--cron');
  
  // Parse date arguments
  const startDateIndex = args.indexOf('--start-date');
  const endDateIndex = args.indexOf('--end-date');
  
  const endDate = endDateIndex >= 0 && args[endDateIndex + 1]
    ? args[endDateIndex + 1]
    : new Date().toISOString().split('T')[0];
  
  const startDate = startDateIndex >= 0 && args[startDateIndex + 1]
    ? args[startDateIndex + 1]
    : cronMode
    ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log('='.repeat(60));
  console.log('Shopify Orders ETL Job');
  console.log('='.repeat(60));
  console.log(`Start Date: ${startDate}`);
  console.log(`End Date: ${endDate}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Cron Mode: ${cronMode}`);
  console.log('='.repeat(60));
  
  const startedAt = new Date();
  
  try {
    // Validate environment variables
    const apiKey = process.env.SHOPIFY_API_KEY;
    const password = process.env.SHOPIFY_PASSWORD;
    const store = process.env.SHOPIFY_STORE;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!apiKey) {
      throw new Error('SHOPIFY_API_KEY environment variable is required');
    }
    if (!password) {
      throw new Error('SHOPIFY_PASSWORD environment variable is required');
    }
    if (!store) {
      throw new Error('SHOPIFY_STORE environment variable is required');
    }
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log job start
    await logEtlJob(
      supabase,
      'pull_shopify_orders',
      'started',
      startedAt,
      null,
      0,
      0,
      0,
      0,
      null,
      dryRun
    );
    
    // Fetch orders from Shopify
    const orders = await fetchShopifyOrders(apiKey, password, store, startDate, endDate);
    console.log(`Fetched ${orders.length} orders from Shopify`);
    
    // Insert into Supabase
    const { inserted, updated, failed } = await insertOrders(
      supabase,
      orders,
      dryRun
    );
    
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    console.log('='.repeat(60));
    console.log('ETL Job Completed');
    console.log(`Duration: ${duration}ms`);
    console.log(`Records Processed: ${orders.length}`);
    console.log(`Records Inserted: ${inserted}`);
    console.log(`Records Updated: ${updated}`);
    console.log(`Records Failed: ${failed}`);
    console.log('='.repeat(60));
    
    // Log job completion
    await logEtlJob(
      supabase,
      'pull_shopify_orders',
      'completed',
      startedAt,
      completedAt,
      orders.length,
      inserted,
      updated,
      failed,
      null,
      dryRun
    );
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('='.repeat(60));
    console.error('ETL Job Failed');
    console.error(`Error: ${errorMessage}`);
    if (errorStack) {
      console.error(`Stack: ${errorStack}`);
    }
    console.error('='.repeat(60));
    
    // Log job failure
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await logEtlJob(
        supabase,
        'pull_shopify_orders',
        'failed',
        startedAt,
        completedAt,
        0,
        0,
        0,
        0,
        errorMessage,
        dryRun
      );
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { fetchShopifyOrders, insertOrders, withRetry };
