import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@whats-for-dinner/server/auth';
import { usersRepo, featureFlagsRepo } from '@whats-for-dinner/server/db';
import { addSecurityHeaders, setCORSHeaders } from '@whats-for-dinner/server/security/helmet';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  diet: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

// GET /api/user/me
export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext(request);
    if (!ctx?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await usersRepo.findById(ctx.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const flags = await featureFlagsRepo.findByUser(ctx.user.id);

    let res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        preferences: user.preferences,
      },
      flags,
    });
    res = addSecurityHeaders(res);
    return setCORSHeaders(res, request.headers.get('origin'));
  } catch (error) {
    // Error handled: Error fetching user:
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/user/me
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getAuthContext(request);
    if (!ctx?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updatePreferencesSchema.parse(body);

    const currentUser = await usersRepo.findById(ctx.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedPreferences = {
      ...(currentUser.preferences || {}),
      ...validated,
    };

    const updated = await usersRepo.update(ctx.user.id, {
      preferences: updatedPreferences as any,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    let res = NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        plan: updated.plan,
        preferences: updated.preferences,
      },
    });
    res = addSecurityHeaders(res);
    return setCORSHeaders(res, request.headers.get('origin'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    // Error handled: Error updating user:
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
