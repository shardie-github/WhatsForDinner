# Partner Revenue Network - API Documentation

## Overview

The Partner Revenue Network API enables brands and retailers to:
- Onboard and manage partner accounts
- Sync product catalogs (CSV, XML, API feeds)
- Create and manage advertising campaigns
- Generate signed affiliate links
- Track performance (clicks, conversions, revenue)
- Receive payouts via Stripe Connect

## Base URL

```
Production: https://api.nomad.app/v1/partner
Sandbox: https://api-sandbox.nomad.app/v1/partner
```

## Authentication

The Partner API supports two authentication methods:

### 1. JWT Bearer Token (Recommended)

```bash
Authorization: Bearer <partner_jwt_token>
```

**Obtaining a Token** (Admin only):
```bash
POST /api/partner/auth/token
{
  "partner_id": "uuid",
  "scopes": ["catalog:push", "campaign:write", "report:read"]
}
```

### 2. API Key with HMAC

```bash
X-API-Key: <api_key>
X-Timestamp: <unix_timestamp_ms>
X-Signature: <hmac_sha256_signature>
```

**Signature Generation**:
```javascript
const payload = `${timestamp}:${requestBody}`;
const signature = crypto
  .createHmac('sha256', apiKey)
  .update(payload)
  .digest('hex');
```

## Scopes

- `catalog:push` - Sync catalog feeds
- `campaign:write` - Create/edit campaigns
- `report:read` - Access performance reports
- `links:create` - Generate signed affiliate links
- `webhook:receive` - Receive webhook notifications
- `*` - Full access

## Endpoints

### Catalog Management

#### Sync Catalog Feed

```http
POST /api/partner/catalog/sync
Content-Type: application/json
Authorization: Bearer <token>

{
  "feed_id": "uuid",           // Optional: existing feed
  "source": "csv|xml|api",      // Optional if feed_id provided
  "url": "https://...",         // For API/S3 sources
  "content": "csv content..."   // For direct CSV/XML upload
}
```

**Response**:
```json
{
  "synced": 1250,
  "errors": 3,
  "total": 1253
}
```

**Supported Formats**:
- **CSV**: Google Merchant format compatible
- **XML**: Google Merchant, RSS, custom formats
- **API**: JSON REST with pagination support

#### List Catalog Items

```http
GET /api/partner/catalog/items?page=1&limit=50&affiliateable=true
Authorization: Bearer <token>
```

### Campaign Management

#### Create Campaign

```http
POST /api/partner/campaigns
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Summer Sale 2025",
  "kind": "sponsored_tile|banner|recipe_pin|search_boost",
  "start_at": "2025-06-01T00:00:00Z",
  "end_at": "2025-08-31T23:59:59Z",
  "budget_cents": 100000,      // $1000.00
  "currency": "USD",
  "cpm_cents": 500,            // Optional: $5.00 per 1000 impressions
  "cpc_cents": 50,             // Optional: $0.50 per click
  "cpa_cents": 2000,           // Optional: $20.00 per conversion
  "cap_daily": 50,             // Optional: daily cap in clicks/impressions
  "targeting": {
    "diet_tags": ["vegetarian", "gluten-free"],
    "geo": ["US", "CA"],
    "slots": ["inspire_tile", "recipe_pin"]
  }
}
```

**Response**:
```json
{
  "id": "uuid",
  "partner_id": "uuid",
  "name": "Summer Sale 2025",
  "status": "draft",
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### List Campaigns

```http
GET /api/partner/campaigns?status=running
Authorization: Bearer <token>
```

#### Update Campaign Status

```http
PATCH /api/partner/campaigns/{campaign_id}
Content-Type: application/json

{
  "status": "running|paused|completed"
}
```

### Link Generation

#### Create Signed Link

```http
POST /api/partner/links
Content-Type: application/json
Authorization: Bearer <token>

