"use client"

import { useMemo, useState } from "react"

type Learning = {
  id: string
  agent: string
  type: string
  title: string | null
  content: string
  category: string | null
  context: string | null
  source: string
  tags: string[] | null
  created_at: string
}

const typeColors: Record<string, string> = {
  LEARNING: "text-green-400 bg-green-900/50",
  ERROR_FIX: "text-red-400 bg-red-900/50",
  PATTERN: "text-blue-400 bg-blue-900/50",
  GOTCHA: "text-orange-400 bg-orange-900/50",
  PREFERENCE: "text-purple-400 bg-purple-900/50",
  DECISION: "text-yellow-400 bg-yellow-900/50",
}

const agentColors: Record<string, string> = {
  dev: "text-cyan-400 bg-cyan-900/50",
  ops: "text-emerald-400 bg-emerald-900/50",
  sales: "text-pink-400 bg-pink-900/50",
  research: "text-violet-400 bg-violet-900/50",
  main: "text-amber-400 bg-amber-900/50",
  academic: "text-teal-400 bg-teal-900/50",
  finance: "text-lime-400 bg-lime-900/50",
}

const agentDescriptions: Record<string, { role: string; tools: string; captures: string }> = {
  dev: {
    role: "Technical co-pilot — GitHub, code review, CI/CD, architecture",
    tools: "gh CLI, Claude Code, Codex, Cursor, Docker",
    captures: "Error fixes, code patterns, architecture decisions, tool gotchas",
  },
  ops: {
    role: "Operations — calendar, email, tasks, daily briefings",
    tools: "gogcli, KyberOS bridge, Obsidian, Apple Reminders",
    captures: "Process improvements, scheduling patterns, tool preferences",
  },
  sales: {
    role: "Sales & pipeline — HubSpot, outreach, deal tracking",
    tools: "HubSpot API, BreezeDoc, email templates",
    captures: "Sales patterns, objection handling, pipeline insights",
  },
  research: {
    role: "Research & analysis — papers, market research, competitive intel",
    tools: "Web search, PDF analysis, summarization",
    captures: "Research findings, market insights, competitive data",
  },
  main: {
    role: "Primary assistant — general tasks, coordination",
    tools: "All tools, agent coordination",
    captures: "Cross-domain learnings, user preferences, system decisions",
  },
}

function groupByDate(learnings: Learning[]): { label: string; date: string; items: Learning[] }[] {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0]
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0]

  const groups: Record<string, Learning[]> = {}
  for (const l of learnings) {
    const date = l.created_at.split("T")[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(l)
  }

  const sorted = Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))

  return sorted.map(([date, items]) => {
    let label = date
    if (date === today) label = "Today"
    else if (date === yesterday) label = "Yesterday"
    else if (date >= weekAgo) {
      const d = new Date(date + "T12:00:00")
      label = d.toLocaleDateString("en-US", { weekday: "long" })
    } else {
      const d = new Date(date + "T12:00:00")
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    return { label, date, items }
  })
}

