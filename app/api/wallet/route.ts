import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export async function GET() {
  try {
    const user = await requireUser()
    const conversion = parseFloat(await getSetting('points_conversion', '100'))

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      pointsBalance: user.pointsBalance,
      pendingPoints: user.pendingPoints,
      cashValue: user.pointsBalance / conversion,
      transactions,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}