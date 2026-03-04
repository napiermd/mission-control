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
  DAILY: "text-blue-400 bg-blue-900/50",
  PREFERENCE: "text-purple-400 bg-purple-900/50",
  LEARNING: "text-green-400 bg-green-900/50",
  DECISION: "text-yellow-400 bg-yellow-900/50",
  PERSON: "text-pink-400 bg-pink-900/50",
  PROJECT: "text-orange-400 bg-orange-900/50",
  TODO: "text-cyan-400 bg-cyan-900/50",
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
          <h1 className="text-3xl font-bold">🧠 Memory Bank</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} of {memories.length} memories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded text-sm ${view === "grid" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-3 py-1.5 rounded text-sm ${view === "timeline" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
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
              className={`px-3 py-1.5 rounded text-xs ${typeFilter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded text-xs ${
                  typeFilter === type
                    ? (typeColors[type] || "bg-gray-700 text-white")
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
            <div key={memory.id} className="card hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs ${typeColors[memory.type] || "text-gray-400 bg-gray-700"}`}>
                  {memory.type}
                </span>
                {memory.category && (
                  <span className="text-xs text-gray-500">#{memory.category}</span>
                )}
              </div>
              <p className="text-gray-200 text-sm">{memory.content}</p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500">Source: {memory.source || "—"}</span>
                <span className="text-xs text-gray-500">{memory.date}</span>
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
                <div className="text-sm font-semibold text-gray-300">{date}</div>
                <div className="flex-1 h-px bg-gray-700" />
                <div className="text-xs text-gray-500">{items.length}</div>
              </div>
              <div className="space-y-2 ml-4 border-l-2 border-gray-700 pl-4">
                {items.map((m) => (
                  <div key={m.id} className="card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${typeColors[m.type] || "text-gray-400 bg-gray-700"}`}>
                        {m.type}
                      </span>
                      {m.category && <span className="text-xs text-gray-500">#{m.category}</span>}
                    </div>
                    <p className="text-sm text-gray-300">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🧠</div>
          <div className="text-gray-400">{query || typeFilter !== "ALL" ? "No matching memories" : "No memories yet"}</div>
        </div>
      )}
    </div>
  )
}
