/**
 * Email Automation System
 * 
 * Handles automated email sequences for user activation and conversion
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailUser {
  email: string;
  name: string;
  userId: string;
  signupDate: Date;
  lastActiveDate?: Date;
  plan: 'free' | 'premium' | 'annual';
  activationStep?: number;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Send welcome email immediately after signup
 */
export async function sendWelcomeEmail(user: EmailUser): Promise<void> {
  const template = {
    subject: "Welcome to What's For Dinner! 🍽️",
    html: generateWelcomeEmailHTML(user),
    text: generateWelcomeEmailText(user),
  };

  await resend.emails.send({
    from: 'What\'s For Dinner <welcome@whatsfordinner.app>',
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send activation sequence emails based on user behavior
 */
export async function sendActivationEmail(user: EmailUser, step: number): Promise<void> {
  const templates = getActivationTemplates();
  const template = templates[step];

  if (!template) return;

  await resend.emails.send({
    from: 'What\'s For Dinner <hello@whatsfordinner.app>',
    to: user.email,
    subject: template.subject,
    html: template.html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return getUserValue(user, key) || '';
    }),
    text: template.text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return getUserValue(user, key) || '';
    }),
  });
}

/**
 * Check if user needs activation emails
 */
export function shouldSendActivationEmail(user: EmailUser): {
  shouldSend: boolean;
  step?: number;
} {
  const daysSinceSignup = Math.floor(
    (Date.now() - user.signupDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Step 1: 1 day after signup if no first meal planned
  if (daysSinceSignup >= 1 && !user.lastActiveDate) {
    return { shouldSend: true, step: 1 };
  }

  // Step 2: 3 days after signup if still inactive
  if (daysSinceSignup >= 3 && !user.lastActiveDate) {
    return { shouldSend: true, step: 2 };
  }

  // Step 3: 7 days after signup - feature highlights
  if (daysSinceSignup >= 7) {
    return { shouldSend: true, step: 3 };
  }

  // Step 4: 14 days - upgrade nudge for free users
  if (daysSinceSignup >= 14 && user.plan === 'free') {
    return { shouldSend: true, step: 4 };
  }

  return { shouldSend: false };
}

function generateWelcomeEmailHTML(user: EmailUser): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whatsfordinner.app';
  
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Welcome, ${user.name}! 👋</h2>
  <p>We're thrilled to have you join thousands of families saving time with What's For Dinner.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${appUrl}/onboarding" 
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
      Start Planning Meals →
    </a>
  </div>
  
  <p>Best,<br>The What's For Dinner Team</p>
</body>
</html>
  `;
}

function generateWelcomeEmailText(user: EmailUser): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whatsfordinner.app';
  return `Welcome, ${user.name}!\n\nStart planning: ${appUrl}/onboarding`;
}

function getActivationTemplates(): EmailTemplate[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whatsfordinner.app';
  
  return [
    {
      subject: 'Ready to plan your first meal? 🎯',
      html: `<p>Plan your first meal: <a href="${appUrl}/meal-planner">Get Started</a></p>`,
      text: `Plan your first meal: ${appUrl}/meal-planner`,
    },
    {
      subject: 'Discover these time-saving features ⚡',
      html: `<p>Check out our features: <a href="${appUrl}/features">View Features</a></p>`,
      text: `Check out our features: ${appUrl}/features`,
    },
    {
      subject: 'See how others are saving time 💪',
      html: `<p>Read success stories: <a href="${appUrl}/testimonials">View Stories</a></p>`,
      text: `Read success stories: ${appUrl}/testimonials`,
    },
    {
      subject: 'Unlock unlimited meal suggestions 🚀',
      html: `<p>Upgrade to Premium: <a href="${appUrl}/pricing">View Pricing</a></p>`,
      text: `Upgrade to Premium: ${appUrl}/pricing`,
    },
  ];
}

function getUserValue(user: EmailUser, key: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whatsfordinner.app';
  
  const values: Record<string, string> = {
    name: user.name,
    email: user.email,
    appUrl,
    unsubscribeUrl: `${appUrl}/unsubscribe?token=${user.userId}`,
  };
  
  return values[key] || '';
}

/**
 * Process activation emails for all users
 * Run this daily via cron job
 */
export async function processActivationEmails(): Promise<void> {
  // In production, fetch users from database
  // For now, this is a placeholder
  console.log('Processing activation emails...');
  
  // Example: Get users who need activation emails
  // const users = await prisma.user.findMany({
  //   where: {
  //     plan: 'free',
  //     signupDate: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  //   },
  // });
  
  // for (const user of users) {
  //   const { shouldSend, step } = shouldSendActivationEmail(user);
  //   if (shouldSend && step) {
  //     await sendActivationEmail(user, step);
  //   }
  // }
}
