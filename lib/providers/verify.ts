import crypto from 'crypto'

export function verifyMD5(input: string, secret: string, provided: string): boolean {
  const expected = crypto.createHash('md5').update(`${input}-${secret}`).digest('hex')
  return safeCompare(expected, provided)
}

export function verifyHmacSHA256(payload: string, secret: string, provided: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return safeCompare(expected, provided)
}

export function verifySHA1(input: string, provided: string): boolean {
  const expected = crypto.createHash('sha1').update(input).digest('hex')
  return safeCompare(expected, provided)
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}