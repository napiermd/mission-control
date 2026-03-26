"use client"

import { useState } from "react"

type BriefData = {
  id: string
  payload: any
  hydrated_at: string
  source_health: any
  version: string | null
} | null

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MorningBrief({ brief }: { brief: BriefData }) {
  const [expanded, setExpanded] = useState(false)

  if (!brief) {
    return (
      <div>
        <div className="section-header mb-3">MORNING BRIEF</div>
        <div className="text-xs text-hud-muted">No brief data available. Hydration runs at 7:55 AM.</div>
      </div>
    )
  }

  const payload = typeof brief.payload === 'string' ? JSON.parse(brief.payload) : brief.payload
  const health = typeof brief.source_health === 'string' ? JSON.parse(brief.source_health) : brief.source_health

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        MORNING BRIEF
        <span className="text-hud-muted font-normal ml-2">{timeAgo(brief.hydrated_at)}</span>
      </button>

      <div className="text-xs space-y-1">
        <div className="text-hud-muted">
          Last hydration: {new Date(brief.hydrated_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit", hour12: true })}
          {brief.version && <span className="ml-2">v{brief.version}</span>}
        </div>

        {health && (
          <div className="flex gap-3">
            {Object.entries(health).map(([source, status]) => (
              <span key={source} className={`${status === 'ok' || status === true ? 'text-hud-green' : 'text-hud-red'}`}>
                {source}: {status === 'ok' || status === true ? 'ok' : 'fail'}
              </span>
            ))}
          </div>
        )}

        {expanded && payload && (
          <div className="mt-3 p-3 bg-space-panel rounded border border-space-border">
            <pre className="text-[11px] text-hud-muted whitespace-pre-wrap overflow-auto max-h-[300px]">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
