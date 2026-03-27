"use client"

import { useState } from "react"

type Item = {
  id: string
  title: string
  owner: string | null
  domain: string
  next_action: string | null
  next_action_date: string | null
  status: string
  _score: number
}

function scoreToDot(score: number) {
  if (score >= 40) return "bg-hud-red"
  if (score >= 25) return "bg-hud-amber"
  return "bg-hud-green"
}

function domainTag(domain: string) {
  const map: Record<string, string> = {
    pilots: "PIL", leads: "LEAD", ops: "OPS", personal: "PER", rep_mgmt: "SALE",
  }
  return map[domain] || domain.toUpperCase().slice(0, 4)
}

export default function AttentionPanel({ items }: { items: Item[] }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        ATTENTION [{items.length}]
      </button>
      {expanded && (
        <div className="space-y-2">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${scoreToDot(item._score)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-hud-text">
                  <span className="text-hud-muted mr-1.5">[{domainTag(item.domain)}]</span>
                  {item.title}
                  {item.owner && item.owner.toLowerCase() !== "andrew" && <span className="text-hud-amber"> — {item.owner}</span>}
                </div>
                {item.next_action && (
                  <div className="text-xs text-hud-muted mt-0.5">{item.next_action}</div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-xs text-hud-muted">No active constraints.</div>
          )}
        </div>
      )}
    </div>
  )
}
