/**
 * Privacy Export Endpoint (DSAR - Data Subject Access Request)
 * Generates and emails user data export
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@whats-for-dinner/server/auth';
import { logger } from '@whats-for-dinner/server/observability';
import { addSecurityHeaders } from '@whats-for-dinner/server/security/helmet';

/**
 * POST /api/privacy/export
 * Export user data
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate data export
    const exportData = await generateDataExport(auth.userId);

    // Create signed download link (expires in 7 days)
    const downloadToken = await createDownloadToken(auth.userId, exportData);
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nomad.app'}/api/privacy/download/${downloadToken}`;

    // Send email with download link
    await sendExportEmail(auth.userEmail || '', downloadUrl);

    let res = NextResponse.json({
      message: 'Data export created',
      downloadUrl, // Include in response for immediate access
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { status: 200 });

    return addSecurityHeaders(res);
  } catch (error) {
    logger.error({ error }, 'Privacy export error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generate comprehensive data export
 */
async function generateDataExport(userId: string): Promise<any> {
  // In production, query all tables containing user data
  // This is a simplified version

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    profile: {},
    subscriptions: [],
    mealPlans: [],
    recipes: [],
    pantry: [],
    favorites: [],
    preferences: {},
    consent: {},
    analytics: {},
  };

  // Query database for user data
  // This would typically use your ORM/database client
  // For now, return structure

  return exportData;
}

/**
 * Create secure download token
 */
async function createDownloadToken(userId: string, data: any): Promise<string> {
  // In production, use JWT or similar
  // Store token in database with expiration
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store in database/Redis with expiration
  // await redis.setex(`export:${token}`, 7 * 24 * 60 * 60, JSON.stringify(data));
  
  return token;
}

/**
 * Send export email
 */
async function sendExportEmail(email: string, downloadUrl: string): Promise<void> {
  // In production, use SendGrid or similar
  logger.info({ email }, 'Sending data export email');
  // await sendgrid.send({
  //   to: email,
  //   subject: 'Your Nomad Data Export',
  //   html: `Your data export is ready: ${downloadUrl}`,
  // });
}
