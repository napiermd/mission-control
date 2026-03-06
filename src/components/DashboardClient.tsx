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
  department?: string
  status?: string
  current_task?: string
  responsibilities?: string
}

type ContentItem = {
  id: string
  title: string
  stage?: string
}

type Learning = {
  id: string
  agent: string
  type: string
  title: string | null
  content: string
  created_at: string
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

const priorityRank: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

const statusDot: Record<string, string> = {
  WORKING: "bg-green-400",
  ACTIVE: "bg-green-400",
  IDLE: "bg-gray-400",
  PENDING: "bg-yellow-400",
  ERROR: "bg-red-400",
  OFFLINE: "bg-gray-600",
}

const priorityColor: Record<string, string> = {
  URGENT: "text-red-400 bg-red-900/50",
  HIGH: "text-orange-400 bg-orange-900/50",
  MEDIUM: "text-yellow-400 bg-yellow-900/50",
  LOW: "text-gray-400 bg-gray-700",
}

function inferSource(task: Task) {
  const id = task.external_id || ""
  if (id.startsWith("obsidian:")) return "Obsidian"
  if (id.startsWith("kyber-task:")) return "KyberOS"
  return "Manual"
}

function isOpen(task: Task) {
  return task.status === "TODO" || task.status === "IN_PROGRESS"
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DashboardClient({
  tasks,
  calendar,
  memories,
  content,
  team,
  stats,
  projects,
  learnings,
}: {
  tasks: Task[]
  calendar: CalendarEvent[]
  memories: Memory[]
  content: ContentItem[]
  team: TeamMember[]
  stats: Stats
  projects: any[]
  learnings?: Learning[]
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("OPEN")

  const actionableTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => {
        if (statusFilter === "OPEN") return isOpen(t)
        if (statusFilter === "ALL") return true
        return t.status === statusFilter
      })
      .filter((t) => !query || t.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (priorityRank[a.priority || "MEDIUM"] ?? 9) - (priorityRank[b.priority || "MEDIUM"] ?? 9))
  }, [tasks, query, statusFilter])

  const upcomingEvents = calendar.slice(0, 4)
  const recentLearnings = (learnings || []).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">Mission Control</div>
        <h1 className="text-2xl md:text-3xl font-bold">Command Center</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="card">
          <div className="text-xs text-gray-400">Active Tasks</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.todoTasks + stats.inProgressTasks}</div>
          <div className="text-[10px] text-gray-500">{stats.todoTasks} todo · {stats.inProgressTasks} in progress</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Pipeline</div>
          <div className="text-2xl font-bold text-purple-400">{content.length}</div>
          <div className="text-[10px] text-gray-500">{stats.publishedContent} published</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Next 48h</div>
          <div className="text-2xl font-bold text-blue-400">{upcomingEvents.length}</div>
          <div className="text-[10px] text-gray-500">events</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Agent Activity</div>
          <div className="text-2xl font-bold text-green-400">{recentLearnings.length}</div>
          <div className="text-[10px] text-gray-500">recent actions</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Critical</div>
          <div className="text-2xl font-bold text-red-400">{stats.urgentTasks + stats.highTasks}</div>
          <div className="text-[10px] text-gray-500">urgent + high</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Agents</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.workingAgents}<span className="text-gray-500 text-sm">/{stats.totalAgents}</span></div>
          <div className="text-[10px] text-gray-500">working</div>
        </div>
      </div>

      {/* Main Grid: Activity Feed + Agent Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="card xl:col-span-2">
          <h2 className="text-lg font-semibold mb-3">📡 Live Activity Feed</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentLearnings.length > 0 ? recentLearnings.map((l) => (
              <div key={l.id} className="flex gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    l.type === "ERROR_FIX" ? "bg-red-400" :
                    l.type === "GOTCHA" ? "bg-yellow-400" :
                    l.type === "DECISION" ? "bg-purple-400" :
                    "bg-green-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-300">{l.agent}</span>
                    <span className="text-[10px] text-gray-600">{timeAgo(l.created_at)}</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-0.5 line-clamp-2">
                    {l.title || l.content}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    l.type === "ERROR_FIX" ? "text-red-400 bg-red-900/50" :
                    l.type === "GOTCHA" ? "text-orange-400 bg-orange-900/50" :
                    l.type === "PATTERN" ? "text-blue-400 bg-blue-900/50" :
                    l.type === "DECISION" ? "text-purple-400 bg-purple-900/50" :
                    "text-green-400 bg-green-900/50"
                  }`}>{l.type}</span>
                </div>
              </div>
            )) : (
              <div className="text-gray-500 text-sm p-4 text-center">
                No recent agent activity. Agents capture learnings as they work.
              </div>
            )}
          </div>
        </div>

        {/* Agent Status Panel */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">🤖 Agent Status</h2>
          <div className="space-y-2">
            {team.map((agent) => (
              <div key={agent.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusDot[agent.status || "IDLE"] || "bg-gray-600"}`} />
                  <span className="font-medium text-sm">{agent.name}</span>
                  <span className="text-[10px] text-gray-500 ml-auto">{agent.status || "IDLE"}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-4.5">{agent.role || ""}</div>
                {agent.current_task && (
                  <div className="text-xs text-gray-400 mt-1 ml-4.5 line-clamp-1">
                    → {agent.current_task}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks + Calendar Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">🔥 Priority Tasks</h2>
            <a href="/tasks" className="text-xs text-blue-400 hover:underline">View all →</a>
          </div>
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="OPEN">Open</option>
              <option value="ALL">All</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {actionableTasks.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.status === "IN_PROGRESS" ? "bg-green-400" :
                  task.status === "DONE" ? "bg-gray-500" :
                  task.priority === "URGENT" || task.priority === "HIGH" ? "bg-red-400" :
                  "bg-yellow-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  <div className="text-[10px] text-gray-500">
                    {inferSource(task)} · {task.assignee || "Unassigned"}{task.context ? ` · ${task.context}` : ""}
                  </div>
                </div>
                {task.priority && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${priorityColor[task.priority] || "text-gray-400 bg-gray-700"}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
            {actionableTasks.length === 0 && <div className="text-gray-500 text-sm">No tasks matching filters.</div>}
          </div>
        </div>

        {/* Calendar + Quick Actions */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">📅 Upcoming</h2>
              <a href="/calendar" className="text-xs text-blue-400 hover:underline">Calendar →</a>
            </div>
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <div key={event.id} className="p-2 bg-gray-800 rounded-lg mb-2 last:mb-0">
                <div className="text-sm font-medium">{event.title}</div>
                <div className="text-[10px] text-gray-500">{event.time || "TBD"} · {event.source || ""}</div>
              </div>
            )) : (
              <div className="text-gray-500 text-sm">No upcoming events</div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">🧠 Latest Memories</h2>
            {memories.slice(0, 3).map((m) => (
              <div key={m.id} className="p-2 bg-gray-800 rounded-lg mb-2 last:mb-0">
                <div className="text-[10px] text-purple-400 uppercase">{m.type}</div>
                <div className="text-xs text-gray-300 line-clamp-2">{m.content}</div>
              </div>
            ))}
            <a href="/memory" className="text-xs text-blue-400 hover:underline mt-2 inline-block">View all →</a>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">📺 Pipeline</h2>
            <div className="grid grid-cols-5 gap-1 text-center">
              {["IDEA", "SCRIPT", "THUMB", "FILM", "PUB"].map((stage, i) => {
                const fullStage = ["IDEA", "SCRIPT", "THUMBNAIL", "FILMING", "PUBLISHED"][i]
                const count = content.filter((c) => c.stage === fullStage).length
                return (
                  <div key={stage} className="p-2 bg-gray-800 rounded">
                    <div className="text-sm font-bold">{count}</div>
                    <div className="text-[9px] text-gray-500">{stage}</div>
                  </div>
                )
              })}
            </div>
            <a href="/pipeline" className="text-xs text-blue-400 hover:underline mt-2 inline-block">View all →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
