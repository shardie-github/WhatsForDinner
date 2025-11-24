#!/usr/bin/env tsx
/**
 * KPI Alert Runner
 * 
 * Runs periodically to check KPIs and send alerts
 * Should be scheduled via cron job (every hour)
 */

import { processKPIAlerts } from '@/lib/monitoring/kpi-alerts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting KPI alert runner...');

  try {
    await processKPIAlerts();
    console.log('✅ KPI alert runner completed');
  } catch (error) {
    console.error('❌ Error running KPI alerts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
