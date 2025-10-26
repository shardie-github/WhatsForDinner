import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'
import { FederatedAPIGateway } from '@/lib/federatedGateway'
import { z } from 'zod'

const FederationRequestSchema = z.object({
  partner: z.string(),
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  data: z.record(z.any()).optional(),
  headers: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { partner, endpoint, method, data, headers: customHeaders, metadata } = FederationRequestSchema.parse(body)
    
    // Get tenant and user context
    const headersList = headers()
    const tenantId = headersList.get('x-tenant-id')
    const userId = headersList.get('x-user-id')
    const requestId = headersList.get('x-request-id') || crypto.randomUUID()
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant information required' },
        { status: 400 }
      )
    }

    // Initialize federated gateway
    const gateway = new FederatedAPIGateway()
    
    // Route request through federated gateway
    const result = await gateway.routeRequest({
      partner,
      endpoint,
      method,
      data,
      headers: customHeaders,
      metadata,
      tenantId,
      userId,
      requestId
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Federation API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Federation request failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partner = searchParams.get('partner')
    const endpoint = searchParams.get('endpoint')
    
    if (!partner || !endpoint) {
      return NextResponse.json(
        { error: 'Partner and endpoint parameters required' },
        { status: 400 }
      )
    }

    // Get tenant context
    const headersList = headers()
    const tenantId = headersList.get('x-tenant-id')
    const userId = headersList.get('x-user-id')
    const requestId = headersList.get('x-request-id') || crypto.randomUUID()
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant information required' },
        { status: 400 }
      )
    }

    // Initialize federated gateway
    const gateway = new FederatedAPIGateway()
    
    // Route GET request
    const result = await gateway.routeRequest({
      partner,
      endpoint,
      method: 'GET',
      tenantId,
      userId,
      requestId
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Federation GET error:', error)
    return NextResponse.json(
      { error: 'Federation request failed' },
      { status: 500 }
    )
  }
}