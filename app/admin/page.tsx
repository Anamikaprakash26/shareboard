import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const links = await prisma.sharedLink.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { views: true } } },
  })

  const totalViews = links.reduce((s, l) => s + l.viewCount, 0)
  const totalUnique = links.reduce((s, l) => s + l._count.views, 0)

  return (
    <main className="wrap">
      <p>
        <Link href="/" className="muted small">
          ← home
        </Link>
      </p>
      <h1>Admin · Analytics</h1>

      <div className="stats">
        <div className="stat">
          <span className="num">{links.length}</span>
          <span className="lbl">links</span>
        </div>
        <div className="stat">
          <span className="num">{totalViews}</span>
          <span className="lbl">total views</span>
        </div>
        <div className="stat">
          <span className="num">{totalUnique}</span>
          <span className="lbl">unique visitors</span>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Link</th>
              <th>Views</th>
              <th>Unique</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.title}
                  {l.passwordHash ? <span className="tag">password</span> : null}
                </td>
                <td>{l.viewCount}</td>
                <td>{l._count.views}</td>
                <td>
                  <Link href={`/admin/${l.slug}`}>details →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
