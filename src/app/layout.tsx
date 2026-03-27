import './globals.css'
import Link from 'next/link'
import { format } from 'date-fns'

export const metadata = {
  title: 'TARS // Mission Control',
  description: 'Personal Command Center',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-mono">
      <body className="bg-space-black text-hud-text !font-[JetBrains_Mono,SF_Mono,Fira_Code,monospace]">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-space-border px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-hud-amber font-bold tracking-[0.3em] text-sm">T A R S</span>
              <span className="text-space-border">//</span>
              <span className="text-hud-muted text-xs tracking-wider uppercase">Mission Control</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-hud-muted text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <Link href="/settings" className="text-hud-muted hover:text-hud-amber text-xs transition-colors py-2 px-2">
                [settings]
              </Link>
            </div>
          </header>
          <main className="main-content max-w-6xl mx-auto w-full px-6 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
