import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, tokenExpiry, sendPasswordResetEmail } from '@/lib/verification'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const { allowed } = rateLimit(`forgot:${ip}`, 3, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const token = generateToken()
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetExpiry: tokenExpiry(60),
        },
      })
      await sendPasswordResetEmail(user.email, token)
    }

    return NextResponse.json({
      ok: true,
      message: 'If the email exists, a reset link was sent',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}