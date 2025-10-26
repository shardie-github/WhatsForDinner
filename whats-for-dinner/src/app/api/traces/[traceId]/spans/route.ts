import { observabilitySystem } from '@/lib/observability'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { traceId: string } }
) {
  try {
    const { traceId } = params

    if (!traceId) {
      return new Response(JSON.stringify({
        error: 'Trace ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const spans = await observabilitySystem.getSpans(traceId)
    
    return new Response(JSON.stringify({
      traceId,
      spans,
      count: spans.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}