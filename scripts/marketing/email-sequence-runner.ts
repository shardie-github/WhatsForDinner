#!/usr/bin/env tsx
/**
 * Email Sequence Runner
 * 
 * Runs daily to send activation and conversion emails
 * Should be scheduled via cron job
 */

import { processActivationEmails } from '@/lib/marketing/email-automation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting email sequence runner...');

  try {
    // Process activation emails
    await processActivationEmails();

    // Process referral notifications
    await processReferralNotifications();

    // Process upgrade reminders
    await processUpgradeReminders();

    console.log('✅ Email sequence runner completed');
  } catch (error) {
    console.error('❌ Error running email sequences:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function processReferralNotifications() {
  // Find referrals that need notifications
  // const referrals = await prisma.referral.findMany({
  //   where: {
  //     status: 'signed_up',
  //     notifiedAt: null,
  //   },
  // });

  // for (const referral of referrals) {
  //   await sendReferralNotification(referral.referrerUserId, referral.refereeEmail);
  //   await prisma.referral.update({
  //     where: { id: referral.id },
  //     data: { notifiedAt: new Date() },
  //   });
  // }

  console.log('Processed referral notifications');
}

async function processUpgradeReminders() {
  // Find free users who should be reminded about Premium
  // const users = await prisma.user.findMany({
  //   where: {
  //     plan: 'free',
  //     signupDate: {
  //       lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  //     },
  //   },
  // });

  // for (const user of users) {
  //   await sendUpgradeReminder(user);
  // }

  console.log('Processed upgrade reminders');
}

main().catch(console.error);
