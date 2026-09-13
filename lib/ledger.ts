import { prisma } from './prisma'

export async function creditPoints({
  userId,
  points,
  type,
  provider,
  providerRef,
  description,
  cashValue,
}: {
  userId: string
  points: number
  type: string
  provider?: string
  providerRef?: string
  description?: string
  cashValue?: number
}) {
  return prisma.$transaction(async (tx) => {
    if (provider && providerRef) {
      const existing = await tx.transaction.findUnique({
        where: { provider_providerRef: { provider, providerRef } },
      })
      if (existing) return existing
    }

    await tx.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: points } },
    })

    return tx.transaction.create({
      data: {
        userId,
        type,
        points,
        cashValue,
        provider,
        providerRef,
        description,
        status: 'COMPLETED',
      },
    })
  })
}

export async function debitPoints({
  userId,
  points,
  type,
  description,
}: {
  userId: string
  points: number
  type: string
  description?: string
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } })
    if (!user || user.pointsBalance < points) {
      throw new Error('Insufficient points')
    }

    await tx.user.update({
      where: { id: userId },
      data: { pointsBalance: { decrement: points } },
    })

    return tx.transaction.create({
      data: { userId, type, points: -points, description, status: 'COMPLETED' },
    })
  })
}