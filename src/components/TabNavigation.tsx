"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const primaryTabs = [
  { href: "/", label: "Command" },
  { href: "/gmail", label: "Gmail" },
  { href: "/pipeline", label: "Content Calendar" },
  { href: "/slack", label: "Slack Feed" },
  { href: "/calendar", label: "Calendar" },
  { href: "/team", label: "Team" },
]

const secondaryTabs = [
  { href: "/tasks", label: "Tasks" },
  { href: "/contacts", label: "Contacts" },
  { href: "/memory", label: "Memory" },
  { href: "/learning", label: "Learning" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/settings", label: "Settings" },
]

export default function TabNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 border-b border-cream-200 px-6 overflow-x-auto">
      {primaryTabs.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-warm-text text-warm-text"
                : "border-transparent text-warm-muted hover:text-warm-text hover:border-cream-200"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}

      {/* Separator */}
      <div className="w-px h-5 bg-cream-200 mx-2 shrink-0" />

      {secondaryTabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-warm-muted text-warm-text"
                : "border-transparent text-warm-muted/70 hover:text-warm-muted hover:border-cream-200"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
