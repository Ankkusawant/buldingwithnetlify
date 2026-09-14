import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export async function GET() {
  try {
    const user = await requireUser()
    const conversion = parseFloat(
      await getSetting('points_conversion', '100')
    )

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [todayAgg, lifetimeAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          points: { gt: 0 },
          status: 'COMPLETED',
          createdAt: { gte: startOfToday },
        },
        _sum: { points: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          points: { gt: 0 },
          status: 'COMPLETED',
        },
        _sum: { points: true },
      }),
    ])

    const todayPoints = todayAgg._sum.points || 0
    const lifetimePoints = lifetimeAgg._sum.points || 0

    return NextResponse.json({
      pointsBalance: user.pointsBalance,
      pendingPoints: user.pendingPoints,
      availableCash: user.pointsBalance / conversion,
      pendingCash: user.pendingPoints / conversion,
      todayPoints,
      todayCash: todayPoints / conversion,
      lifetimePoints,
      lifetimeCash: lifetimePoints / conversion,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}