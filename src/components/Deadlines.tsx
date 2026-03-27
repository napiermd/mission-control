"use client"

import { useState } from "react"

type Deadline = {
  id: string
  title: string
  next_action_date: string
  domain: string
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / 86400000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function Deadlines({ items }: { items: Deadline[] }) {
  const [expanded, setExpanded] = useState(true)

  // Sort by date ascending (most urgent first)
  const sorted = [...items].sort((a, b) =>
    new Date(a.next_action_date).getTime() - new Date(b.next_action_date).getTime()
  )

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        DEADLINES [{sorted.length}]
      </button>
      {expanded && (
        <div className="space-y-1.5">
          {sorted.length > 0 ? sorted.map((item) => {
            const days = daysUntil(item.next_action_date)
            return (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <span className={`font-bold w-8 text-right ${
                  days <= 3 ? "text-hud-red" : days <= 7 ? "text-hud-amber" : "text-hud-muted"
                }`}>
                  {days}d
                </span>
                <span className="text-hud-text flex-1 truncate">{item.title}</span>
                <span className="text-hud-muted shrink-0">{formatDate(item.next_action_date)}</span>
              </div>
            )
          }) : (
            <div className="text-xs text-hud-muted">No upcoming deadlines.</div>
          )}
        </div>
      )}
    </div>
  )
}
