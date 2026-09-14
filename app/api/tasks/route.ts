import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getProvider } from '@/lib/providers/registry'
import { Task } from '@prisma/client'

export async function GET() {
  try {
    const user = await requireUser()

    // Fetch enabled providers
    const providers = await prisma.provider.findMany({
      where: { enabled: true, status: 'ACTIVE' },
    })

    // Collect offers from offerwall-type providers
    const providerOffers: any[] = []
    for (const p of providers) {
      if (p.integrationType === 'iframe') continue
      try {
        const provider = getProvider(p.id)
        if (provider.getOffers) {
          const offers = await provider.getOffers(user.id)
          providerOffers.push(...offers)
        }
      } catch (e) {
        console.error(`[tasks] provider ${p.id} failed:`, e)
      }
    }

    // Upsert provider offers into Task table so completion works
    for (const offer of providerOffers) {
      try {
        await prisma.task.upsert({
          where: {
            provider_providerTaskId: {
              provider: offer.provider,
              providerTaskId: offer.id,
            },
          },
          update: {
            title: offer.title,
            description: offer.description,
            rewardPoints: offer.rewardPoints,
            type: offer.type,
          },
          create: {
            provider: offer.provider,
            providerTaskId: offer.id,
            title: offer.title,
            description: offer.description,
            rewardPoints: offer.rewardPoints,
            estimatedMinutes: offer.estimatedMinutes,
            type: offer.type,
            status: 'ACTIVE',
          },
        })
      } catch (e) {
        console.error(`[tasks] upsert failed for ${offer.id}:`, e)
      }
    }

    // Return all active tasks
    const allTasks = await prisma.task.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      tasks: allTasks.map((t: Task) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        rewardPoints: t.rewardPoints,
        estimatedMinutes: t.estimatedMinutes,
        type: t.type,
        provider: t.provider,
      })),
    })
  } catch (error: any) {
    console.error('[tasks]', error)
    return NextResponse.json(
      { error: 'Failed to load tasks', detail: error?.message || String(error) },
      { status: 500 }
    )
  }
}