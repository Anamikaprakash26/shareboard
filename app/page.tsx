import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const links = await prisma.sharedLink.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="wrap">
      <h1>ShareBoard</h1>
      <p className="muted">
        Shareable links with privacy-aware view analytics — a clean-room demo of a
        real feature I built on placement.
      </p>

      <div className="card">
        <h2>Public share links</h2>
        <ul className="list">
          {links.map((l) => (
            <li key={l.id}>
              <Link href={`/s/${l.slug}`}>{l.title}</Link>
              {l.passwordHash ? <span className="tag">password</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <p>
        <Link className="btn" href="/admin">
          Open the admin dashboard →
        </Link>
      </p>
    </main>
  )
}
