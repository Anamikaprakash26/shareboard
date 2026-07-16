/**
 * Anonymous visitor cookie used to attribute shared-link views to a browser
 * without any login. Minted once in middleware (see middleware.ts) and read
 * everywhere else. Kept in one place so the name / TTL / options can't drift
 * between the mint site and the readers.
 */
export const VISITOR_COOKIE_NAME = 'sb_visitor_id'
export const VISITOR_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 365 // 1 year

export function visitorCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: VISITOR_COOKIE_TTL_SECONDS,
  }
}

/** Web-Crypto UUID — works in the edge middleware runtime. */
export function newVisitorId(): string {
  return crypto.randomUUID()
}
