#!/usr/bin/env tsx
/**
 * ETL Script: Pull TikTok Ads Data
 * 
 * Fetches ad spend, clicks, impressions, conversions from TikTok Marketing API
 * and stores in Supabase spend table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_ads_tiktok.ts
 *   tsx scripts/etl/pull_ads_tiktok.ts --cron  # Run in cron mode
 */

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('pull-ads-tiktok-ts');
const { Pool } = pg;

interface TikTokAdData {
  campaign_id: string;
  adset_id: string;
  date: string;
  spend_cents: number;
  clicks: number;
  impressions: number;
  conv: number;
}

async function fetchTikTokAdsData(
  accessToken: string,
  advertiserId: string,
  startDate: string,
  endDate: string
): Promise<TikTokAdData[]> {
  // TikTok Marketing API endpoint
  const url = 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      service_type: 'AUCTION',
      report_type: 'BASIC',
      data_level: 'AUCTION_ADGROUP',
      dimensions: ['stat_time_day', 'campaign_id', 'adgroup_id'],
      metrics: ['spend', 'clicks', 'impressions', 'conversion'],
      start_date: startDate,
      end_date: endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.data || !data.data.list) {
    return [];
  }

  return data.data.list.map((item: any) => ({
    campaign_id: item.dimensions?.campaign_id || '',
    adset_id: item.dimensions?.adgroup_id || '',
    date: item.dimensions?.stat_time_day || '',
    spend_cents: Math.round(parseFloat(item.metrics?.spend || '0') * 100),
    clicks: parseInt(item.metrics?.clicks || '0', 10),
    impressions: parseInt(item.metrics?.impressions || '0', 10),
    conv: parseInt(item.metrics?.conversion || '0', 10),
  }));
}

async function storeSpendData(
  dbUrl: string,
  platform: string,
  data: TikTokAdData[]
): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    for (const row of data) {
      await pool.query(
        `INSERT INTO public.spend (platform, campaign_id, adset_id, date, spend_cents, clicks, impressions, conv)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (platform, campaign_id, adset_id, date) 
         DO UPDATE SET
           spend_cents = EXCLUDED.spend_cents,
           clicks = EXCLUDED.clicks,
           impressions = EXCLUDED.impressions,
           conv = EXCLUDED.conv`,
        [
          platform,
          row.campaign_id,
          row.adset_id,
          row.date,
          row.spend_cents,
          row.clicks,
          row.impressions,
          row.conv,
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const isCron = process.argv.includes('--cron');
  
  const tiktokToken = process.env.TIKTOK_TOKEN || process.env.TIKTOK_ACCESS_TOKEN;
  const tiktokAdvertiserId = process.env.TIKTOK_ADVERTISER_ID;
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!tiktokToken || !tiktokAdvertiserId || !dbUrl) {
    throw new Error('Missing required env vars: TIKTOK_TOKEN, TIKTOK_ADVERTISER_ID, SUPABASE_DB_URL');
  }

  // Default to last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  if (!isCron) {
    logger.info('Fetching TikTok ads data from ${startDateStr} to ${endDateStr}...');
  }

  try {
    const data = await fetchTikTokAdsData(tiktokToken, tiktokAdvertiserId, startDateStr, endDateStr);
    
    if (data.length === 0) {
      if (!isCron) {
        logger.info('No TikTok ads data found for date range.');
      }
      return;
    }

    await storeSpendData(dbUrl, 'tiktok', data);
    
    if (!isCron) {
      logger.info('✅ Stored ${data.length} TikTok ads records');
    }
  } catch (error) {
    logger.error('Error fetching TikTok ads data:', { error });
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error:', { error });
    process.exit(1);
  });
}

export { fetchTikTokAdsData, storeSpendData };
