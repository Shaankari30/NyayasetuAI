import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NyayaSetu AI — Democratizing Legal Access',
  description: 'AI-powered multilingual legal assistant for every Indian citizen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1d3a] text-white antialiased">{children}</body>
    </html>
  )
}
