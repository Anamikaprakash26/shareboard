import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const form = await req.formData()
  const password = String(form.get('password') ?? '')

  const link = await prisma.sharedLink.findUnique({ where: { slug } })
  const backToPage = new URL(`/s/${slug}`, req.url)

  // 303 forces the browser to follow the redirect with GET, not re-POST.
  if (!link || !link.passwordHash) {
    return NextResponse.redirect(backToPage, 303)
  }

  if (verifyPassword(password, link.passwordHash)) {
    const res = NextResponse.redirect(backToPage, 303)
    res.cookies.set(`sb_unlock_${slug}`, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    })
    return res
  }

  return NextResponse.redirect(new URL(`/s/${slug}?error=1`, req.url), 303)
}
