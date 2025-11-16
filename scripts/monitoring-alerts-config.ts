#!/usr/bin/env tsx
import { secretsManager } from './secrets-manager-unified.mjs';
/**
 * Monitoring Alerts Configuration
 * 
 * For demo purposes, this sets up placeholder alert configurations
 * that can be used with Slack, PagerDuty, or other alerting services.
 * 
 * In production, configure actual webhooks and alert channels.
 */

interface AlertConfig {
  name: string;
  severity: 'critical' | 'warning' | 'info';
  condition: string;
  channels: string[];
  enabled: boolean;
}

interface MonitoringConfig {
  services: {
    slack?: {
      webhook_url?: string;
      channel: string;
      enabled: boolean;
    };
    pagerduty?: {
      integration_key?: string;
      enabled: boolean;
    };
    email?: {
      recipients: string[];
      enabled: boolean;
    };
  };
  alerts: AlertConfig[];
}

// Default configuration (for demo purposes)
const DEFAULT_CONFIG: MonitoringConfig = {
  services: {
    slack: {
      webhook_url: (await secretsManager.getSecret('SLACK_WEBHOOK_URL')) || process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/PLACEHOLDER',
      channel: '#alerts',
      enabled: !!(await secretsManager.getSecret('SLACK_WEBHOOK_URL')) || process.env.SLACK_WEBHOOK_URL,
    },
    pagerduty: {
      integration_key: (await secretsManager.getSecret('PAGERDUTY_INTEGRATION_KEY')) || process.env.PAGERDUTY_INTEGRATION_KEY || 'placeholder-key',
      enabled: !!(await secretsManager.getSecret('PAGERDUTY_INTEGRATION_KEY')) || process.env.PAGERDUTY_INTEGRATION_KEY,
    },
    email: {
      recipients: ['devops@whats-for-dinner.com'],
      enabled: true,
    },
  },
  alerts: [
    {
      name: 'High Error Rate',
      severity: 'critical',
      condition: 'error_rate > 1%',
      channels: ['slack', 'pagerduty'],
      enabled: true,
    },
    {
      name: 'API Latency High',
      severity: 'warning',
      condition: 'p95_latency > 500ms',
      channels: ['slack'],
      enabled: true,
    },
    {
      name: 'Database Connection Pool Exhausted',
      severity: 'critical',
      condition: 'db_pool_usage > 90%',
      channels: ['slack', 'pagerduty'],
      enabled: true,
    },
    {
      name: 'Low Uptime',
      severity: 'warning',
      condition: 'uptime < 99.9%',
      channels: ['slack', 'email'],
      enabled: true,
    },
    {
      name: 'High Memory Usage',
      severity: 'warning',
      condition: 'memory_usage > 85%',
      channels: ['slack'],
      enabled: true,
    },
    {
      name: 'Disk Space Low',
      severity: 'warning',
      condition: 'disk_usage > 90%',
      channels: ['slack', 'email'],
      enabled: true,
    },
    {
      name: 'Failed Health Checks',
      severity: 'critical',
      condition: 'health_check_failures > 3',
      channels: ['slack', 'pagerduty'],
      enabled: true,
    },
  ],
};

// Send alert to configured channels
async function sendAlert(alert: AlertConfig, message: string, details?: Record<string, any>): Promise<void> {
  if (!alert.enabled) {
    return;
  }

  const alertMessage = {
    title: `?? ${alert.name}`,
    severity: alert.severity,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  for (const channel of alert.channels) {
    switch (channel) {
      case 'slack':
        if (DEFAULT_CONFIG.services.slack?.enabled) {
          await sendSlackAlert(alertMessage);
        }
        break;
      case 'pagerduty':
        if (DEFAULT_CONFIG.services.pagerduty?.enabled) {
          await sendPagerDutyAlert(alertMessage);
        }
        break;
      case 'email':
        if (DEFAULT_CONFIG.services.email?.enabled) {
          await sendEmailAlert(alertMessage);
        }
        break;
    }
  }
}

async function sendSlackAlert(message: any): Promise<void> {
  const webhookUrl = DEFAULT_CONFIG.services.slack?.webhook_url;
  if (!webhookUrl || webhookUrl.includes('PLACEHOLDER')) {
        return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message.title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: message.title,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:* ${message.severity.toUpperCase()}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:* ${new Date(message.timestamp).toLocaleString()}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message.message,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

async function sendPagerDutyAlert(message: any): Promise<void> {
  const integrationKey = DEFAULT_CONFIG.services.pagerduty?.integration_key;
  if (!integrationKey || integrationKey === 'placeholder-key') {
        return;
  }

  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        routing_key: integrationKey,
        event_action: message.severity === 'critical' ? 'trigger' : 'acknowledge',
        payload: {
          summary: message.title,
          severity: message.severity,
          source: 'whats-for-dinner-monitoring',
          custom_details: message.details,
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to send PagerDuty alert:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending PagerDuty alert:', error);
  }
}

async function sendEmailAlert(message: any): Promise<void> {
  // In production, use an email service like Resend, SendGrid, etc.
      }

// Test alert function
export async function testAlerts(): Promise<void> {
  
    DEFAULT_CONFIG.alerts.forEach((alert, index) => {
    `);
        }`);
      });

        
  // Send test alert
    await sendAlert(
    DEFAULT_CONFIG.alerts[0],
    'This is a test alert to verify the monitoring system is configured correctly.',
    { test: true }
  );

  }

// Get configuration (removed unused export - not imported anywhere)
// export function getAlertConfig(): MonitoringConfig {
//   return DEFAULT_CONFIG;
// }

// Find alert by name (removed unused export - not imported anywhere)
// export function getAlert(name: string): AlertConfig | undefined {
//   return DEFAULT_CONFIG.alerts.find(a => a.name === name);
// }

if (require.main === module) {
  testAlerts().catch(console.error);
}

export { DEFAULT_CONFIG, sendAlert };
