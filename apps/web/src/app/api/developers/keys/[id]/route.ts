import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const UpdateAPIKeySchema = z.object({
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  rateLimits: z.record(z.any()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user via JWT
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const { user, supabase } = context;

    const { id } = await params;
    const body = await req.json();
    const updates = UpdateAPIKeySchema.parse(body);

    // Update API key
    const { data: key, error } = await supabase
      .from('developer_portal_sessions')
      .update(updates)
      .eq('id', id)
      .eq('developer_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update API key: ${error.message}`);
    }

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      key: key,
    });
  } catch (error) {
    console.error('Error updating API key:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user via JWT
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const { user, supabase } = context;

    const { id } = await params;

    // Delete API key
    const { error } = await supabase
      .from('developer_portal_sessions')
      .delete()
      .eq('id', id)
      .eq('developer_id', user.id);

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
