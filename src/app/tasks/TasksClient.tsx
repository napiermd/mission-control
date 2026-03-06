"use client"

import { useMemo, useState } from "react"

type Task = {
  id: string
  title: string
  status: string
  priority: string | null
  assignee: string | null
  description: string | null
  link: string | null
  external_id: string | null
  context: string | null
}

const columns = [
  { id: "TODO", label: "To Do", color: "text-gray-300", dot: "bg-yellow-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "text-blue-400", dot: "bg-blue-400" },
  { id: "REVIEW", label: "Review", color: "text-purple-400", dot: "bg-purple-400" },
  { id: "DONE", label: "Done", color: "text-green-400", dot: "bg-green-400" },
]

const priorityColor: Record<string, string> = {
  URGENT: "text-red-400 bg-red-900/50 border-red-500",
  HIGH: "text-orange-400 bg-orange-900/50 border-orange-500",
  MEDIUM: "text-yellow-400 bg-yellow-900/50 border-yellow-500",
  LOW: "text-gray-400 bg-gray-700 border-gray-600",
}

function inferSource(task: Task) {
  const id = task.external_id || ""
  if (id.startsWith("obsidian:")) return "Obsidian"
  if (id.startsWith("kyber-task:")) return "KyberOS"
  return "Manual"
}

export default function TasksClient({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [query, setQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [assigneeFilter, setAssigneeFilter] = useState("ALL")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [view, setView] = useState<"kanban" | "list">("kanban")

  const assignees = useMemo(() => Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))).sort() as string[], [tasks])
  const priorities = ["URGENT", "HIGH", "MEDIUM", "LOW"]

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
      if (assigneeFilter !== "ALL" && t.assignee !== assigneeFilter) return false
      if (query) {
        const q = query.toLowerCase()
        return t.title.toLowerCase().includes(q) || (t.context || "").toLowerCase().includes(q)
      }
      return true
    })
  }, [tasks, query, priorityFilter, assigneeFilter])

  const handleDragStart = (id: string) => setDraggedId(id)

  const handleDrop = async (newStatus: string) => {
    if (!draggedId) return
    setTasks((prev) => prev.map((t) => t.id === draggedId ? { ...t, status: newStatus } : t))
    setDraggedId(null)
    // Persist to API
    try {
      await fetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggedId, status: newStatus }),
      })
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">✅ Task Board</h1>
          <p className="text-gray-400 text-sm mt-1">{tasks.length} tasks · {tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length} open</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("kanban")} className={`px-3 py-1.5 rounded text-sm ${view === "kanban" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>Kanban</button>
          <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded text-sm ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>List</button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="ALL">All Priorities</option>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="ALL">All Assignees</option>
          {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className="card min-h-[200px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h2 className={`text-sm font-semibold uppercase ${col.color}`}>{col.label}</h2>
                  <span className="text-xs text-gray-500 ml-auto">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`p-3 bg-gray-800 rounded-lg border-l-4 cursor-grab active:cursor-grabbing hover:bg-gray-750 transition-colors ${
                        priorityColor[task.priority || "LOW"]?.split(" ").pop() || "border-gray-600"
                      }`}
                    >
                      <div className="text-sm font-medium">{task.title}</div>
                      {task.description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</div>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {task.priority && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColor[task.priority] || "text-gray-400 bg-gray-700"}`}>
                            {task.priority}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">{inferSource(task)}</span>
                        {task.assignee && <span className="text-[10px] text-gray-500 ml-auto">{task.assignee}</span>}
                      </div>
                      {task.context && <div className="text-[10px] text-gray-600 mt-1">{task.context}</div>}
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">Drop tasks here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="card">
          <div className="space-y-2">
            {filtered.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full shrink-0 ${columns.find((c) => c.id === task.status)?.dot || "bg-gray-600"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  <div className="text-[10px] text-gray-500">{inferSource(task)} · {task.assignee || "Unassigned"}{task.context ? ` · ${task.context}` : ""}</div>
                </div>
                {task.priority && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${priorityColor[task.priority] || "text-gray-400 bg-gray-700"}`}>{task.priority}</span>
                )}
                <span className="text-[10px] text-gray-500 shrink-0">{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
