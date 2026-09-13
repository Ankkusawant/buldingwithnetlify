import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'

function generateReferralCode() {
  return 'ZOVIRA' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, referralCode } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    let referredById: string | undefined
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer) referredById = referrer.id
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        passwordHash: await hashPassword(password),
        referralCode: generateReferralCode(),
        referredById,
      },
    })

    const token = await signToken({ userId: user.id, role: user.role })
    setAuthCookie(token)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, referralCode: user.referralCode },
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: 'Registration failed', detail: error?.message || String(error) },
      { status: 500 }
    )
  }
}