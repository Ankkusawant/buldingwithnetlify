import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { getProvider } from '@/lib/providers/registry'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { providerId: string } }
) {
  try {
    const user = await requireUser()

    const providerRow = await prisma.provider.findUnique({
      where: { id: params.providerId },
    })

    if (!providerRow || !providerRow.enabled) {
      return NextResponse.json(
        { error: 'Provider not available' },
        { status: 404 }
      )
    }

    const provider = getProvider(params.providerId)
    if (!provider.getIframeUrl) {
      return NextResponse.json(
        { error: 'Provider does not support iframe' },
        { status: 400 }
      )
    }

    const url = await provider.getIframeUrl(user.id, {
      email: user.email,
      name: user.name,
    })

    return NextResponse.json({ url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}