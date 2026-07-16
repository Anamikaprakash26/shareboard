import { createHash } from 'node:crypto'

/** Best-effort client IP from reverse-proxy headers. */
export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || null
  const real = headers.get('x-real-ip')
  if (real) return real.trim() || null
  return null
}

/**
 * We never store a raw IP. Hash it with a server-side salt so views can be
 * reasoned about (rough de-duplication) without holding any PII.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT || 'dev-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}
