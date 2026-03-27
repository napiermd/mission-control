"use client"

import { useState } from "react"

type TaskItem = {
  id: string
  title: string
  owner: string | null
  next_action: string | null
  next_action_date: string | null
  domain: string
  status: string
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff <= 0) return "TODAY"
  if (diff === 1) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

export default function TaskBoard({ items }: { items: TaskItem[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(true)

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
        TASK BOARD [{items.length}]
        <span className="text-hud-muted font-normal ml-2 text-[10px]">(tap to check off)</span>
      </button>
      {expanded && (
        <div className="space-y-0.5">
          {items.length > 0 ? items.map((item) => {
            const isDone = completed.has(item.id)
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-3 py-2.5 rounded border border-transparent cursor-pointer transition-all hover:bg-space-panel hover:border-space-border ${
                  isDone ? "opacity-40" : ""
                }`}
                onClick={() => toggleDone(item.id)}
              >
                <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  isDone
                    ? "bg-hud-green border-hud-green text-space-black"
                    : "border-hud-muted/40 bg-transparent hover:border-hud-amber"
                }`}>
                  {isDone && (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs leading-relaxed line-clamp-2 ${isDone ? "line-through text-hud-muted" : "text-hud-text"}`}>
                    {item.next_action || item.title}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.next_action_date && (
                    <span className={`text-[10px] ${
                      formatDate(item.next_action_date) === "TODAY" ? "text-hud-red" : "text-hud-muted"
                    }`}>
                      {formatDate(item.next_action_date)}
                    </span>
                  )}
                  {item.owner && item.owner.toLowerCase() !== "andrew" && (
                    <span className="text-[10px] text-hud-amber bg-space-panel px-1.5 py-0.5 rounded border border-space-border">
                      {item.owner}
                    </span>
                  )}
                </div>
              </div>
            )
          }) : (
            <div className="text-xs text-hud-muted p-2">No actionable tasks.</div>
          )}
        </div>
      )}
    </div>
  )
}
