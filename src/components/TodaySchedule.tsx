"use client"

import { useState } from "react"

type CalEvent = {
  id: string
  title: string
  time: string | null
  color: string | null
  source: string | null
}

const colorMap: Record<string, string> = {
  blue: "text-blue-400",
  green: "text-hud-green",
  purple: "text-purple-400",
  yellow: "text-hud-amber",
  red: "text-hud-red",
  gray: "text-hud-muted",
}

export default function TodaySchedule({ events }: { events: CalEvent[] }) {
  const [expanded, setExpanded] = useState(true)

  // Filter out noise and deduplicate by title+time
  const seen = new Set<string>()
  const meaningful = events.filter(e => {
    if (e.title.includes("BREAK") || e.title.includes("HARD STOP") ||
        e.title.includes("Family Block") || e.title.includes("Email Sweep") ||
        e.title.includes("(copy)") || e.title.includes("Focus Time")) return false
    const key = `${e.title}|${e.time}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 8)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        TODAY [{meaningful.length}]
      </button>
      {expanded && (
        <div className="space-y-1.5">
          {meaningful.length > 0 ? meaningful.map((event) => {
            const endTime = (event as any).status?.includes('|') ? (event as any).status.split('|')[1] : ''
            return (
              <div key={event.id} className="flex gap-3 items-center text-xs">
                <div className="shrink-0 w-24 text-right">
                  <span className={colorMap[event.color || "gray"] || "text-hud-muted"}>
                    {event.time || "TBD"}
                  </span>
                  {endTime && (
                    <span className="text-hud-muted"> - {endTime}</span>
                  )}
                </div>
                <span className="text-hud-text flex-1">{event.title}</span>
                {event.source && (
                  <span className="text-hud-muted shrink-0 text-[10px]">{event.source}</span>
                )}
              </div>
            )
          }) : (
            <div className="text-xs text-hud-muted">Clear schedule.</div>
          )}
        </div>
      )}
    </div>
  )
}
