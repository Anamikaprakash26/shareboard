import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShareBoard',
  description: 'Shareable links with privacy-aware view analytics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
