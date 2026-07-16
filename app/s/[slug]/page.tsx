import { after } from 'next/server'
import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { VISITOR_COOKIE_NAME } from '@/lib/visitor-cookie'
import { getClientIp, hashIp } from '@/lib/ip'
import PasswordGate from './password-gate'

export const dynamic = 'force-dynamic'

/**
 * Record a view. Total `viewCount` bumps on every open; `LinkView` is one row
 * per (link, visitor), so its count is the unique-visitor number.
 */
async function recordView(
  linkId: string,
  visitorId: string,
  ipHash: string | null,
) {
  await prisma.sharedLink.update({
    where: { id: linkId },
    data: { viewCount: { increment: 1 } },
  })
  await prisma.linkView.upsert({
    where: { sharedLinkId_visitorId: { sharedLinkId: linkId, visitorId } },
    create: { sharedLinkId: linkId, visitorId, ipHash },
    update: { hits: { increment: 1 }, lastSeenAt: new Date() },
  })
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug } = await params
  const { error } = await searchParams

  const link = await prisma.sharedLink.findUnique({ where: { slug } })
  if (!link) notFound()

  const cookieStore = await cookies()

  // Password gate: don't render content (or count a view) until unlocked.
  if (link.passwordHash) {
    const unlocked = cookieStore.get(`sb_unlock_${link.slug}`)?.value === '1'
    if (!unlocked) {
      return <PasswordGate slug={link.slug} title={link.title} error={!!error} />
    }
  }

  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value
  if (visitorId) {
    const hdrs = await headers()
    const ipHash = hashIp(getClientIp(hdrs))
    // Defer the DB writes until after the response is streamed, so view
    // tracking never adds latency to the page the visitor is waiting for.
    after(async () => {
      try {
        await recordView(link.id, visitorId, ipHash)
      } catch (e) {
        console.error('view tracking failed for', slug, e)
      }
    })
  }

  return (
    <main className="wrap">
      <article className="card">
        <h1>{link.title}</h1>
        <div className="body">{link.body}</div>
      </article>
      <p className="muted small">
        You are viewing a public share link. Views are counted anonymously — no
        login, and no raw IP is ever stored.
      </p>
    </main>
  )
}
