"use client"

import { useMemo, useState } from "react"

type Task = {
  id: string
  title: string
  status: string
  priority?: string
  assignee?: string
  link?: string
  external_id?: string
  context?: string
}

type CalendarEvent = {
  id: string
  title: string
  time?: string
  source?: string
}

type Memory = {
  id: string
  type: string
  content: string
}

type TeamMember = {
  id: string
  name: string
  role?: string
  status?: string
  currentTask?: string
}

type ContentItem = {
  id: string
  title: string
  stage?: string
}

type Stats = {
  totalTasks: number
  todoTasks: number
  inProgressTasks: number
  doneTasks: number
  urgentTasks: number
  highTasks: number
  obsidianTasks: number
  kyberTasks: number
  manualTasks: number
  workingAgents: number
  totalAgents: number
  publishedContent: number
  inboxCount: number
  homeworkOpen: number
}

const priorityRank: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

function inferSource(task: Task) {
  const id = task.external_id || ""
  if (id.startsWith("obsidian:")) return "Obsidian"
  if (id.startsWith("kyber-task:")) return "Kyberos"
  return "Manual"
}

function isOpen(task: Task) {
  return task.status === "TODO" || task.status === "IN_PROGRESS"
}

export default function DashboardClient({
  tasks,
  calendar,
  memories,
  content,
  team,
  stats,
  projects,
}: {
  tasks: Task[]
  calendar: CalendarEvent[]
  memories: Memory[]
  content: ContentItem[]
  team: TeamMember[]
  stats: Stats
  projects: any[]
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("OPEN")
  const [sourceFilter, setSourceFilter] = useState("ALL")

  const actionableTasks = useMemo(() => {
    return [...tasks]
      .filter(isOpen)
      .sort((a, b) => (priorityRank[a.priority || "MEDIUM"] ?? 9) - (priorityRank[b.priority || "MEDIUM"] ?? 9))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return actionableTasks.filter((t) => {
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.assignee || "").toLowerCase().includes(query.toLowerCase()) ||
        (t.context || "").toLowerCase().includes(query.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OPEN" && isOpen(t)) ||
        t.status === statusFilter

      const src = inferSource(t)
      const matchesSource = sourceFilter === "ALL" || src === sourceFilter

      return matchesQuery && matchesStatus && matchesSource
    })
  }, [actionableTasks, query, statusFilter, sourceFilter])

  const nextMeeting = calendar[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs text-gray-400">Mission Control</div>
          <h1 className="text-2xl md:text-3xl font-bold">Operational Dashboard</h1>
          <div className="text-xs text-gray-500 mt-1">Live priorities, not just raw data</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
          <a className="btn btn-primary text-center" href="https://discord.com/channels/1474490507148394538/1474494539824890097" target="_blank">Open #personal</a>
          <a className="btn btn-secondary text-center" href="obsidian://open?vault=Tri-Vault">Open Obsidian</a>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card"><div className="text-xs text-gray-400">Open Tasks</div><div className="text-2xl font-bold text-yellow-400">{stats.todoTasks + stats.inProgressTasks}</div></div>
        <div className="card"><div className="text-xs text-gray-400">Critical</div><div className="text-2xl font-bold text-red-400">{stats.urgentTasks + stats.highTasks}</div></div>
        <div className="card"><div className="text-xs text-gray-400">Inbox</div><div className="text-2xl font-bold text-blue-300">{stats.inboxCount}</div></div>
        <div className="card"><div className="text-xs text-gray-400">Agents Online</div><div className="text-2xl font-bold text-green-400">{stats.workingAgents}/{stats.totalAgents}</div></div>
        <div className="card"><div className="text-xs text-gray-400">Sources</div><div className="text-xs text-gray-300 mt-1">Obsidian {stats.obsidianTasks} · Kyberos {stats.kyberTasks} · Manual {stats.manualTasks}</div></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2">
          <div className="flex flex-col gap-2 mb-3">
            <h2 className="text-lg font-semibold">🔥 Do This Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="input md:col-span-2" placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="ALL">All</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <select className="select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="ALL">All Sources</option>
                <option value="Obsidian">Obsidian</option>
                <option value="Kyberos">Kyberos</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{inferSource(task)} · {task.assignee || "Unassigned"}{task.context ? ` · ${task.context}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority && <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{task.priority}</span>}
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">{task.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && <div className="text-gray-500">No matching tasks.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">📅 Next Meeting</h2>
            {nextMeeting ? (
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="font-medium text-sm">{nextMeeting.title}</div>
                <div className="text-xs text-gray-500 mt-1">{nextMeeting.time || "TBD"}</div>
              </div>
            ) : <div className="text-gray-500">No upcoming meetings.</div>}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">⚡ Quick Commands</h2>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="p-2 bg-gray-800 rounded">!capture &lt;text&gt;</div>
              <div className="p-2 bg-gray-800 rounded">!homework &lt;title&gt;</div>
              <div className="p-2 bg-gray-800 rounded">!draft &lt;title&gt;</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">🧠 Recent Memories</h2>
          <div className="space-y-2">
            {memories.slice(0, 3).map((m) => (
              <div key={m.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-purple-400 uppercase">{m.type}</div>
                <div className="text-sm text-gray-300 line-clamp-2">{m.content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">📺 Pipeline + Projects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center mb-3">
            {["IDEA", "SCRIPT", "THUMBNAIL", "FILMING", "PUBLISHED"].map((stage) => (
              <div key={stage} className="p-2 bg-gray-800 rounded-lg">
                <div className="text-lg font-bold">{content.filter((c) => c.stage === stage).length}</div>
                <div className="text-[10px] text-gray-400">{stage}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400">Projects tracked: {projects.length}</div>
        </div>
      </div>
    </div>
  )
}
