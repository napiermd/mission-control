"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ContextSwitcher from "./ContextSwitcher"

type Props = {
  stats: {
    totalItems: number
    urgentCount: number
    blockedCount: number
    emailCount: number
    slackCount: number
  }
  venture: string
  onVentureChange: (v: string) => void
}

type OuraData = {
  readiness: number | null
  sleep: number | null
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function readinessColor(score: number) {
  if (score >= 85) return "text-hud-green"
  if (score >= 70) return "text-hud-amber"
  return "text-hud-red"
}

export default function TARSHeader({ stats, venture, onVentureChange }: Props) {
  const router = useRouter()
  const [oura, setOura] = useState<OuraData | null>(null)

  useEffect(() => {
    fetch("/api/oura")
      .then(r => r.json())
      .then(d => { if (d.readiness) setOura(d) })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-hud-muted text-xs flex items-center gap-3">
          <span>
            {getGreeting()}, Andrew. {stats.totalItems} items tracked.
            {stats.urgentCount > 0 && <span className="text-hud-red ml-2">{stats.urgentCount} urgent.</span>}
            {stats.blockedCount > 0 && <span className="text-hud-amber ml-2">{stats.blockedCount} blocked.</span>}
          </span>
          {oura && (
            <span className="border-l border-space-border pl-3">
              <span className={readinessColor(oura.readiness!)}>R:{oura.readiness}</span>
              {oura.sleep && <span className="text-hud-muted ml-1.5">S:{oura.sleep}</span>}
            </span>
          )}
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
