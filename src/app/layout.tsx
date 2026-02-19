import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Mission Control',
  description: 'Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🎯' },
    { href: '/tasks', label: 'Tasks', icon: '✅' },
    { href: '/pipeline', label: 'Pipeline', icon: '📺' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/memory', label: 'Memory', icon: '🧠' },
    { href: '/team', label: 'Team', icon: '👥' },
  ]

  return (
    <html lang="en">
      <body>
        <div className="flex">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="p-6">
              <h1 className="text-xl font-bold text-white mb-8">🎮 Mission Control</h1>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="absolute bottom-0 p-6 w-full">
              <div className="text-xs text-gray-500">v1.0 • {new Date().toLocaleDateString()}</div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
