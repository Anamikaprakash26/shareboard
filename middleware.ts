import { NextResponse, type NextRequest } from 'next/server'
import {
  VISITOR_COOKIE_NAME,
  visitorCookieOptions,
  newVisitorId,
} from '@/lib/visitor-cookie'

/**
 * Mint the anonymous visitor cookie exactly once, on the first visit to any
 * public share page. We reflect the new id onto the *request* as well as the
 * response, so the same render (the page's `cookies()` call) already sees it and
 * the very first view is attributed, not lost.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get(VISITOR_COOKIE_NAME)?.value
  if (existing) return NextResponse.next()

  const id = newVisitorId()
  request.cookies.set(VISITOR_COOKIE_NAME, id)

  const response = NextResponse.next({
    request: { headers: request.headers },
  })
  response.cookies.set(VISITOR_COOKIE_NAME, id, visitorCookieOptions())
  return response
}

export const config = {
  matcher: ['/s/:path*'],
}
