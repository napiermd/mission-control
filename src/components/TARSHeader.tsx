"use client"

import { useRouter } from "next/navigation"
import ContextSwitcher from "./ContextSwitcher"

type Props = {
  stats: {
    totalItems: number
    urgentCount: number
    blockedCount: number
  }
  venture: string
  onVentureChange: (v: string) => void
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default function TARSHeader({ stats, venture, onVentureChange }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-hud-muted text-xs">
          {getGreeting()}, Andrew. {stats.totalItems} items tracked.
          {stats.urgentCount > 0 && <span className="text-hud-red ml-2">{stats.urgentCount} urgent.</span>}
          {stats.blockedCount > 0 && <span className="text-hud-amber ml-2">{stats.blockedCount} blocked.</span>}
        </div>
        <button
          onClick={() => router.refresh()}
          className="text-xs text-hud-muted hover:text-hud-amber border border-space-border rounded px-2 py-1 transition-colors"
        >
          refresh
        </button>
      </div>
      <ContextSwitcher active={venture} onChange={onVentureChange} />
    </div>
  )
}
