import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { amountPoints, upiId } = await req.json()

    const minWithdrawal = parseInt(await getSetting('min_withdrawal_points', '10000'))
    const conversion = parseFloat(await getSetting('points_conversion', '100'))

    if (amountPoints < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${minWithdrawal} points` },
        { status: 400 }
      )
    }

    if (user.pointsBalance < amountPoints) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          pointsBalance: { decrement: amountPoints },
          pendingPoints: { increment: amountPoints },
        },
      })

      return tx.withdrawal.create({
        data: {
          userId: user.id,
          amountPoints,
          amountCash: amountPoints / conversion,
          upiId,
          status: 'PENDING',
        },
      })
    })

    return NextResponse.json({ withdrawal })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET() {
  try {
    const user = await requireUser()
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ withdrawals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}