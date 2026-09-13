import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const withdrawals = await prisma.withdrawal.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ withdrawals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin()
    const { withdrawalId, status, adminNote } = await req.json()

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    })
    if (!withdrawal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (status === 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { pendingPoints: { decrement: withdrawal.amountPoints } },
        })
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status, adminNote, processedAt: new Date() },
        })
        await tx.adminAudit.create({
          data: {
            adminId: admin.id,
            action: 'WITHDRAWAL_COMPLETED',
            targetUserId: withdrawal.userId,
            details: `Withdrawal ${withdrawalId} completed`,
          },
        })
      })
    } else if (status === 'REJECTED') {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            pendingPoints: { decrement: withdrawal.amountPoints },
            pointsBalance: { increment: withdrawal.amountPoints },
          },
        })
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status, adminNote, processedAt: new Date() },
        })
        await tx.adminAudit.create({
          data: {
            adminId: admin.id,
            action: 'WITHDRAWAL_REJECTED',
            targetUserId: withdrawal.userId,
            details: `Withdrawal ${withdrawalId} rejected`,
          },
        })
      })
    } else {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status, adminNote },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}