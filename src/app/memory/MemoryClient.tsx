"use client"

import { useMemo, useState } from "react"

type Memory = {
  id: string
  type: string
  content: string
  date: string
  category: string | null
  source: string | null
}

const typeColors: Record<string, string> = {
  DAILY: "text-blue-600 bg-blue-50",
  PREFERENCE: "text-purple-600 bg-purple-50",
  LEARNING: "text-green-600 bg-green-50",
  DECISION: "text-amber-600 bg-amber-50",
  PERSON: "text-pink-600 bg-pink-50",
  PROJECT: "text-orange-600 bg-orange-50",
  TODO: "text-cyan-600 bg-cyan-50",
}

export default function MemoryClient({ memories }: { memories: Memory[] }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [view, setView] = useState<"grid" | "timeline">("grid")

  const types = useMemo(() => Array.from(new Set(memories.map((m) => m.type))).sort(), [memories])

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          m.content.toLowerCase().includes(q) ||
          (m.category || "").toLowerCase().includes(q) ||
          (m.source || "").toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [memories, typeFilter, query])

  const grouped = useMemo(() => {
    const groups: Record<string, Memory[]> = {}
    for (const m of filtered) {
      const date = m.date || "Unknown"
      if (!groups[date]) groups[date] = []
      groups[date].push(m)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Memory Bank</h1>
          <p className="text-warm-muted text-sm mt-1">{filtered.length} of {memories.length} memories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded text-sm ${view === "grid" ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted"}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-3 py-1.5 rounded text-sm ${view === "timeline" ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted"}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search memories..."
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1.5 rounded text-xs ${typeFilter === "ALL" ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted hover:bg-cream-200"}`}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded text-xs ${
                  typeFilter === type
                    ? (typeColors[type] || "bg-cream-200 text-warm-text")
                    : "bg-cream-100 text-warm-muted hover:bg-cream-200"
                }`}
              >
                {type} ({memories.filter((m) => m.type === type).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="card hover:border-cream-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs ${typeColors[memory.type] || "text-warm-muted bg-cream-100"}`}>
                  {memory.type}
                </span>
                {memory.category && (
                  <span className="text-xs text-warm-muted">#{memory.category}</span>
                )}
              </div>
              <p className="text-warm-text text-sm">{memory.content}</p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-cream-200">
                <span className="text-xs text-warm-muted">Source: {memory.source || "—"}</span>
                <span className="text-xs text-warm-muted">{memory.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-semibold text-warm-text">{date}</div>
                <div className="flex-1 h-px bg-cream-200" />
                <div className="text-xs text-warm-muted">{items.length}</div>
              </div>
              <div className="space-y-2 ml-4 border-l-2 border-cream-200 pl-4">
                {items.map((m) => (
                  <div key={m.id} className="card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${typeColors[m.type] || "text-warm-muted bg-cream-100"}`}>
                        {m.type}
                      </span>
                      {m.category && <span className="text-xs text-warm-muted">#{m.category}</span>}
                    </div>
                    <p className="text-sm text-warm-text">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-warm-muted">{query || typeFilter !== "ALL" ? "No matching memories" : "No memories yet"}</div>
        </div>
      )}
    </div>
  )
}
