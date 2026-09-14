import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { amountPoints, upiId } = await req.json()

    if (!amountPoints || !upiId) {
      return NextResponse.json(
        { error: 'amountPoints and upiId are required' },
        { status: 400 }
      )
    }

    const minWithdrawal = parseInt(
      await getSetting('min_withdrawal_points', '10000')
    )
    const conversion = parseFloat(await getSetting('points_conversion', '100'))

    if (amountPoints < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${minWithdrawal} points` },
        { status: 400 }
      )
    }

    if (user.pointsBalance < amountPoints) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    const withdrawal = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const currentUser = await tx.user.findUnique({
          where: { id: user.id },
        })

        if (!currentUser || currentUser.pointsBalance < amountPoints) {
          throw new Error('Insufficient balance')
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: { decrement: amountPoints },
            pendingPoints: { increment: amountPoints },
          },
        })

        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'WITHDRAWAL_REQUEST',
            points: -amountPoints,
            description: `Withdrawal requested to ${upiId}`,
            status: 'PENDING',
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
      }
    )

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