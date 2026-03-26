"use client"

import { useEffect, useState } from "react"
import ContextSwitcher, { classifyChannel } from "@/components/ContextSwitcher"

type SlackMessage = {
  id: string
  channel_id: string
  channel_name: string
  text: string
  user: string
  user_name: string
  timestamp: string
  date: string
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatSlackText(text: string): string {
  return text
    .replace(/<https?:\/\/[^|>]+\|([^>]+)>/g, '$1')
    .replace(/<https?:\/\/[^>]+>/g, '[link]')
    .replace(/<@[A-Z0-9]+>/g, '@user')
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1')
}

const channelColors: Record<string, string> = {
  'tars': 'bg-blue-900/30 text-blue-400',
  'dev': 'bg-purple-900/30 text-purple-400',
  'sales-team': 'bg-green-900/30 text-hud-green',
  'sales-success': 'bg-emerald-900/30 text-emerald-400',
  'admin-support': 'bg-amber-50 text-amber-600',
  'admin-support-alt': 'bg-amber-50 text-amber-600',
}

export default function SlackClient() {
  const [messages, setMessages] = useState<SlackMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [venture, setVenture] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    setLoading(true)
    try {
      const res = await fetch("/api/slack-feed?limit=40")
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setMessages([])
      } else {
        setMessages(data.messages || [])
      }
    } catch {
      setError("Failed to load Slack feed")
    } finally {
      setLoading(false)
    }
  }

  const channels = [...new Set(messages.map((m) => m.channel_name))].sort()

  const filtered = messages
    .filter((m) => venture === "all" || classifyChannel(m.channel_name) === venture)
    .filter((m) => channelFilter === "all" || m.channel_name === channelFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slack Feed</h1>
          <p className="text-hud-muted text-sm mt-1">
            {filtered.length} messages across {channels.length} channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ContextSwitcher active={venture} onChange={setVenture} />
          <button
            onClick={loadMessages}
            className="text-sm text-hud-muted hover:text-hud-amber border border-space-border rounded-lg px-3 py-1.5 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Channel Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setChannelFilter("all")}
          className={`px-3 py-1.5 rounded text-xs font-medium ${
            channelFilter === "all" ? "bg-blue-600 text-white" : "bg-space-panel text-hud-muted hover:bg-space-panel"
          }`}
        >
          All Channels
        </button>
        {channels.map((ch) => (
          <button
            key={ch}
            onClick={() => setChannelFilter(ch)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              channelFilter === ch
                ? (channelColors[ch] || "bg-space-border text-hud-text")
                : "bg-space-panel text-hud-muted hover:bg-space-panel"
            }`}
          >
            #{ch}
          </button>
        ))}
      </div>

      {loading && <div className="text-hud-muted text-center py-12">Loading Slack feed...</div>}

      {error && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-amber-700 text-sm">{error}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <div key={msg.id} className="flex gap-3 p-4 rounded-lg hover:bg-space-panel transition-colors">
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded bg-space-border shrink-0 flex items-center justify-center text-xs font-bold text-hud-muted">
                {(msg.user_name || "?")[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-hud-text">{msg.user_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${channelColors[msg.channel_name] || "bg-space-panel text-hud-muted"}`}>
                    #{msg.channel_name}
                  </span>
                  <span className="text-[10px] text-hud-muted ml-auto">{timeAgo(msg.date)}</span>
                </div>
                <div className="text-sm text-hud-text mt-1 whitespace-pre-wrap">
                  {formatSlackText(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-hud-muted">
              {messages.length === 0 ? "No Slack messages loaded" : "No messages match this filter"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
