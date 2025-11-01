# Multi-Factor Authentication (MFA) Setup Guide

## Overview
This guide explains how to enable and configure Multi-Factor Authentication (MFA) for What's for Dinner application using Supabase Auth.

## Current Status
- [x] Supabase Auth supports MFA
- [ ] MFA enabled for admin users
- [ ] MFA UI components implemented
- [ ] MFA recovery process documented

## Supabase MFA Support

Supabase Auth provides built-in MFA support using TOTP (Time-based One-Time Password).

### Features
- TOTP-based authentication
- Recovery codes
- SMS-based MFA (optional)
- WebAuthn support (future)

## Implementation

### 1. Enable MFA in Supabase Dashboard

1. Go to Authentication ? Settings
2. Enable "Multi-factor Authentication"
3. Configure MFA methods:
   - TOTP (Recommended)
   - SMS (Optional, requires Twilio)

### 2. Frontend Implementation

Create MFA setup component:

```typescript
// apps/web/src/components/MFASetup.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function MFASetup() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  async function enableMFA() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) throw error;

    setQrCode(data.qr_code);
  }

  async function verifyMFA() {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: 'factor-id',
      code: verificationCode,
    });

    if (error) throw error;

    setRecoveryCodes(data.recovery_codes);
  }

  return (
    <div>
      <button onClick={enableMFA}>Enable MFA</button>
      {qrCode && (
        <div>
          <img src={qrCode} alt="MFA QR Code" />
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <button onClick={verifyMFA}>Verify</button>
        </div>
      )}
      {recoveryCodes.length > 0 && (
        <div>
          <h3>Recovery Codes</h3>
          <ul>
            {recoveryCodes.map((code, i) => (
              <li key={i}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 3. MFA Verification During Login

```typescript
// apps/web/src/app/auth/page.tsx
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if MFA is required
  if (data.session === null && data.user) {
    // MFA is required, show MFA input
    return { requiresMFA: true };
  }

  return { session: data.session };
}

async function verifyMFACode(code: string) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: 'factor-id',
    code,
  });

  if (error) throw error;

  return data.session;
}
```

## Admin-Only MFA

### Requirement: Admin Users Must Use MFA

Create middleware to enforce MFA for admin users:

```typescript
// apps/web/src/lib/auth-helpers.ts
export async function requireMFA(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_profiles')
    .select('role, mfa_enabled')
    .eq('id', userId)
    .single();

  if (data?.role === 'app_admin' || data?.role === 'app_super_admin') {
    return data.mfa_enabled === true;
  }

  return true; // MFA optional for regular users
}

// Use in API routes
export async function adminOnly(req: NextRequest) {
  const user = await getCurrentUser(req);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mfaRequired = await requireMFA(user.id);
  if (!mfaRequired) {
    return NextResponse.json(
      { error: 'MFA required for admin access' },
      { status: 403 }
    );
  }

  // Proceed with admin operation
}
```

## Recovery Codes

### Display Recovery Codes
After MFA setup, users receive recovery codes. Store them securely:

```typescript
// apps/web/src/components/MFARecovery.tsx
export function MFARecoveryDisplay({ codes }: { codes: string[] }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
      <h3>Save These Recovery Codes</h3>
      <p>You can use these codes if you lose access to your MFA device.</p>
      <ul>
        {codes.map((code, i) => (
          <li key={i} className="font-mono">{code}</li>
        ))}
      </ul>
      <button onClick={() => window.print()}>Print Codes</button>
    </div>
  );
}
```

### Use Recovery Code
```typescript
async function loginWithRecoveryCode(code: string) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: 'factor-id',
    code,
    type: 'recovery',
  });

  if (error) throw error;

  return data.session;
}
```

## UI Components

### MFA Status Indicator
Show MFA status in user settings:

```typescript
// apps/web/src/components/MFAStatus.tsx
export function MFAStatus({ enabled }: { enabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <>
          <CheckIcon className="text-green-500" />
          <span>MFA Enabled</span>
        </>
      ) : (
        <>
          <XIcon className="text-red-500" />
          <span>MFA Disabled</span>
          <Link href="/settings/security">Enable</Link>
        </>
      )}
    </div>
  );
}
```

## Security Considerations

### Best Practices
1. **Require MFA for admins**: Enforce MFA for all admin users
2. **Store recovery codes securely**: Never store recovery codes in plain text
3. **Rate limit MFA attempts**: Prevent brute force attacks
4. **Session management**: Use secure session handling with MFA
5. **Audit logging**: Log all MFA-related events

### Rate Limiting
Apply rate limiting to MFA verification:

```typescript
// Use rate limiting for MFA endpoints
const mfaRateLimit = rateLimit({
  requests: 5,
  window: 300, // 5 attempts per 5 minutes
});
```

## Testing

### Test MFA Flow
1. Enable MFA for test user
2. Scan QR code with authenticator app
3. Verify with TOTP code
4. Test login with MFA
5. Test recovery code usage
6. Test MFA disable

### Test Admin Enforcement
1. Create admin user without MFA
2. Attempt to access admin endpoints
3. Verify MFA is required
4. Enable MFA for admin
5. Verify access is granted

## Documentation

### User-Facing Documentation
Create help article:
- How to enable MFA
- How to use authenticator apps
- How to use recovery codes
- Troubleshooting MFA issues

## Next Steps
1. Enable MFA in Supabase dashboard
2. Implement MFA UI components
3. Enforce MFA for admin users
4. Create user documentation
5. Test MFA flow end-to-end
