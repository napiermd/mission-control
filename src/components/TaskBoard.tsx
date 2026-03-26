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

  async function toggleDone(id: string) {
    const next = new Set(completed)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      fetch("/api/ops-board/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "done", last_action: "Marked done from Command Center" }),
      })
    }
    setCompleted(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-warm-text uppercase tracking-wide">
          Task Board
        </h2>
        <span className="text-[10px] text-warm-muted">(tap to check off)</span>
      </div>
      <div className="space-y-1">
        {items.length > 0 ? items.map((item) => {
          const isDone = completed.has(item.id)
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-cream-100 ${
                isDone ? "opacity-50" : ""
              }`}
              onClick={() => toggleDone(item.id)}
            >
              <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                isDone
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-cream-200 bg-white"
              }`}>
                {isDone && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${isDone ? "line-through text-warm-muted" : "text-warm-text"}`}>
                  {item.next_action || item.title}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.next_action_date && (
                  <span className={`text-[10px] font-medium ${
                    formatDate(item.next_action_date) === "TODAY" ? "text-red-600" : "text-warm-muted"
                  }`}>
                    {formatDate(item.next_action_date)}
                  </span>
                )}
                {item.owner && (
                  <span className="text-[10px] text-warm-muted bg-cream-100 px-1.5 py-0.5 rounded">
                    {item.owner}
                  </span>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="text-sm text-warm-muted p-3">No actionable tasks.</div>
        )}
      </div>
    </div>
  )
}
