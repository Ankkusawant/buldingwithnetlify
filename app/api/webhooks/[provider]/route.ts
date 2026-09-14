import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProvider } from '@/lib/providers/registry'
import { creditPoints } from '@/lib/ledger'

/**
 * Handles both GET and POST webhooks.
 * CPX Research and most networks send GET with query params.
 */
async function handleWebhook(
  req: Request,
  params: { provider: string },
  payload: any
) {
  const provider = getProvider(params.provider)
  const headers = Object.fromEntries(req.headers.entries())

  console.log('[webhook] provider:', params.provider)
  console.log('[webhook] payload:', JSON.stringify(payload))

  const event = await provider.handleWebhook(payload, headers)
  console.log('[webhook] extracted event:', event)

  const existing = await prisma.providerEvent.findUnique({
    where: {
      provider_eventId: {
        provider: params.provider,
        eventId: event.eventId,
      },
    },
  })

  if (existing) {
    console.log('[webhook] duplicate event, ignoring')
    return NextResponse.json({ ok: true, message: 'Duplicate event ignored' })
  }

  await prisma.providerEvent.create({
    data: {
      provider: params.provider,
      eventId: event.eventId,
      payload: JSON.stringify(payload),
      userId: event.userId,
      status: 'PROCESSED',
    },
  })

  await creditPoints({
    userId: event.userId,
    points: event.points,
    type: event.type,
    provider: params.provider,
    providerRef: event.providerRef,
    description: event.description,
  })

  console.log('[webhook] points credited successfully')
  return NextResponse.json({ ok: true })
}

export async function GET(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const url = new URL(req.url)
    const query: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })
    return await handleWebhook(req, params, query)
  } catch (error: any) {
    console.error('[webhook GET] error:', error?.message || error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const rawBody = await req.text()
    console.log('[webhook POST] raw body:', rawBody)
    const payload = rawBody ? JSON.parse(rawBody) : {}
    return await handleWebhook(req, params, payload)
  } catch (error: any) {
    console.error('[webhook POST] error:', error?.message || error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}