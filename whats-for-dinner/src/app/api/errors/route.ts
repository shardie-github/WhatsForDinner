import { observabilitySystem } from '@/lib/observability'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const limit = searchParams.get('limit')

    const filters: any = {}
    if (severity) filters.severity = severity
    if (startTime) filters.startTime = startTime
    if (endTime) filters.endTime = endTime
    if (limit) filters.limit = parseInt(limit)

    const errors = await observabilitySystem.getErrors(filters)
    
    return new Response(JSON.stringify({
      errors,
      count: errors.length
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