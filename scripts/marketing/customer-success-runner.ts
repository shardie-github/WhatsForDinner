#!/usr/bin/env tsx
/**
 * Customer Success Automation Runner
 * 
 * Runs daily to check user health and send interventions
 */

import { processUserHealthChecks } from '@/lib/marketing/customer-success';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting customer success automation...');

  try {
    // Process user health checks
    await processUserHealthChecks();

    // Process upgrade opportunities
    await processUpgradeOpportunities();

    // Process referral follow-ups
    await processReferralFollowUps();

    console.log('✅ Customer success automation completed');
  } catch (error) {
    console.error('❌ Error running customer success automation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function processUpgradeOpportunities() {
  // Find free users who are highly engaged and might upgrade
  // const users = await prisma.user.findMany({
  //   where: {
  //     plan: 'free',
  //     engagementScore: { gte: 70 },
  //     signupDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  //   },
  // });

  // for (const user of users) {
  //   await sendUpgradeOpportunityEmail(user);
  // }

  console.log('Processed upgrade opportunities');
}

async function processReferralFollowUps() {
  // Find referrals that need follow-up
  // const referrals = await prisma.referral.findMany({
  //   where: {
  //     status: 'signed_up',
  //     createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  //   },
  // });

  // for (const referral of referrals) {
  //   await sendReferralFollowUp(referral);
  // }

  console.log('Processed referral follow-ups');
}

main().catch(console.error);
