import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { creditPoints } from '@/lib/ledger'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    const task = await prisma.task.findUnique({ where: { id: params.id } })

    if (!task || task.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Task not available' }, { status: 404 })
    }

    const completion = await prisma.taskCompletion.create({
      data: {
        userId: user.id,
        taskId: task.id,
        status: 'COMPLETED',
        points: task.rewardPoints,
        verifiedAt: new Date(),
      },
    })

    await creditPoints({
      userId: user.id,
      points: task.rewardPoints,
      type: `${task.type}_REWARD`,
      provider: task.provider,
      providerRef: completion.id,
      description: `Completed: ${task.title}`,
    })

    return NextResponse.json({ ok: true, points: task.rewardPoints })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}