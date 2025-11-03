# Privacy Operations Guide

## DSAR (Data Subject Access Request) SLA

### Response Times
- **GDPR**: 30 days from verification
- **CCPA/CPRA**: 45 days from verification
- **Other regions**: 30 days (configurable)

### Request Types

1. **Export**: Data export package (ZIP) containing:
   - Profile information
   - Preferences
   - Meal plans
   - Grocery lists
   - Health metrics
   - User-created recipes
   - Messages metadata (not other users' content)
   - Analytics events
   - Consent records

2. **Erasure**: Permanent deletion of user data
   - Soft delete first (7-day grace period)
   - Hard delete after grace period
   - Respects legal hold

3. **Restriction**: Suspend processing for specific purposes
   - Blocks analytics/ad processing
   - Creates restriction token

4. **Rectification**: Correct inaccurate data
   - Scoped fields: email, name, units, locale
   - Writes correction log

## Fulfillment Steps

### Export Request
1. User submits request via portal
2. Verification email sent
3. User verifies email
4. Export job generates ZIP
5. Artifact uploaded to storage
6. Signed download link sent to user
7. Request marked complete

### Erasure Request
1. User submits request
2. Verification email sent
3. User verifies email
4. Check legal hold (skip if active)
5. Soft delete data (grace period)
6. Generate erasure log
7. After grace period: hard delete
8. Request marked complete

## Erasure Caveats

- **Legal Hold**: Erasure skipped if user/data under legal hold
- **Soft Delete**: Data marked deleted but retained for 7 days
- **Anonymization**: User email anonymized, not deleted
- **Cascade**: Related data deleted (meal plans, metrics, recipes)
- **Logs**: All deletions logged with checksums

## Retention Matrix

Retention policies are auto-generated from `processing_activities.retention_days`:

| Category | Default Retention | Auto Purge |
|----------|------------------|------------|
| Clicks | 365 days | Yes |
| Conversions | 730 days | Yes |
| Events | 180 days | Yes |
| Audit Logs | 1825 days | No (manual) |
| Processing Activity | From activity config | Yes |

## Roles & Separation of Duties (SoD)

### Privacy Officer
- Full access to DSAR operations
- Can approve/fulfill requests
- Can override retention policies
- Can manage vendors and DPIA
- Can modify risk register

### Auditor
- Read-only access to:
  - Evidence
  - Controls
  - Reports
  - Risk register
  - Vendor catalog
  - DPIA records

### Regular Admin
- No access to privacy operations
- Standard admin permissions only

## Verification Process

1. User submits request with email
2. System generates JWT verification token (24h expiry)
3. Email sent with magic link
4. User clicks link ? verifies email
5. Request status: `received` ? `verifying`
6. Processing begins

## Artifact Security

- **Storage**: Immutable bucket with versioning
- **Signed URLs**: All artifacts use expiring signed URLs (1h TTL)
- **Checksums**: SHA-256 checksums for integrity
- **Rate Limiting**: Max 5 requests per user per day
- **Access Logs**: All downloads logged

## Magic Link Payload

```json
{
  "email": "user@example.com",
  "request_id": "uuid",
  "type": "dsar_verification",
  "exp": 1234567890
}
```

## Testing Locally

1. **Create DSAR request**:
```bash
curl -X POST http://localhost:3000/api/privacy/dsar \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"export","region":"gdpr"}'
```

2. **Verify request** (use token from email):
```bash
curl -X POST http://localhost:3000/api/privacy/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"<jwt-token>"}'
```

3. **List user requests**:
```bash
curl http://localhost:3000/api/privacy/requests/me?email=test@example.com
```

4. **Generate export** (admin):
```bash
curl -X POST http://localhost:3000/api/privacy/fulfill \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"request_id":"<uuid>","artifact_urls":["<url>"]}'
```

## Evidence Location

- **Default**: `/tmp/evidence/`
- **Production**: `EVIDENCE_IMMUTABLE_BUCKET_URL` env var
- **Format**: `{control-key}-{timestamp}.json`
- **Checksum**: SHA-256 stored in `control_evidence` table

## Checksum Verification

```bash
# For export artifacts
sha256sum export-<request-id>.zip

# For evidence files
sha256sum <control-key>-<timestamp>.json

# Compare with database checksum
psql -c "SELECT checksum FROM dsar_artifacts WHERE id='<artifact-id>';"
```
