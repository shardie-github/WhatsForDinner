/**
 * KPI Alert System
 * 
 * Monitors KPIs and sends alerts when thresholds are breached
 */

import { KPI, getKPIsNeedingAttention } from './kpi-tracker';
import { sendEmail, EMAIL_CONFIG } from '@/lib/marketing/resend-config';

interface KPIAlert {
  kpi: KPI;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendedActions: string[];
}

/**
 * Check KPIs and generate alerts
 */
export async function checkKPIAlerts(): Promise<KPIAlert[]> {
  const kpisNeedingAttention = await getKPIsNeedingAttention();
  const alerts: KPIAlert[] = [];

  for (const kpi of kpisNeedingAttention) {
    const alert = generateAlert(kpi);
    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Generate alert for KPI
 */
function generateAlert(kpi: KPI): KPIAlert | null {
  const percentage = (kpi.currentValue / kpi.targetValue) * 100;
  const gap = kpi.targetValue - kpi.currentValue;

  if (kpi.status === 'critical') {
    return {
      kpi,
      severity: 'critical',
      message: `${kpi.name} is at ${kpi.currentValue}${kpi.unit}, ${percentage.toFixed(1)}% of target (${kpi.targetValue}${kpi.unit}). Gap: ${gap}${kpi.unit}`,
      recommendedActions: getRecommendedActions(kpi, 'critical'),
    };
  }

  if (kpi.status === 'at-risk') {
    return {
      kpi,
      severity: 'warning',
      message: `${kpi.name} is at ${kpi.currentValue}${kpi.unit}, ${percentage.toFixed(1)}% of target (${kpi.targetValue}${kpi.unit}). Gap: ${gap}${kpi.unit}`,
      recommendedActions: getRecommendedActions(kpi, 'warning'),
    };
  }

  return null;
}

/**
 * Get recommended actions for KPI
 */
function getRecommendedActions(
  kpi: KPI,
  severity: 'critical' | 'warning'
): string[] {
  const actions: string[] = [];

  switch (kpi.id) {
    case 'mrr':
      actions.push('Run upgrade campaign for free users');
      actions.push('Optimize pricing page conversion');
      actions.push('Launch referral program');
      actions.push('A/B test upgrade flow');
      break;

    case 'new_signups':
      actions.push('Increase marketing spend');
      actions.push('Launch content marketing campaign');
      actions.push('Optimize landing page conversion');
      actions.push('Run social media ads');
      break;

    case 'activation_rate':
      actions.push('Improve onboarding flow');
      actions.push('Send activation email sequence');
      actions.push('Add in-app onboarding tips');
      actions.push('Reduce friction in first meal planning');
      break;

    case 'day1_retention':
      actions.push('Send welcome email immediately');
      actions.push('Show value in first session');
      actions.push('Reduce onboarding steps');
      actions.push('Add quick wins');
      break;

    case 'churn_rate':
      actions.push('Identify at-risk users');
      actions.push('Send re-engagement campaigns');
      actions.push('Offer special discounts');
      actions.push('Gather feedback from churned users');
      break;

    case 'conversion_rate':
      actions.push('A/B test pricing page');
      actions.push('Add social proof');
      actions.push('Offer free trial');
      actions.push('Show value proposition clearly');
      break;

    case 'response_time':
      actions.push('Increase support team capacity');
      actions.push('Implement chatbot for common questions');
      actions.push('Create self-service help center');
      actions.push('Prioritize urgent tickets');
      break;

    case 'error_rate':
      actions.push('Review error logs');
      actions.push('Fix critical bugs');
      actions.push('Improve error handling');
      actions.push('Add monitoring alerts');
      break;

    default:
      actions.push('Review KPI data');
      actions.push('Identify root cause');
      actions.push('Implement improvement plan');
  }

  return actions;
}

/**
 * Send KPI alert email
 */
export async function sendKPIAlert(alert: KPIAlert): Promise<void> {
  const recipients = process.env.KPI_ALERT_EMAILS?.split(',') || [];

  if (recipients.length === 0) {
    console.warn('No KPI alert recipients configured');
    return;
  }

  const severityEmoji = {
    critical: '🔴',
    warning: '🟡',
    info: '🔵',
  };

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'};">
    ${severityEmoji[alert.severity]} KPI Alert: ${alert.kpi.name}
  </h2>
  
  <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p><strong>Status:</strong> ${alert.kpi.status}</p>
    <p><strong>Current Value:</strong> ${alert.kpi.currentValue}${alert.kpi.unit}</p>
    <p><strong>Target Value:</strong> ${alert.kpi.targetValue}${alert.kpi.unit}</p>
    <p><strong>Category:</strong> ${alert.kpi.category}</p>
  </div>

  <p><strong>Message:</strong></p>
  <p>${alert.message}</p>

  <h3>Recommended Actions:</h3>
  <ul>
    ${alert.recommendedActions.map((action) => `<li>${action}</li>`).join('')}
  </ul>

  <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
    This is an automated alert from the KPI monitoring system.
  </p>
</body>
</html>
  `;

  await sendEmail({
    to: recipients,
    from: EMAIL_CONFIG.from.noreply,
    subject: `[${alert.severity.toUpperCase()}] KPI Alert: ${alert.kpi.name}`,
    html,
  });
}

/**
 * Process all KPI alerts
 */
export async function processKPIAlerts(): Promise<void> {
  const alerts = await checkKPIAlerts();

  for (const alert of alerts) {
    if (alert.severity === 'critical') {
      await sendKPIAlert(alert);
    }
  }

  console.log(`Processed ${alerts.length} KPI alerts`);
}
