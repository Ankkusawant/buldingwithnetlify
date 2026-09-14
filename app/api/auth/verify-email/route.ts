import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { generateToken, tokenExpiry, sendVerificationEmail } from '@/lib/verification'

export async function POST() {
  try {
    const user = await requireUser()

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Already verified' })
    }

    const token = generateToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationExpiry: tokenExpiry(30),
      },
    })

    await sendVerificationEmail(user.email, token)
    return NextResponse.json({ ok: true, message: 'Verification email sent' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    })

    return NextResponse.json({ ok: true, message: 'Email verified' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}