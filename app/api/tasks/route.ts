import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getProvider } from '@/lib/providers/registry'

export async function GET() {
  try {
    const user = await requireUser()

    const adminTasks = await prisma.task.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    const providerOffers = await getProvider('mock').getOffers(user.id)

    const combined = [
      ...adminTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        rewardPoints: t.rewardPoints,
        estimatedMinutes: t.estimatedMinutes,
        type: t.type,
        provider: t.provider,
      })),
      ...providerOffers,
    ]

    return NextResponse.json({ tasks: combined })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}   