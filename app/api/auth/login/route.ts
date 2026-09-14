import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const { allowed } = rateLimit(`login:${ip}`, 10, 60_000)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 1 minute.' },
        { status: 429 }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    const token = await signToken({ userId: user.id, role: user.role })
    setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('[login]', error)
    return NextResponse.json(
      { error: 'Login failed', detail: error?.message || String(error) },
      { status: 500 }
    )
  }
}