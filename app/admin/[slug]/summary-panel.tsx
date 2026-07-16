'use client'

import { useState } from 'react'

type Result = { total: number; summary: string | null; error: string | null }

export default function SummaryPanel({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function generate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/admin/s/${slug}/summary`)
      setResult(await res.json())
    } catch {
      setResult({ total: 0, summary: null, error: 'request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button className="btn" onClick={generate} disabled={loading}>
        {loading ? 'Summarizing…' : 'Generate AI summary'}
      </button>

      {result?.summary ? (
        <p className="summary">{result.summary}</p>
      ) : null}

      {result && !result.summary ? (
        <p className="muted small" style={{ marginTop: '0.9rem' }}>
          {result.error === 'no AI key configured'
            ? 'AI summary is unavailable because no ANTHROPIC_API_KEY is set. The deterministic count still works: '
            : result.error === 'no responses yet'
              ? 'No responses to summarize yet.'
              : `Could not generate a summary (${result.error}). `}
          {result.error === 'no AI key configured' ? (
            <strong>{result.total} responses collected.</strong>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
