"use client"

import { useMemo, useState } from "react"

type ContentItem = {
  id: string
  title: string
  stage: string | null
  script: string | null
  notes: string | null
  platform: string | null
  scheduled_date: string | null
  published_at: string | null
  created_at: string | null
}

type ViewMode = "pipeline" | "calendar" | "list"

const stages = [
  { id: "IDEA", label: "💡 Ideas", color: "gray", bg: "bg-cream-100", text: "text-warm-muted", dot: "bg-gray-400" },
  { id: "SCRIPT", label: "📝 Script", color: "purple", bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  { id: "THUMBNAIL", label: "🖼️ Thumbnail", color: "yellow", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-yellow-400" },
  { id: "FILMING", label: "🎬 Filming", color: "blue", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  { id: "PUBLISHED", label: "✅ Published", color: "green", bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400" },
]

const platformIcons: Record<string, string> = {
  tiktok: "🎵",
  youtube: "📺",
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  blog: "📝",
}

export default function PipelineClient({ content }: { content: ContentItem[] }) {
  const [view, setView] = useState<ViewMode>("pipeline")
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [stageFilter, setStageFilter] = useState("ALL")
  const [editingScript, setEditingScript] = useState<string | null>(null)
  const [scriptDraft, setScriptDraft] = useState("")

  const filtered = useMemo(() => {
    if (stageFilter === "ALL") return content
    return content.filter((c) => c.stage === stageFilter)
  }, [content, stageFilter])

  const stageOf = (s: string | null) => stages.find((st) => st.id === s) || stages[0]

  // Save script via API
  const saveScript = async (id: string) => {
    try {
      await fetch("/api/content/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, script: scriptDraft }),
      })
    } catch {}
    setEditingScript(null)
  }

  // PIPELINE VIEW
  const renderPipeline = () => (
    <div>
      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex gap-2">
          {stages.map((s) => {
            const count = content.filter((c) => c.stage === s.id).length
            const pct = content.length > 0 ? Math.round((count / content.length) * 100) : 0
            return (
              <div key={s.id} className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-warm-muted">{s.label}</span>
                  <span className={s.text}>{count}</span>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const items = filtered.filter((c) => c.stage === stage.id)
          return (
            <div key={stage.id} className="card min-h-[200px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cream-200">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                <span className={`text-sm font-semibold ${stage.text}`}>{stage.label}</span>
                <span className="text-xs text-warm-muted ml-auto">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer hover:brightness-110 transition ${stage.bg}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="text-sm font-medium">{item.title}</div>
                    {item.platform && (
                      <div className="text-[10px] text-warm-muted mt-1">{platformIcons[item.platform.toLowerCase()] || "📄"} {item.platform}</div>
                    )}
                    {item.notes && <div className="text-[10px] text-warm-muted/70 mt-1 line-clamp-2">{item.notes}</div>}
                    {item.scheduled_date && <div className="text-[10px] text-amber-600 mt-1">📅 {item.scheduled_date}</div>}
                  </div>
                ))}
                {items.length === 0 && <div className="text-center py-6 text-warm-muted/70 text-xs">Empty</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // CALENDAR VIEW — weekly posting schedule
  const renderCalendar = () => {
    const scheduled = content.filter((c) => c.scheduled_date || c.published_at)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    // Group by day-of-week from scheduled_date
    const byDay = days.map((day, i) => ({
      day,
      items: scheduled.filter((c) => {
        const d = c.scheduled_date || c.published_at
        if (!d) return false
        try {
          const date = new Date(d)
          const dow = date.getDay()
          return dow === (i + 1) % 7 // Mon=1..Sun=0
        } catch { return false }
      }),
    }))

    return (
      <div>
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-warm-muted mb-2">Weekly Posting Schedule</h3>
          <p className="text-xs text-warm-muted">{scheduled.length} scheduled / published items</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {byDay.map(({ day, items }) => (
            <div key={day} className="card min-h-[150px]">
              <div className="text-xs text-warm-muted font-semibold mb-2 text-center">{day}</div>
              <div className="space-y-1">
                {items.map((item) => {
                  const s = stageOf(item.stage)
                  return (
                    <div key={item.id} className={`p-2 rounded text-[10px] cursor-pointer ${s.bg} ${s.text}`} onClick={() => setSelectedItem(item)}>
                      {item.title}
                      {item.platform && <div className="opacity-60">{platformIcons[item.platform.toLowerCase()] || ""} {item.platform}</div>}
                    </div>
                  )
                })}
                {items.length === 0 && <div className="text-center text-warm-muted/50 text-[10px] py-4">—</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Unscheduled */}
        {content.filter((c) => !c.scheduled_date && !c.published_at).length > 0 && (
          <div className="card mt-4">
            <h3 className="text-sm font-semibold text-warm-muted mb-2">Unscheduled ({content.filter((c) => !c.scheduled_date && !c.published_at).length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {content.filter((c) => !c.scheduled_date && !c.published_at).map((item) => {
                const s = stageOf(item.stage)
                return (
                  <div key={item.id} className={`p-2 rounded text-xs cursor-pointer ${s.bg} ${s.text}`} onClick={() => setSelectedItem(item)}>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-[10px] opacity-60">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // LIST VIEW
  const renderList = () => (
    <div className="card">
      <div className="space-y-2">
        {filtered.map((item) => {
          const s = stageOf(item.stage)
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg cursor-pointer hover:bg-cream-200" onClick={() => setSelectedItem(item)}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                <div className="text-[10px] text-warm-muted">{item.platform || "—"} · {item.scheduled_date || "Unscheduled"}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Pipeline</h1>
          <p className="text-warm-muted text-sm mt-1">{content.length} items · {content.filter((c) => c.stage === "PUBLISHED").length} published</p>
        </div>
        <div className="flex gap-1">
          {(["pipeline", "calendar", "list"] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded text-xs capitalize ${view === v ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted hover:bg-cream-200"}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Stage Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStageFilter("ALL")} className={`px-3 py-1.5 rounded text-xs ${stageFilter === "ALL" ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted"}`}>All</button>
        {stages.map((s) => (
          <button key={s.id} onClick={() => setStageFilter(s.id)} className={`px-3 py-1.5 rounded text-xs ${stageFilter === s.id ? `${s.bg} ${s.text}` : "bg-cream-100 text-warm-muted"}`}>{s.label}</button>
        ))}
      </div>

      {/* View */}
      {view === "pipeline" && renderPipeline()}
      {view === "calendar" && renderCalendar()}
      {view === "list" && renderList()}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setSelectedItem(null); setEditingScript(null) }}>
          <div className="card max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${stageOf(selectedItem.stage).dot}`} />
                  <span className="text-sm text-warm-muted">{stageOf(selectedItem.stage).label}</span>
                  {selectedItem.platform && <span className="text-sm text-warm-muted">· {platformIcons[selectedItem.platform.toLowerCase()] || ""} {selectedItem.platform}</span>}
                </div>
              </div>
              <button onClick={() => { setSelectedItem(null); setEditingScript(null) }} className="text-warm-muted hover:text-warm-text text-xl">×</button>
            </div>

            {/* Script Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-warm-muted">Script</h3>
                <button
                  onClick={() => {
                    if (editingScript === selectedItem.id) {
                      saveScript(selectedItem.id)
                    } else {
                      setEditingScript(selectedItem.id)
                      setScriptDraft(selectedItem.script || "")
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-600"
                >
                  {editingScript === selectedItem.id ? "💾 Save" : "✏️ Edit"}
                </button>
              </div>
              {editingScript === selectedItem.id ? (
                <textarea
                  className="w-full h-40 bg-cream-100 rounded p-3 text-sm text-warm-text resize-y font-mono"
                  value={scriptDraft}
                  onChange={(e) => setScriptDraft(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="bg-cream-100 rounded p-3 text-sm text-warm-text whitespace-pre-wrap min-h-[60px]">
                  {selectedItem.script || <span className="text-warm-muted/70 italic">No script yet</span>}
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedItem.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-warm-muted mb-1">Notes</h3>
                <div className="text-sm text-warm-text">{selectedItem.notes}</div>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs text-warm-muted">
              {selectedItem.scheduled_date && <div>📅 Scheduled: {selectedItem.scheduled_date}</div>}
              {selectedItem.published_at && <div>✅ Published: {new Date(selectedItem.published_at).toLocaleDateString()}</div>}
              {selectedItem.created_at && <div>🕐 Created: {new Date(selectedItem.created_at).toLocaleDateString()}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
