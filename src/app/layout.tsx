import './globals.css'
import TabNavigation from '@/components/TabNavigation'

export const metadata = {
  title: 'Mission Control',
  description: 'Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream-50 text-warm-text">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-cream-200">
            <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-0">
              <div className="text-xs text-warm-muted mb-1">IntuBlade Command Center</div>
            </div>
            <TabNavigation />
          </header>
          <main className="main-content max-w-7xl mx-auto w-full px-6 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
