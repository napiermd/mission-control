"use client"

import { useEffect, useState } from "react"
import ContextSwitcher from "@/components/ContextSwitcher"

type Thread = {
  id: string
  thread_id: string
  subject: string
  from_name: string
  from_email: string
  snippet: string
  date: string
  is_unread: boolean
  labels: string[]
  venture: string
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function GmailClient() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [venture, setVenture] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadThreads()
  }, [])

  async function loadThreads() {
    setLoading(true)
    try {
      const res = await fetch("/api/gmail?limit=30")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setThreads([])
      } else {
        setThreads(data.threads || [])
      }
    } catch {
      setError("Failed to load Gmail")
    } finally {
      setLoading(false)
    }
  }

  const filtered = venture === "all"
    ? threads
    : threads.filter((t) => (t.venture || "intublade") === venture)

  const unreadCount = filtered.filter((t) => t.is_unread).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gmail</h1>
          <p className="text-hud-muted text-sm mt-1">
            {filtered.length} threads{unreadCount > 0 && ` — ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ContextSwitcher active={venture} onChange={setVenture} />
          <button
            onClick={loadThreads}
            className="text-sm text-hud-muted hover:text-hud-amber border border-space-border rounded-lg px-3 py-1.5 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-hud-muted text-center py-12">Loading inbox...</div>}

      {error && (
        <div className="card bg-amber-900/30 border-space-border">
          <p className="text-hud-amber text-sm">{error}</p>
          <p className="text-hud-amber text-xs mt-1">Gmail API token may need refresh. Threads will load from cache if available.</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-1">
          {filtered.map((thread) => {
            const ventureTag = thread.venture || "intublade"
            return (
              <div
                key={thread.id}
                className={`flex items-start gap-3 p-4 rounded-lg transition-colors hover:bg-space-panel ${
                  thread.is_unread ? "bg-space-dark" : "bg-space-dark"
                }`}
              >
                {/* Unread dot */}
                <div className="pt-1.5 shrink-0">
                  {thread.is_unread ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  ) : (
                    <div className="w-2.5 h-2.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${thread.is_unread ? "font-semibold text-hud-text" : "text-hud-text"}`}>
                      {thread.from_name || thread.from_email}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-panel text-hud-muted capitalize">
                      {ventureTag}
                    </span>
                  </div>
                  <div className={`text-sm mt-0.5 ${thread.is_unread ? "font-medium text-hud-text" : "text-hud-muted"}`}>
                    {thread.subject}
                  </div>
                  <div className="text-xs text-hud-muted mt-0.5 line-clamp-1">
                    {thread.snippet}
                  </div>
                </div>

                {/* Date */}
                <div className="shrink-0 text-xs text-hud-muted">
                  {timeAgo(thread.date)}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-hud-muted">
              {threads.length === 0 ? "No email threads loaded" : "No threads match this filter"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
