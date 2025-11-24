/**
 * Referral Automation System
 * 
 * Handles referral program automation and rewards
 */

interface Referral {
  referrerId: string;
  refereeId?: string;
  refereeEmail: string;
  code: string;
  status: 'pending' | 'signed_up' | 'converted' | 'rewarded';
  createdAt: Date;
  convertedAt?: Date;
}

interface ReferralReward {
  referrerId: string;
  rewardType: 'credit' | 'discount' | 'premium_days';
  amount: number;
  status: 'pending' | 'paid' | 'expired';
}

/**
 * Generate referral code for user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  // In production, generate unique code and store in database
  const code = `REF-${userId.substring(0, 8).toUpperCase()}`;
  
  // await prisma.referralCode.create({
  //   data: {
  //     code,
  //     ownerUserId: userId,
  //     programId: 'default',
  //   },
  // });

  return code;
}

/**
 * Process referral signup
 */
export async function processReferralSignup(
  code: string,
  refereeEmail: string,
  refereeId?: string
): Promise<void> {
  // In production, find referrer and create referral record
  // const referrer = await prisma.referralCode.findUnique({
  //   where: { code },
  //   include: { owner: true },
  // });

  // if (referrer) {
  //   await prisma.referral.create({
  //     data: {
  //       codeId: referrer.id,
  //       referrerUserId: referrer.ownerUserId,
  //       refereeEmail,
  //       refereeUserId: refereeId,
  //       status: refereeId ? 'signed_up' : 'pending',
  //     },
  //   });

  //   // Send notification to referrer
  //   await sendReferralNotification(referrer.ownerUserId, refereeEmail);
  // }

  console.log(`Referral signup: ${code} -> ${refereeEmail}`);
}

/**
 * Process referral conversion (referee upgrades)
 */
export async function processReferralConversion(refereeId: string): Promise<void> {
  // In production, find referral and mark as converted
  // const referral = await prisma.referral.findFirst({
  //   where: { refereeUserId: refereeId },
  // });

  // if (referral && referral.status !== 'converted') {
  //   await prisma.referral.update({
  //     where: { id: referral.id },
  //     data: {
  //       status: 'converted',
  //       convertedAt: new Date(),
  //     },
  //   });

  //   // Award referrer
  //   await awardReferrer(referral.referrerUserId);
  // }

  console.log(`Referral conversion: ${refereeId}`);
}

/**
 * Award referrer for successful referral
 */
async function awardReferrer(referrerId: string): Promise<void> {
  // In production, create reward record
  // const reward: ReferralReward = {
  //   referrerId,
  //   rewardType: 'premium_days',
  //   amount: 30, // 30 days free Premium
  //   status: 'pending',
  // };

  // await prisma.referralReward.create({ data: reward });

  // // Apply reward
  // await applyReferralReward(referrerId, reward);

  // // Send notification
  // await sendRewardNotification(referrerId, reward);

  console.log(`Awarded referrer: ${referrerId}`);
}

/**
 * Send referral notification email
 */
async function sendReferralNotification(referrerId: string, refereeEmail: string): Promise<void> {
  // In production, send email notification
  console.log(`Referral notification: ${referrerId} -> ${refereeEmail}`);
}

/**
 * Get referral stats for user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  conversions: number;
  conversionRate: number;
  rewardsEarned: number;
  code: string;
}> {
  // In production, fetch from database
  return {
    totalReferrals: 0,
    conversions: 0,
    conversionRate: 0,
    rewardsEarned: 0,
    code: await generateReferralCode(userId),
  };
}

/**
 * Send referral invitation email
 */
export async function sendReferralInvitation(
  referrerId: string,
  emails: string[]
): Promise<void> {
  const code = await generateReferralCode(referrerId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whatsfordinner.app';

  // In production, send emails via Resend
  // for (const email of emails) {
  //   await resend.emails.send({
  //     from: 'What\'s For Dinner <referrals@whatsfordinner.app>',
  //     to: email,
  //     subject: 'Join me on What\'s For Dinner!',
  //     html: generateReferralEmailHTML(code, appUrl),
  //   });
  // }

  console.log(`Referral invitations sent: ${emails.length}`);
}

function generateReferralEmailHTML(code: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Join me on What's For Dinner! 🍽️</h2>
  
  <p>I've been using What's For Dinner to plan meals and save time, and I think you'd love it too!</p>
  
  <p><strong>Use my referral code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${code}</code></p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${appUrl}/signup?ref=${code}" 
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
      Sign Up Free →
    </a>
  </div>
  
  <p>When you sign up, we both get rewards! 🎁</p>
  
  <p>Best,<br>Your Friend</p>
</body>
</html>
  `;
}
