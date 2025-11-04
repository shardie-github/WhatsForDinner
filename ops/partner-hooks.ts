/**
 * Partner Hooks - Integration contracts, Postman collection, README
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PARTNERS_DIR = join(process.cwd(), 'partners');

interface WebhookContract {
  endpoint: string;
  method: string;
  auth: string;
  schema: any;
  events: string[];
}

function generatePartnerContracts(): WebhookContract[] {
  return [
    {
      endpoint: '/api/webhooks/partner',
      method: 'POST',
      auth: 'HMAC-SHA256',
      schema: {
        type: 'object',
        properties: {
          event: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string' }
        },
        required: ['event', 'data', 'timestamp']
      },
      events: ['conversion', 'click', 'impression']
    }
  ];
}

function generatePostmanCollection(): string {
  return JSON.stringify({
    info: {
      name: 'Whats For Dinner Partner API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      {
        name: 'Webhook - Conversion',
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            {
              key: 'X-Partner-Signature',
              value: '{{signature}}'
            }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              event: 'conversion',
              data: {
                userId: 'user_123',
                amount: 9.99,
                currency: 'USD'
              },
              timestamp: new Date().toISOString()
            })
          },
          url: {
            raw: '{{base_url}}/api/webhooks/partner',
            host: ['{{base_url}}'],
            path: ['api', 'webhooks', 'partner']
          }
        }
      }
    ]
  }, null, 2);
}

function generatePartnerREADME(): string {
  return `# Partner Integration Guide

## Overview

This guide explains how to integrate with the Whats For Dinner partner API.

## Authentication

All webhook endpoints use HMAC-SHA256 authentication.

### Generating Signatures

\`\`\`javascript
const crypto = require('crypto');
const secret = 'your-partner-secret';
const payload = JSON.stringify(requestBody);
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
\`\`\`

## Webhooks

### Conversion Webhook

\`POST /api/webhooks/partner\`

**Headers:**
- \`X-Partner-Signature\`: HMAC-SHA256 signature

**Body:**
\`\`\`json
{
  "event": "conversion",
  "data": {
    "userId": "user_123",
    "amount": 9.99,
    "currency": "USD"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

## Events

### conversion
Triggered when a user completes a purchase.

### click
Triggered when a user clicks a partner link.

### impression
Triggered when a partner link is displayed.

## Testing

Use the provided Postman collection (\`partners/postman-collection.json\`) to test integrations.

## Support

For questions, contact: partners@whatsfordinner.app
`;
}

async function generatePartnerPack(): Promise<void> {
  console.log('Generating partner pack...');

  if (!existsSync(PARTNERS_DIR)) {
    mkdirSync(PARTNERS_DIR, { recursive: true });
  }

  const contracts = generatePartnerContracts();
  writeFileSync(
    join(PARTNERS_DIR, 'contracts.json'),
    JSON.stringify(contracts, null, 2)
  );

  writeFileSync(
    join(PARTNERS_DIR, 'postman-collection.json'),
    generatePostmanCollection()
  );

  writeFileSync(
    join(PARTNERS_DIR, 'README.md'),
    generatePartnerREADME()
  );

  console.log('✅ Partner pack generated');
}

if (require.main === module) {
  generatePartnerPack().catch(error => {
    console.error('Failed to generate partner pack:', error);
    process.exit(1);
  });
}

export { generatePartnerPack };
