import crypto from 'crypto'

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export function tokenExpiry(minutes = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

export async function sendVerificationEmail(to: string, token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const link = `${base}/verify-email?token=${token}`
  console.log(`[email] To: ${to}`)
  console.log(`[email] Verification link: ${link}`)
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const link = `${base}/reset-password?token=${token}`
  console.log(`[email] To: ${to}`)
  console.log(`[email] Reset link: ${link}`)
}