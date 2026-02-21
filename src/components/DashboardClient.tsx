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
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sourceFilter, setSourceFilter] = useState("ALL")

  const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
          const matchesQuery =
            !query ||
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            (t.assignee || "").toLowerCase().includes(query.toLowerCase()) ||
            (t.context || "").toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
      const src = inferSource(t)
      const matchesSource = sourceFilter === "ALL" || src === sourceFilter
      return matchesQuery && matchesStatus && matchesSource
    })
  }, [tasks, query, statusFilter, sourceFilter])

  const focusTasks = [...tasks]
    .sort((a, b) => (priorityRank[a.priority || "MEDIUM"] ?? 9) - (priorityRank[b.priority || "MEDIUM"] ?? 9))
    .slice(0, 3)

  const nextMeeting = calendar[0]
  const timeline = calendar.slice(0, 6)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-400">Mission Control</div>
          <h1 className="text-3xl font-bold">Operational Dashboard</h1>
          <div className="text-xs text-gray-500 mt-1">Kyberos + Obsidian unified surface</div>
        </div>
        <div className="flex gap-2">
          <a className="btn btn-primary" href="/tasks">Open Tasks</a>
          <a className="btn btn-secondary" href="/calendar">Open Calendar</a>
          <a className="btn btn-secondary" href="obsidian://open?vault=Tri-Vault">Open Obsidian</a>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-gray-400">Open Tasks</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.todoTasks + stats.inProgressTasks}</div>
          <div className="text-xs text-gray-500 mt-2">Urgent {stats.urgentTasks} · High {stats.highTasks}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Inbox Items</div>
          <div className="text-3xl font-bold text-blue-300">{stats.inboxCount}</div>
          <div className="text-xs text-gray-500 mt-2">Obsidian inbox</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Agents Online</div>
          <div className="text-3xl font-bold text-green-400">{stats.workingAgents}</div>
          <div className="text-xs text-gray-500 mt-2">of {stats.totalAgents}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Content Published</div>
          <div className="text-3xl font-bold text-purple-400">{stats.publishedContent}</div>
          <div className="text-xs text-gray-500 mt-2">pipeline total {content.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Sources</div>
          <div className="text-2xl font-bold">{stats.obsidianTasks + stats.kyberTasks + stats.manualTasks}</div>
          <div className="text-xs text-gray-500 mt-2">
            Obsidian {stats.obsidianTasks} · Kyberos {stats.kyberTasks} · Manual {stats.manualTasks}
          </div>
        </div>
      </div>

      {/* Focus + Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">🔎 Task Search</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                className="input w-full md:w-64"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
          <div className="space-y-3">
            {filteredTasks.slice(0, 8).map((task) => (
              <div key={task.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {inferSource(task)} · {task.assignee || "Unassigned"}
                    {task.context ? ` · ${task.context}` : ""}
                  </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{task.priority}</span>
                    )}
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">{task.status}</span>
                  </div>
                </div>
                {task.link && (
                  <a href={task.link} className="text-xs text-blue-300 hover:text-blue-200 underline mt-2 inline-block">
                    Open in Obsidian
                  </a>
                )}
              </div>
            ))}
            {filteredTasks.length === 0 && <div className="text-gray-500">No matching tasks.</div>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">🎯 Focus</h2>
          <div className="space-y-3">
            {focusTasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-gray-500">{task.priority || "MEDIUM"} · {task.status}</div>
              </div>
            ))}
            {!focusTasks.length && <div className="text-gray-500">No focus tasks.</div>}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">📅 Next Meeting</h3>
            {nextMeeting ? (
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-sm font-medium">{nextMeeting.title}</div>
                <div className="text-xs text-gray-500">{nextMeeting.time || "TBD"}</div>
              </div>
            ) : (
              <div className="text-gray-500">No upcoming meetings.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions + Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium">Capture Thought</div>
              <div className="text-xs text-gray-500">Use Discord #personal: <code>!capture ...</code></div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium">Create Homework Note</div>
              <div className="text-xs text-gray-500">Discord #personal: <code>!homework ...</code></div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium">Draft Document</div>
              <div className="text-xs text-gray-500">Discord #personal: <code>!draft ...</code></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">🧠 Recent Memories</h2>
          <div className="space-y-3">
            {memories.slice(0, 4).map((m) => (
              <div key={m.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-purple-400 uppercase">{m.type}</div>
                <div className="text-sm text-gray-300 line-clamp-2">{m.content}</div>
              </div>
            ))}
            {memories.length === 0 && <div className="text-gray-500">No memories yet.</div>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">📦 Inbox & Homework</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium">Inbox Items</div>
              <div className="text-xs text-gray-500">{stats.inboxCount} items in Obsidian Inbox</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium">Homework Open</div>
              <div className="text-xs text-gray-500">{stats.homeworkOpen} active homework notes</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">🧭 Ontology</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="font-medium">Tasks</div>
              <div className="text-xs text-gray-500">Obsidian checkboxes + Kyberos tasks → Mission Control</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="font-medium">Calendar</div>
              <div className="text-xs text-gray-500">Kyberos activities + Google Calendar</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="font-medium">Knowledge</div>
              <div className="text-xs text-gray-500">Obsidian vault as source of truth</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="font-medium">Agents</div>
              <div className="text-xs text-gray-500">Ops/Dev/Sales/Research/Finance routing via Discord</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">🕒 Today Timeline</h2>
        <div className="space-y-2">
          {timeline.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
              <div className="text-gray-400 text-sm w-20">{e.time || "TBD"}</div>
              <div className="flex-1 truncate">{e.title}</div>
              <div className="text-xs text-gray-500">{e.source || "calendar"}</div>
            </div>
          ))}
          {timeline.length === 0 && <div className="text-gray-500">No events today.</div>}
        </div>
      </div>

      {/* Projects */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">📁 Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.slice(0, 6).map((p) => (
            <div key={p.id} className="p-3 bg-gray-800 rounded-lg">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-gray-500">
                {p.status || "active"} · {p.progress ?? "?"}%{p.context ? ` · ${p.context}` : ""}
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="text-gray-500">No projects found.</div>}
        </div>
      </div>

      {/* Team + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">👥 Team Status</h2>
          <div className="space-y-3">
            {team.slice(0, 6).map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.currentTask || member.role}</div>
                </div>
                <span className={`text-xs ${member.status === "WORKING" ? "text-green-400" : "text-gray-500"}`}>
                  {member.status || "IDLE"}
                </span>
              </div>
            ))}
            {team.length === 0 && <div className="text-gray-500">No team members.</div>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">📺 Content Pipeline</h2>
          <div className="grid grid-cols-5 gap-2 text-center">
            {["IDEA", "SCRIPT", "THUMBNAIL", "FILMING", "PUBLISHED"].map((stage) => (
              <div key={stage} className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xl font-bold">{content.filter((c) => c.stage === stage).length}</div>
                <div className="text-xs text-gray-400">{stage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
