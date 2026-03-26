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

  // Filter to meaningful events (not breaks/hard stops for the HUD view)
  const meaningful = events.filter(e =>
    !e.title.includes("BREAK") &&
    !e.title.includes("HARD STOP") &&
    !e.title.includes("Family Block") &&
    !e.title.includes("Email Sweep")
  ).slice(0, 8)

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
          {meaningful.length > 0 ? meaningful.map((event) => (
            <div key={event.id} className="flex gap-3 items-center text-xs">
              <span className={`shrink-0 w-14 text-right ${colorMap[event.color || "gray"] || "text-hud-muted"}`}>
                {event.time || "TBD"}
              </span>
              <span className="text-hud-text">{event.title}</span>
              {event.source && (
                <span className="text-hud-muted ml-auto text-[10px]">{event.source}</span>
              )}
            </div>
          )) : (
            <div className="text-xs text-hud-muted">Clear schedule.</div>
          )}
        </div>
      )}
    </div>
  )
}
