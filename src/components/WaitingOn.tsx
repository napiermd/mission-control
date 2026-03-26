"use client"

import { useState } from "react"

type FollowUp = {
  id: string
  person_name: string
  subject: string
  sent_at: string
  status: string
  source: string | null
}

function daysWaiting(sentAt: string) {
  const diff = Date.now() - new Date(sentAt).getTime()
  return Math.floor(diff / 86400000)
}

export default function WaitingOn({ items }: { items: FollowUp[] }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        WAITING ON [{items.length}]
      </button>
      {expanded && (
        <div className="space-y-2">
          {items.length > 0 ? items.map((item) => {
            const days = daysWaiting(item.sent_at)
            return (
              <div key={item.id} className="flex gap-3 items-start text-xs">
                <span className="text-hud-amber shrink-0">⏳</span>
                <div className="flex-1 min-w-0">
                  <span className="text-hud-text font-medium">{item.person_name}</span>
                  <span className="text-hud-muted"> — {item.subject}</span>
                </div>
                <span className={`shrink-0 ${days >= 7 ? "text-hud-red" : days >= 3 ? "text-hud-amber" : "text-hud-muted"}`}>
                  {days}d
                </span>
              </div>
            )
          }) : (
            <div className="text-xs text-hud-muted">No pending follow-ups.</div>
          )}
        </div>
      )}
    </div>
  )
}
