type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt?: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0].trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  return 'unknown'
}