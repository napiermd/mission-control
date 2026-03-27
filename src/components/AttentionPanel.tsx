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
    pilots: "PIL", leads: "LEAD", ops: "OPS", personal: "PER", rep_mgmt: "SALE", pe_outreach: "PE_O",
  }
  return map[domain] || domain.toUpperCase().slice(0, 4)
}

function truncate(text: string, max: number = 80): string {
  if (!text || text.length <= max) return text
  // Try to cut at first sentence boundary
  const sentenceEnd = text.indexOf('. ')
  if (sentenceEnd > 0 && sentenceEnd <= max) return text.slice(0, sentenceEnd + 1)
  const dashEnd = text.indexOf(' — ')
  if (dashEnd > 0 && dashEnd <= max) return text.slice(0, dashEnd)
  return text.slice(0, max) + "..."
}

function formatDue(dateStr: string | null) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return "TODAY"
  if (diff === 1) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

export default function AttentionPanel({ items }: { items: Item[] }) {
  const [expanded, setExpanded] = useState(true)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  async function toggleDone(id: string) {
    const next = new Set(completed)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      fetch("/api/ops-board/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "done", last_action: "Marked done from Mission Control" }),
      })
    }
    setCompleted(next)
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        ACTION ITEMS [{items.length}]
      </button>
      {expanded && (
        <div className="space-y-0.5">
          {items.length > 0 ? items.map((item) => {
            const isDone = completed.has(item.id)
            const due = formatDue(item.next_action_date)
            return (
              <div
                key={item.id}
                className={`flex items-start gap-2.5 px-2 py-2 rounded border border-transparent cursor-pointer transition-all hover:bg-space-panel hover:border-space-border ${isDone ? "opacity-30" : ""}`}
                onClick={() => toggleDone(item.id)}
              >
                {/* Checkbox */}
                <div className={`w-3.5 h-3.5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  isDone ? "bg-hud-green border-hud-green text-space-black" : "border-hud-muted/40 hover:border-hud-amber"
                }`}>
                  {isDone && (
                    <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Score dot */}
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${scoreToDot(item._score)}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs leading-relaxed ${isDone ? "line-through text-hud-muted" : "text-hud-text"}`}>
                    <span className="text-hud-muted mr-1">[{domainTag(item.domain)}]</span>
                    {truncate(item.title)}
                    {item.owner && item.owner.toLowerCase() !== "andrew" && (
                      <span className="text-hud-amber"> — {item.owner}</span>
                    )}
                  </div>
                  {item.next_action && item.next_action !== item.title && (
                    <div className="text-[10px] text-hud-muted mt-0.5 line-clamp-1">
                      {truncate(item.next_action, 100)}
                    </div>
                  )}
                </div>

                {/* Due date */}
                {due && (
                  <span className={`text-[10px] shrink-0 mt-0.5 ${
                    due === "TODAY" || due.includes("overdue") ? "text-hud-red" : "text-hud-muted"
                  }`}>
                    {due}
                  </span>
                )}
              </div>
            )
          }) : (
            <div className="text-xs text-hud-muted px-2">No active items.</div>
          )}
        </div>
      )}
    </div>
  )
}
