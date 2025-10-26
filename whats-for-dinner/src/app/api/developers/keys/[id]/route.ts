import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'
import { z } from 'zod'

const UpdateAPIKeySchema = z.object({
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  rateLimits: z.record(z.any()).optional()
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const updates = UpdateAPIKeySchema.parse(body)
    
    // Get user context
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Update API key
    const { data: key, error } = await supabase
      .from('developer_portal_sessions')
      .update(updates)
      .eq('id', params.id)
      .eq('developer_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update API key: ${error.message}`)
    }

    if (!key) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      key: key
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user context
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Delete API key
    const { error } = await supabase
      .from('developer_portal_sessions')
      .delete()
      .eq('id', params.id)
      .eq('developer_id', userId)

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}