export default function LearningClient({ learnings }: { learnings: Learning[] }) {
  const [query, setQuery] = useState("")
  const [agentFilter, setAgentFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<"timeline" | "agents" | "setup">("timeline")

  const agents = useMemo(() => Array.from(new Set(learnings.map((l) => l.agent))).sort(), [learnings])
  const types = useMemo(() => Array.from(new Set(learnings.map((l) => l.type))).sort(), [learnings])

  const filtered = useMemo(() => {
    return learnings.filter((l) => {
      if (agentFilter !== "ALL" && l.agent !== agentFilter) return false
      if (typeFilter !== "ALL" && l.type !== typeFilter) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          (l.title || "").toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q) ||
          (l.category || "").toLowerCase().includes(q) ||
          (l.tags || []).some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [learnings, agentFilter, typeFilter, query])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return learnings.filter((l) => l.created_at.startsWith(today)).length
  }, [learnings])

  const topAgent = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const l of learnings) counts[l.agent] = (counts[l.agent] || 0) + 1
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || "—"
  }, [learnings])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📚 Daily Learnings</h1>
        <p className="text-gray-400 text-sm mt-1">
          What agents learn, discover, and decide — captured in real time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-xs text-gray-400">Total Learnings</div>
          <div className="text-2xl font-bold text-green-400">{learnings.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Today</div>
          <div className="text-2xl font-bold text-blue-400">{todayCount}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Active Agents</div>
          <div className="text-2xl font-bold text-purple-400">{agents.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Top Learner</div>
          <div className="text-2xl font-bold text-yellow-400">{topAgent}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["timeline", "agents", "setup"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {t === "timeline" ? "📅 Timeline" : t === "agents" ? "🤖 By Agent" : "⚙️ System Setup"}
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {tab === "timeline" && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="input"
              placeholder="Search learnings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="select" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
              <option value="ALL">All Agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-sm font-semibold text-gray-300">{group.label}</div>
                  <div className="flex-1 h-px bg-gray-700" />
                  <div className="text-xs text-gray-500">{group.items.length} learnings</div>
                </div>
                <div className="space-y-2 ml-4 border-l-2 border-gray-700 pl-4">
                  {group.items.map((l) => (
                    <div
                      key={l.id}
                      className="card hover:border-gray-600 transition-colors cursor-pointer"
                      onClick={() => l.context && toggleExpand(l.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[l.type] || "text-gray-400 bg-gray-700"}`}>
                          {l.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${agentColors[l.agent] || "text-gray-400 bg-gray-700"}`}>
                          {l.agent}
                        </span>
                        {l.category && (
                          <span className="text-xs text-gray-500">#{l.category}</span>
                        )}
                        <span className="text-xs text-gray-600 ml-auto">
                          {new Date(l.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                      {l.title && <div className="font-medium text-sm mb-1">{l.title}</div>}
                      <div className="text-sm text-gray-300">{l.content}</div>
                      {l.tags && l.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {l.tags.map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {l.context && expandedIds.has(l.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                          <span className="text-gray-400 font-medium">Context:</span> {l.context}
                        </div>
                      )}
                      {l.context && !expandedIds.has(l.id) && (
                        <div className="text-xs text-gray-600 mt-2">▸ Click to show context</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card text-center py-16">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-gray-400">No learnings yet</div>
                <div className="text-gray-500 text-sm mt-2">
                  Agents capture learnings automatically as they work
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Agents Tab */}
      {tab === "agents" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(agentDescriptions).map(([agent, desc]) => {
            const agentLearnings = learnings.filter((l) => l.agent === agent)
            const categories: Record<string, number> = {}
            for (const l of agentLearnings) {
              const cat = l.category || "General"
              categories[cat] = (categories[cat] || 0) + 1
            }
            const topCats = Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)

            return (
              <div key={agent} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${agentColors[agent] || "text-gray-400 bg-gray-700"}`}>
                    {agent}
                  </span>
                  <span className="text-lg font-bold">{agentLearnings.length}</span>
                  <span className="text-xs text-gray-500">learnings</span>
                </div>
                <div className="text-sm text-gray-300 mb-3">{desc.role}</div>
                <div className="text-xs text-gray-500 mb-1">
                  <span className="text-gray-400 font-medium">Tools:</span> {desc.tools}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  <span className="text-gray-400 font-medium">Captures:</span> {desc.captures}
                </div>
                {topCats.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {topCats.map(([cat, count]) => (
                      <span key={cat} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                        {cat} ({count})
                      </span>
                    ))}
                  </div>
                )}
                {agentLearnings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Most recent:</div>
                    <div className="text-sm text-gray-300 line-clamp-2">
                      {agentLearnings[0].title || agentLearnings[0].content}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Setup Tab */}
      {tab === "setup" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">⚙️ How Learning Capture Works</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-white mb-1">1. Agent discovers something</div>
                <div className="text-gray-400">
                  During normal work — fixing a bug, reviewing code, running a deploy — an agent encounters
                  something worth remembering (error fix, pattern, gotcha, preference).
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-white mb-1">2. Auto-capture via API</div>
                <div className="text-gray-400">
                  The agent posts to <code className="text-blue-400">/api/learnings</code> with structured data:
                  agent name, type, content, category, context, and tags.
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-white mb-1">3. Stored in Supabase</div>
                <div className="text-gray-400">
                  Learnings go to <code className="text-blue-400">mc_learnings</code> table with full metadata.
                  Indexed by agent and timestamp for fast queries.
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-white mb-1">4. Visible here in real time</div>
                <div className="text-gray-400">
                  This page shows the timeline. Agents also write to local memory files
                  (<code className="text-blue-400">memory/YYYY-MM-DD.md</code>) and MEMORY.md for curated recall.
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">🗂️ Memory Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-green-400 mb-1">MEMORY.md</div>
                <div className="text-xs text-gray-400">
                  Curated permanent memory. Hard lessons, working patterns, preferences. Reviewed weekly.
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-blue-400 mb-1">memory/*.md</div>
                <div className="text-xs text-gray-400">
                  Daily session logs. Raw learnings captured during work. Distilled into MEMORY.md.
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-purple-400 mb-1">mc_learnings (DB)</div>
                <div className="text-xs text-gray-400">
                  Structured database. Searchable, filterable, queryable. Powers this dashboard.
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">🔗 Obsidian Integration</h2>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                Obsidian Tri-Vault is the personal knowledge base. Agents can capture notes via{" "}
                <code className="text-blue-400">!capture</code> commands and read vault contents.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-medium text-white text-xs mb-1">Capture Commands</div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div><code>!capture &lt;text&gt;</code> → Inbox</div>
                    <div><code>!homework &lt;title&gt;</code> → Homework</div>
                    <div><code>!draft &lt;title&gt;</code> → Draft note</div>
                    <div><code>!daily</code> → Daily note</div>
                    <div><code>!weekly</code> → Weekly review</div>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-medium text-white text-xs mb-1">Data Flow</div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Tasks synced from Obsidian → mc_tasks</div>
                    <div>Inbox count tracked in mc_metrics</div>
                    <div>Vault stats available at /api/obsidian</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">📡 Capture Endpoints</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-800 rounded-lg font-mono">
                <span className="text-green-400">POST</span>{" "}
                <span className="text-blue-400">/api/learnings</span>
                <div className="text-gray-500 mt-1">
                  {`{ agent, type, title, content, category, context, source, tags }`}
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg font-mono">
                <span className="text-green-400">POST</span>{" "}
                <span className="text-blue-400">/api/memories</span>
                <div className="text-gray-500 mt-1">
                  {`{ type, content, category, source }`}
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg font-mono">
                <span className="text-cyan-400">GET</span>{" "}
                <span className="text-blue-400">/api/obsidian</span>
                <div className="text-gray-500 mt-1">
                  Returns vault stats, recent notes, folder breakdown
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
