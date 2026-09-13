import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProvider } from '@/lib/providers/registry'
import { creditPoints } from '@/lib/ledger'

export async function POST(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = getProvider(params.provider)
    const payload = await req.json()
    const headers = Object.fromEntries(req.headers.entries())

    const event = await provider.handleWebhook(payload, headers)

    const existing = await prisma.providerEvent.findUnique({
      where: {
        provider_eventId: {
          provider: params.provider,
          eventId: event.eventId,
        },
      },
    })

    if (existing) {
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

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}