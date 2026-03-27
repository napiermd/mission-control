"use client"

import { useState } from "react"

type CalEvent = {
  id: string
  title: string
  time: string | null
  color: string | null
  source: string | null
  status?: string
}

const colorMap: Record<string, string> = {
  blue: "text-blue-400",
  green: "text-hud-green",
  purple: "text-purple-400",
  yellow: "text-hud-amber",
  red: "text-hud-red",
  gray: "text-hud-muted",
}

const routineEvents = ["Family Block", "BREAK", "HARD STOP", "Email Sweep", "Focus Time"]

function isRoutine(title: string) {
  return routineEvents.some(r => title.includes(r))
}

export default function TodaySchedule({ events }: { events: CalEvent[] }) {
  const [expanded, setExpanded] = useState(true)

  // Deduplicate by title+time, filter (copy) events
  const seen = new Set<string>()
  const deduped = events.filter(e => {
    if (e.title.includes("(copy)")) return false
    const key = `${e.title}|${e.time}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const meaningful = deduped.filter(e => !isRoutine(e.title))
  const routine = deduped.filter(e => isRoutine(e.title))

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
        <div className="space-y-1">
          {/* Real events */}
          {meaningful.length > 0 ? meaningful.map((event) => {
            const endTime = event.status?.includes('|') ? event.status.split('|')[1] : ''
            return (
              <div key={event.id} className="flex gap-3 items-center text-xs">
                <div className="shrink-0 w-24 text-right">
                  <span className={colorMap[event.color || "gray"] || "text-hud-muted"}>
                    {event.time || "TBD"}
                  </span>
                  {endTime && <span className="text-hud-muted"> - {endTime}</span>}
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

          {/* Routine events — muted, collapsed */}
          {routine.length > 0 && (
            <div className="mt-2 pt-2 border-t border-space-border">
              <div className="text-[10px] text-hud-muted/50 mb-1">routine</div>
              {routine.map((event) => (
                <div key={event.id} className="flex gap-3 items-center text-[10px] text-hud-muted/40">
                  <span className="shrink-0 w-24 text-right">{event.time || ""}</span>
                  <span className="flex-1">{event.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
