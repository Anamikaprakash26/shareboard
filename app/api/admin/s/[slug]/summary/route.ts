import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSummary } from '@/lib/ai-summary'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const link = await prisma.sharedLink.findUnique({
    where: { slug },
    include: { responses: { orderBy: { createdAt: 'desc' } } },
  })
  if (!link) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const result = await generateSummary(link.title, link.responses)
  return NextResponse.json(result)
}
