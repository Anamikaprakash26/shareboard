import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const MAX_LEN = 500

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const form = await req.formData()
  const body = String(form.get('response') ?? '').trim().slice(0, MAX_LEN)

  const link = await prisma.sharedLink.findUnique({ where: { slug } })
  const back = new URL(`/s/${slug}`, req.url)

  if (link && body) {
    await prisma.response.create({
      data: { sharedLinkId: link.id, body },
    })
  }
  // 303 so the browser follows the redirect with GET, not a re-POST.
  return NextResponse.redirect(new URL(`/s/${slug}?thanks=1`, req.url), 303)
}
