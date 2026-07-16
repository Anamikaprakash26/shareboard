import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const link = await prisma.sharedLink.findUnique({
    where: { slug },
    include: { views: { orderBy: { lastSeenAt: 'desc' } } },
  })
  if (!link) notFound()

  return (
    <main className="wrap">
      <p>
        <Link href="/admin" className="muted small">
          ← dashboard
        </Link>
      </p>
      <h1>{link.title}</h1>
      <p className="muted small">/s/{link.slug}</p>

      <div className="stats">
        <div className="stat">
          <span className="num">{link.viewCount}</span>
          <span className="lbl">total views</span>
        </div>
        <div className="stat">
          <span className="num">{link.views.length}</span>
          <span className="lbl">unique visitors</span>
        </div>
      </div>

      <div className="card">
        <h2>Visitors</h2>
        {link.views.length === 0 ? (
          <p className="muted">
            No views yet. Open{' '}
            <Link href={`/s/${link.slug}`}>the public link</Link> in a browser.
          </p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>IP (hashed)</th>
                <th>Hits</th>
                <th>First seen</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {link.views.map((v) => (
                <tr key={v.id}>
                  <td className="mono">{v.visitorId.slice(0, 8)}…</td>
                  <td className="mono">
                    {v.ipHash ? v.ipHash.slice(0, 10) + '…' : '—'}
                  </td>
                  <td>{v.hits}</td>
                  <td>{v.firstSeenAt.toLocaleString()}</td>
                  <td>{v.lastSeenAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