{
  "sku": "PROD-123",                    // Optional
  "kind": "affiliate|deeplink|cart",
  "destination_url": "https://...",
  "expires_in_hours": 720,              // Optional: default 30 days
  "meta": {
    "campaign_id": "uuid"               // Optional
  }
}
```

**Response**:
```json
{
  "signed_url": "https://partner.com/product?...&_s=signature",
  "short_url": "/r/abc123...",
  "token": "abc123...",
  "expires_at": "2025-03-01T00:00:00Z"
}
```

**Usage**:
- Use `short_url` (`/r/:token`) for user-facing links
- Short URL redirects log clicks and set attribution cookies
- Attribution window: configurable per partner (default 7 days)

### Reports & Analytics

#### Summary Report

```http
GET /api/partner/reports/summary?from=2025-01-01&to=2025-01-31&campaign_id=uuid
Authorization: Bearer <token>
```

**Response**:
```json
{
  "period": {
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-01-31T23:59:59Z"
  },
  "clicks": 15234,
  "conversions": 342,
  "revenue_cents": 68400,
  "spend_cents": 5120,
  "ctr": 0.022,
  "cvr": 0.022,
  "roas": 13.36
}
```

#### Payout Statements

```http
GET /api/partner/payouts
Authorization: Bearer <token>
```

**Response**:
```json
{
  "payouts": [
    {
      "id": "uuid",
      "period_start": "2025-01-01",
      "period_end": "2025-01-15",
      "revenue_cents": 50000,
      "share_pct": 0.10,
      "payout_cents": 4500,
      "currency": "USD",
      "status": "paid",
      "stripe_transfer_id": "tr_...",
      "created_at": "2025-01-16T00:00:00Z"
    }
  ]
}
```

### Conversion Webhooks

#### Record Conversion (Server-to-Server)

```http
POST /api/partner/convert
Content-Type: application/json
X-Timestamp: 1705320000000
X-Signature: <hmac_sha256>

{
  "order_id": "ORD-12345",
  "partner_id": "uuid",           // Optional if in auth
  "campaign_id": "uuid",           // Optional
  "sku": "PROD-123",               // Optional
  "amount_cents": 2999,
  "currency": "USD",
  "timestamp": "2025-01-15T10:30:00Z",
  "meta": {}
}
```

**HMAC Signature**:
```
payload = JSON.stringify(requestBody)
message = `${timestamp}:${payload}`
signature = HMAC-SHA256(message, PARTNER_CONVERSION_HMAC_SECRET)
```

**Idempotency**: Conversions are deduplicated by `partner_id + order_id`. Subsequent requests return existing conversion.

**Response**:
```json
{
  "conversion_id": "uuid",
  "click_id": "uuid",              // Associated click (if found)
  "message": "Conversion recorded successfully"
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "budget_cents",
      "message": "Must be positive"
    }
  ]
}
```

### Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient scope)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limits

- **Default**: 100 requests/minute per partner
- **Catalog Sync**: 10 requests/hour
- **Conversion Webhooks**: 1000 requests/minute

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

## Webhooks (Outgoing)

Partners can subscribe to webhook events:

### Event Types
- `campaign.approved`
- `campaign.paused`
- `creative.rejected`
- `payout.processed`
- `fraud.flagged`

### Webhook Payload

```json
{
  "event": "campaign.approved",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "campaign_id": "uuid",
    "partner_id": "uuid"
  },
  "signature": "<hmac_sha256>"
}
```

## Testing & Sandbox

### Sandbox Environment
- Separate test database
- Mock Stripe Connect (no real transfers)
- Test API keys available via partner console

### Example: Full Flow

1. **Create Partner** (Admin):
```bash
POST /api/admin/partners
{
  "slug": "test-brand",
  "name": "Test Brand",
  "contact_email": "partner@example.com",
  "tier": "affiliate"
}
```

2. **Mint Token** (Admin):
```bash
POST /api/partner/auth/token
{
  "partner_id": "uuid",
  "scopes": ["*"]
}
```

3. **Sync Catalog**:
```bash
POST /api/partner/catalog/sync
Authorization: Bearer <token>
{
  "source": "csv",
  "content": "id,title,price,availability\nPROD-1,Product 1,19.99,in stock"
}
```

4. **Create Campaign**:
```bash
POST /api/partner/campaigns
Authorization: Bearer <token>
{
  "name": "Test Campaign",
  "kind": "sponsored_tile",
  "start_at": "2025-01-20T00:00:00Z",
  "budget_cents": 10000,
  "cpc_cents": 50
}
```

5. **Generate Link**:
```bash
POST /api/partner/links
Authorization: Bearer <token>
{
  "sku": "PROD-1",
  "kind": "affiliate",
  "destination_url": "https://partner.com/product/1"
}
```

6. **Record Conversion** (Webhook):
```bash
POST /api/partner/convert
X-Timestamp: 1705320000000
X-Signature: <hmac>
{
  "order_id": "ORD-123",
  "amount_cents": 1999,
  "currency": "USD"
}
```

## Support

- **API Support**: `api-support@nomad.app`
- **Documentation**: https://docs.nomad.app/partner-api
- **Status Page**: https://status.nomad.app

---

*Last Updated: 2025-01-XX*
*API Version: v1*
