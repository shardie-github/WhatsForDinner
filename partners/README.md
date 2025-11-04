# Partner Integration Guide

This guide outlines how to integrate with What's for Dinner? partner APIs and webhooks.

## Webhooks

### TikTok Integration
- **Endpoint:** `POST /api/webhooks/tiktok`
- **Authentication:** Bearer token
- **Events:** `ad_click`, `conversion`

### Meta Integration
- **Endpoint:** `POST /api/webhooks/meta`
- **Authentication:** Bearer token
- **Events:** `lead`, `conversion`

### Stripe Integration
- **Endpoint:** `POST /api/webhooks/stripe`
- **Authentication:** Bearer token
- **Events:** `payment_intent.succeeded`, `customer.subscription.created`

## Contract Tests

Run contract tests to validate webhook payloads:

```bash
npm run ops test:e2e --grep="contract"
```

## Schema Validation

All webhooks must conform to the PartnerWebhookSchema:

```typescript
{
  partner: 'tiktok' | 'meta' | 'stripe',
  event: string,
  timestamp: string,
  data: Record<string, any>
}
```

## Postman Collection

Import the Postman collection from `ops/partners/postman-collection.json` to test webhooks.
