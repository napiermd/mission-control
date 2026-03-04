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
  const [tab, setTab] = useState<"timeline" | "agents" | "howItWorks" | "whyDifferent" | "playbook">("timeline")

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
        <h1 className="text-3xl font-bold">📚 Learning Center</h1>
        <p className="text-gray-400 text-sm mt-1">
          How this system works, what makes it different, and everything the agents learn along the way
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
      <div className="flex gap-2 flex-wrap">
        {([
          ["timeline", "📅 Daily Log"],
          ["howItWorks", "🔧 How It Works"],
          ["whyDifferent", "⚡ Why We're Different"],
          ["playbook", "🎓 Agentic Engineering"],
          ["agents", "🤖 The Team"],
        ] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== TIMELINE TAB ===== */}
      {tab === "timeline" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Search learnings..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="select" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
              <option value="ALL">All Agents</option>
              {agents.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
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
                    <div key={l.id} className="card hover:border-gray-600 transition-colors cursor-pointer" onClick={() => l.context && toggleExpand(l.id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[l.type] || "text-gray-400 bg-gray-700"}`}>{l.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${agentColors[l.agent] || "text-gray-400 bg-gray-700"}`}>{l.agent}</span>
                        {l.category && <span className="text-xs text-gray-500">#{l.category}</span>}
                        <span className="text-xs text-gray-600 ml-auto">{new Date(l.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                      {l.title && <div className="font-medium text-sm mb-1">{l.title}</div>}
                      <div className="text-sm text-gray-300">{l.content}</div>
                      {l.tags && l.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">{l.tags.map((tag) => <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{tag}</span>)}</div>
                      )}
                      {l.context && expandedIds.has(l.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500"><span className="text-gray-400 font-medium">Context:</span> {l.context}</div>
                      )}
                      {l.context && !expandedIds.has(l.id) && <div className="text-xs text-gray-600 mt-2">▸ Click to show context</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card text-center py-16">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-gray-400">No learnings yet</div>
                <div className="text-gray-500 text-sm mt-2">Agents capture learnings automatically as they work</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== HOW IT WORKS TAB ===== */}
      {tab === "howItWorks" && (
        <div className="space-y-6">
          {/* The Big Picture */}
          <div className="card">
            <h2 className="text-xl font-bold mb-2">🏗️ The Big Picture</h2>
            <p className="text-gray-300 mb-4">
              This isn't a chatbot. It's a team of AI agents that run 24/7 on a Mac Mini, each with their own job,
              their own memory, and the ability to use real tools — write code, send emails, manage calendars,
              push to GitHub, deploy apps. They talk to you through Discord, Telegram, or wherever you want.
            </p>
            <div className="p-4 bg-gray-800 rounded-lg text-sm text-gray-300 font-mono leading-relaxed">
              <div className="text-gray-500 mb-2">{"// The architecture in plain english:"}</div>
              <div><span className="text-blue-400">You</span> → message on Discord/Telegram</div>
              <div className="ml-4">↓</div>
              <div><span className="text-green-400">OpenClaw Gateway</span> → routes to the right agent</div>
              <div className="ml-4">↓</div>
              <div><span className="text-purple-400">Agent (Tony, etc.)</span> → thinks, uses tools, takes action</div>
              <div className="ml-4">↓</div>
              <div><span className="text-yellow-400">Real-world effect</span> → code pushed, email sent, task created</div>
              <div className="ml-4">↓</div>
              <div><span className="text-cyan-400">Learning captured</span> → agent remembers for next time</div>
            </div>
          </div>

          {/* Layer by Layer */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📦 Layer by Layer</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-400 mb-1">1. The Brain — OpenClaw</h3>
                <p className="text-sm text-gray-300 mb-2">
                  OpenClaw is the orchestration layer. It's an open-source framework that turns AI models (Claude, GPT, etc.)
                  into persistent agents with memory, tools, and messaging. Think of it as the operating system for your AI team.
                </p>
                <div className="text-xs text-gray-500">
                  Key concepts: Gateway (always-on daemon), Sessions (conversations), Skills (capabilities), Memory (persistent knowledge)
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-400 mb-1">2. The Agents — Specialized Workers</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Each agent has a specific job and personality. Tony (dev) writes code and manages GitHub.
                  Ops handles calendar and email. Sales manages the pipeline. They don't step on each other's toes —
                  if you ask Tony about your calendar, he'll redirect you to Ops.
                </p>
                <div className="text-xs text-gray-500">
                  Each agent has: SOUL.md (personality), AGENTS.md (instructions), MEMORY.md (what they've learned), TOOLS.md (what they can use)
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-400 mb-1">3. The Tools — Real Actions</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Agents aren't just talking — they're doing. They can run shell commands, call APIs, read/write files,
                  control browsers, manage git repos, send messages across platforms. When Tony says "I'll fix that bug,"
                  he actually opens the file, writes the fix, commits it, and pushes a PR.
                </p>
                <div className="text-xs text-gray-500">
                  Tools include: exec (shell), GitHub CLI, web browser, Supabase, Google Workspace (gogcli), Obsidian, 1Password, and more
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-400 mb-1">4. The Memory — Agents That Learn</h3>
                <p className="text-sm text-gray-300 mb-2">
                  This is what makes it compound. Every time an agent discovers something — an error fix, a pattern,
                  a user preference — it gets captured. Next time a similar situation comes up, they already know.
                  Memory lives in markdown files (MEMORY.md) AND in this database (mc_learnings).
                </p>
                <div className="text-xs text-gray-500">
                  Three layers: MEMORY.md (curated, permanent), daily logs (memory/YYYY-MM-DD.md), database (mc_learnings — powers this dashboard)
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-cyan-500">
                <h3 className="font-bold text-cyan-400 mb-1">5. The Dashboard — Mission Control</h3>
                <p className="text-sm text-gray-300 mb-2">
                  You're looking at it. This is the control plane — tasks, calendar, team status, memory bank,
                  and this Learning Center. It's a Next.js app backed by Supabase, deployed on Vercel.
                  Agents post data here in real time as they work.
                </p>
                <div className="text-xs text-gray-500">
                  Stack: Next.js 14, Supabase (Postgres), Tailwind CSS, Vercel. All data flows through REST APIs.
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-pink-500">
                <h3 className="font-bold text-pink-400 mb-1">6. The Knowledge Base — Obsidian</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Obsidian is the personal knowledge vault — plain markdown files organized into folders.
                  Agents can capture notes into the Inbox, create daily notes, and search the vault.
                  It's the human-readable archive of everything.
                </p>
                <div className="text-xs text-gray-500">
                  Vault: Tri-Vault. Agents interact via CLI tools (!capture, !homework, !draft, !daily, !weekly)
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🔄 How Data Flows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-sm mb-2">📥 When you send a message</h3>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Message hits Discord/Telegram</li>
                  <li>OpenClaw Gateway receives it</li>
                  <li>Routes to correct agent based on channel</li>
                  <li>Agent loads its memory (MEMORY.md + recent logs)</li>
                  <li>Agent thinks + uses tools to respond</li>
                  <li>Response sent back to you</li>
                  <li>If something was learned, it's captured automatically</li>
                </ol>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-sm mb-2">⏰ On a schedule (cron jobs)</h3>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Cron fires at configured time (e.g., 7AM daily)</li>
                  <li>Agent wakes up in isolated session</li>
                  <li>Pulls data from APIs (calendar, email, tasks)</li>
                  <li>Compiles briefing or runs checks</li>
                  <li>Sends summary to your preferred channel</li>
                  <li>Goes back to sleep until next trigger</li>
                </ol>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-sm mb-2">🧠 When something is learned</h3>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Agent encounters something new (error, pattern, preference)</li>
                  <li>Posts to /api/learnings with structured data</li>
                  <li>Also writes to local memory/YYYY-MM-DD.md file</li>
                  <li>Shows up here in the Learning Center instantly</li>
                  <li>Weekly: important learnings get curated into MEMORY.md</li>
                  <li>Next session: agent recalls via memory_search</li>
                </ol>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-sm mb-2">🛠️ When code is built</h3>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>You describe what you want</li>
                  <li>Tony (dev agent) plans the approach</li>
                  <li>Can spawn sub-agents (Claude Code, Codex) for heavy work</li>
                  <li>Writes code directly to the filesystem</li>
                  <li>Commits and pushes to GitHub</li>
                  <li>Vercel auto-deploys from the push</li>
                </ol>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📡 API Endpoints</h2>
            <div className="space-y-2 text-xs">
              {[
                { method: "POST", path: "/api/learnings", desc: "Capture a new learning", body: "{ agent, type, title, content, category, context, tags }" },
                { method: "GET", path: "/api/learnings", desc: "Fetch learnings", body: "?agent=dev&type=LEARNING&days=30" },
                { method: "POST", path: "/api/memories", desc: "Capture a memory", body: "{ type, content, category, source }" },
                { method: "GET", path: "/api/obsidian", desc: "Vault stats", body: "Returns inboxCount, totalNotes, recentNotes, folders" },
              ].map((ep) => (
                <div key={ep.path + ep.method} className="p-3 bg-gray-800 rounded-lg font-mono">
                  <span className={ep.method === "POST" ? "text-green-400" : "text-cyan-400"}>{ep.method}</span>{" "}
                  <span className="text-blue-400">{ep.path}</span>
                  <span className="text-gray-500 ml-2">— {ep.desc}</span>
                  <div className="text-gray-600 mt-1">{ep.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== WHY WE'RE DIFFERENT TAB ===== */}
      {tab === "whyDifferent" && (
        <div className="space-y-6">
          <div className="card border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-2">⚡ This Isn't ChatGPT</h2>
            <p className="text-gray-300">
              Most people use AI as a search engine with personality. Ask a question, get an answer, close the tab.
              That's like buying a sports car and only using it to listen to the radio. Here's what's actually happening here:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-bold text-red-400 mb-3">❌ What most people do</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-red-400">•</span> Use ChatGPT for one-off questions</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> Copy-paste code from AI into their editor</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> Manually manage tasks, email, calendar</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> No memory between conversations</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> AI can only talk, can't take action</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> One generic AI for everything</li>
                <li className="flex gap-2"><span className="text-red-400">•</span> Start from scratch every session</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="font-bold text-green-400 mb-3">✅ What we do</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-green-400">•</span> Persistent agents that run 24/7 on our hardware</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Agents write, commit, and deploy code themselves</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Automated briefings, task management, email triage</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Memory that compounds — agents learn and remember</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Real tools: shell, git, APIs, browsers, databases</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Specialized agents for dev, ops, sales, research</li>
                <li className="flex gap-2"><span className="text-green-400">•</span> Each session builds on everything before it</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">🔑 The Key Differences</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Persistence",
                  icon: "🔄",
                  color: "blue",
                  what: "Agents don't forget. They have memory files that persist across every conversation. When Tony learns that your Supabase service key needs biometric auth, he remembers forever. Traditional AI starts fresh every time.",
                },
                {
                  title: "Agency",
                  icon: "🎬",
                  color: "green",
                  what: "These agents don't just suggest — they do. \"Fix this bug\" → agent reads the code, writes the fix, runs tests, commits, pushes, and deploys. You get a notification when it's done. Traditional AI gives you a code snippet to copy.",
                },
                {
                  title: "Specialization",
                  icon: "🎯",
                  color: "purple",
                  what: "Each agent is an expert in their domain. Tony knows your entire codebase, your tech stack preferences, your commit style. Ops knows your calendar patterns and email priorities. A generic ChatGPT knows none of this.",
                },
                {
                  title: "Orchestration",
                  icon: "🎵",
                  color: "yellow",
                  what: "Agents can spawn sub-agents for parallel work. Need 5 PRs reviewed? Tony spawns 5 Codex instances, one per PR, running simultaneously. Need a complex feature? Tony architects it, spawns Claude Code to build it, monitors progress.",
                },
                {
                  title: "Infrastructure",
                  icon: "🏠",
                  color: "cyan",
                  what: "This runs on YOUR hardware (Mac Mini), not someone else's cloud. Your data stays local. Agents have access to your filesystem, your local tools, your network. It's like having employees with actual desk access, not contractors working from a café.",
                },
                {
                  title: "Compounding",
                  icon: "📈",
                  color: "pink",
                  what: "Every interaction makes the system smarter. Learnings get captured, patterns get recognized, mistakes don't repeat. Three months from now, these agents will be dramatically more effective than today. That's impossible with stateless AI.",
                },
              ].map((item) => (
                <div key={item.title} className={`p-4 bg-gray-800 rounded-lg border-l-4 border-${item.color}-500`}>
                  <h3 className="font-bold mb-1">{item.icon} {item.title}</h3>
                  <p className="text-sm text-gray-300">{item.what}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-r from-gray-800 to-gray-900">
            <h2 className="text-xl font-bold mb-2">💡 The Bottom Line</h2>
            <p className="text-gray-300 text-lg">
              Most people are using AI like a calculator. We're building an operating system.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              The gap between "I use ChatGPT sometimes" and "I have a team of AI agents running my operations"
              is the same gap between having a smartphone and having a smartphone with apps, integrations,
              automation, and workflows. Same hardware. Completely different capability.
            </p>
          </div>
        </div>
      )}

      {/* ===== AGENTIC ENGINEERING PLAYBOOK ===== */}
      {tab === "playbook" && (
        <div className="space-y-6">
          <div className="card border-l-4 border-purple-500">
            <h2 className="text-xl font-bold mb-2">🎓 The Agentic Engineering Playbook</h2>
            <p className="text-gray-300">
              Agentic engineering is the practice of building, deploying, and managing AI agents that take autonomous action.
              It's not prompt engineering. It's not vibe coding. It's a new discipline — and here's how it works.
            </p>
          </div>

          {/* Core Concepts */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">📖 Core Concepts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  term: "Agent",
                  def: "An AI model + memory + tools + instructions. Not just a chatbot — an entity that can take action, remember context, and improve over time.",
                  example: "Tony is an agent: Claude model + GitHub tools + code memory + dev-focused instructions.",
                },
                {
                  term: "Tool Use",
                  def: "Giving AI the ability to call functions — read files, run commands, hit APIs, control browsers. This is what turns a language model into something that can actually DO things.",
                  example: "When Tony runs `gh pr create`, that's tool use — the AI deciding to execute a real command.",
                },
                {
                  term: "Memory",
                  def: "Persistent state that survives between conversations. Without memory, every session starts from zero. With memory, agents compound knowledge over time.",
                  example: "MEMORY.md stores curated knowledge. Daily logs capture raw learnings. mc_learnings database powers this dashboard.",
                },
                {
                  term: "Orchestration",
                  def: "Coordinating multiple agents or sub-processes. One agent can spawn others, delegate tasks, monitor progress, and synthesize results.",
                  example: "Tony spawns 3 Claude Code instances to fix 3 bugs in parallel, then reviews all the PRs.",
                },
                {
                  term: "Session",
                  def: "A conversation context. Can be interactive (you chatting) or autonomous (cron-triggered). Sessions maintain conversation history and can be isolated or shared.",
                  example: "Morning briefing runs in an isolated session — agent wakes, gathers data, sends summary, goes back to sleep.",
                },
                {
                  term: "Skill",
                  def: "A packaged capability — instructions + scripts + assets that teach an agent how to do something specific. Reusable and shareable.",
                  example: "The 'github' skill teaches any agent how to use the gh CLI for PRs, issues, CI, and code review.",
                },
                {
                  term: "Gateway",
                  def: "The always-on daemon that receives messages, manages sessions, routes to agents, and handles scheduling. The backbone of the system.",
                  example: "OpenClaw Gateway runs on the Mac Mini 24/7. It's what makes agents available across Discord, Telegram, etc.",
                },
                {
                  term: "Soul",
                  def: "The personality layer. SOUL.md defines how an agent talks, what it values, its tone and style. Makes agents feel like teammates, not robots.",
                  example: "Tony's soul: 'Ship first, optimize later. Code is for humans. Test in production (but with safeguards).'",
                },
              ].map((c) => (
                <div key={c.term} className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-bold text-white mb-1">{c.term}</h3>
                  <p className="text-sm text-gray-300 mb-2">{c.def}</p>
                  <p className="text-xs text-gray-500 italic">Example: {c.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Building Your First Agent */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">🛠️ Building an Agent — Step by Step</h2>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "Choose Your Model",
                  detail: "Claude Sonnet for everyday work, Opus for complex reasoning, Haiku for fast/cheap tasks. GPT for specific coding tasks. The model is the engine — everything else is the car.",
                },
                {
                  step: 2,
                  title: "Define the Job (AGENTS.md)",
                  detail: "What does this agent do? What doesn't it do? Be specific. 'Dev agent handles code, GitHub, CI/CD. Does NOT handle email or calendar.' Clear boundaries prevent chaos.",
                },
                {
                  step: 3,
                  title: "Give It Personality (SOUL.md)",
                  detail: "How does it talk? Is it formal or casual? Does it explain everything or just do it? Soul makes the agent feel consistent and trustworthy across every interaction.",
                },
                {
                  step: 4,
                  title: "Connect Tools",
                  detail: "What can the agent actually do? Shell commands, APIs, file access, messaging. Each tool is a capability. More tools = more agency. But also more risk — be intentional.",
                },
                {
                  step: 5,
                  title: "Set Up Memory",
                  detail: "Create MEMORY.md for curated knowledge. Set up daily log capture. Connect to a database for structured storage. Memory is what separates a toy from a tool.",
                },
                {
                  step: 6,
                  title: "Test in Production (Carefully)",
                  detail: "Start with low-stakes tasks. Monitor everything. Review the agent's actions. Gradually increase autonomy as trust builds. Never go full-auto on day one.",
                },
                {
                  step: 7,
                  title: "Iterate Based on Learnings",
                  detail: "Read the daily logs. What went wrong? What was slow? What did the agent misunderstand? Update instructions, add guardrails, refine the soul. This is the real work of agentic engineering.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 w-8 shrink-0">{s.step}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-400">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Principles */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">⚖️ Principles of Agentic Engineering</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { principle: "Autonomy with guardrails", detail: "Give agents freedom to act, but set clear boundaries. Full-auto for low-risk tasks. Human approval for high-risk ones." },
                { principle: "Memory is the moat", detail: "Any AI can answer questions. An AI that remembers your preferences, past mistakes, and accumulated context is 10x more valuable." },
                { principle: "Specialize, don't generalize", detail: "One agent doing everything is worse than five agents doing one thing each. Specialization = better context, fewer mistakes." },
                { principle: "Ship, then refine", detail: "The first version of any agent setup will be rough. That's fine. Deploy it, learn from it, improve it. Perfection is the enemy of progress." },
                { principle: "Observe relentlessly", detail: "Read the logs. Watch what agents do. The gap between what you think they'll do and what they actually do is where the learning happens." },
                { principle: "Compound, don't restart", detail: "Every session should make the system smarter. Capture learnings. Update memory. Refine instructions. The whole point is that tomorrow is better than today." },
              ].map((p) => (
                <div key={p.principle} className="p-3 bg-gray-800 rounded-lg">
                  <h3 className="font-bold text-sm text-white mb-1">{p.principle}</h3>
                  <p className="text-xs text-gray-400">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">🚫 Common Mistakes</h2>
            <div className="space-y-2">
              {[
                { mistake: "Giving an agent too much scope", fix: "Split into specialized agents with clear boundaries." },
                { mistake: "No memory strategy", fix: "Set up MEMORY.md + daily logs + database capture from day one." },
                { mistake: "Going full-auto immediately", fix: "Start supervised. Increase autonomy as you build trust." },
                { mistake: "Ignoring the soul/personality", fix: "Agents without personality feel robotic and inconsistent. SOUL.md matters." },
                { mistake: "Not reading the logs", fix: "If you're not reviewing what agents do, you're flying blind." },
                { mistake: "Treating AI like a search engine", fix: "The power is in agency — actions, not answers. Give agents tools and let them work." },
                { mistake: "Building on someone else's cloud only", fix: "Run on your hardware when possible. Your data, your control, your uptime." },
              ].map((m) => (
                <div key={m.mistake} className="flex gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-red-400 shrink-0">✗</span>
                  <div>
                    <span className="text-gray-300 text-sm">{m.mistake}</span>
                    <span className="text-gray-500 text-sm"> → </span>
                    <span className="text-green-400 text-sm">{m.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== THE TEAM TAB ===== */}
      {tab === "agents" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-2">🤖 The Agent Team</h2>
            <p className="text-gray-400 text-sm">
              Each agent is a specialized AI worker with its own personality, tools, memory, and domain expertise.
              They don't overlap — if something isn't their job, they redirect to the right agent.
            </p>
          </div>

          {[
            {
              name: "Tony",
              id: "dev",
              emoji: "🔧",
              role: "Development Agent",
              personality: "Ship-it mentality. Code-first. Thinks like Tony Stark — builder, not bureaucrat.",
              responsibilities: [
                "GitHub operations — PRs, issues, CI, code review",
                "Code assistance — debugging, refactoring, architecture",
                "Deployment & DevOps — Docker, CI/CD, monitoring",
                "Side projects — indie apps, rapid prototyping",
                "Spawning sub-agents (Codex, Claude Code) for heavy lifting",
              ],
              tools: ["GitHub CLI (gh)", "Claude Code / Codex", "Shell commands", "File system", "Web browser", "Supabase", "Docker"],
              memory: "Knows your entire tech stack, commit style, architecture preferences. Learns from every bug fix and code review.",
              motto: "\"Ship first, optimize later. Fast beats perfect. Done beats planned.\"",
            },
            {
              name: "Ops",
              id: "ops",
              emoji: "📋",
              role: "Operations Agent",
              personality: "Organized, proactive, anticipates needs. The chief of staff.",
              responsibilities: [
                "Morning briefings — calendar, tasks, health data, priority emails",
                "Calendar management via Google Workspace",
                "Task coordination across Obsidian and KyberOS",
                "Email triage and response drafting",
                "Evening summaries and next-day prep",
              ],
              tools: ["gogcli (Google Workspace)", "KyberOS bridge", "Obsidian CLI", "Apple Reminders", "Cron scheduling"],
              memory: "Tracks your routines, meeting patterns, task preferences. Gets better at prioritizing what matters.",
              motto: "\"Anticipate, don't react. The best ops is invisible.\"",
            },
            {
              name: "Sales",
              id: "sales",
              emoji: "💰",
              role: "Sales Agent",
              personality: "Results-driven, relationship-focused, pipeline-obsessed.",
              responsibilities: [
                "HubSpot CRM management",
                "Pipeline tracking and deal status",
                "Outreach and follow-up coordination",
                "Sales collateral and proposals",
                "Revenue metrics and forecasting",
              ],
              tools: ["HubSpot API", "BreezeDoc (e-signatures)", "Email templates", "Web research"],
              memory: "Knows your sales process, deal stages, key contacts, objection patterns, win/loss reasons.",
              motto: "\"Pipeline is truth. Everything else is storytelling.\"",
            },
            {
              name: "Research",
              id: "research",
              emoji: "🔬",
              role: "Research Agent",
              personality: "Thorough, analytical, connects dots across domains.",
              responsibilities: [
                "Market research and competitive analysis",
                "Academic paper review and summarization",
                "Technology landscape scanning",
                "Data analysis and insights",
                "Strategic recommendations",
              ],
              tools: ["Web search (Brave)", "Web fetch", "PDF analysis", "Summarization"],
              memory: "Builds a knowledge graph of your industry, competitors, and strategic priorities.",
              motto: "\"The answer is in the data. You just have to know where to look.\"",
            },
          ].map((agent) => {
            const agentLearnings = learnings.filter((l) => l.agent === agent.id)
            return (
              <div key={agent.id} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{agent.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold">{agent.name}</h2>
                    <div className="text-sm text-gray-400">{agent.role}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold text-green-400">{agentLearnings.length}</div>
                    <div className="text-xs text-gray-500">learnings</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4 italic">{agent.personality}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Responsibilities</h3>
                    <ul className="space-y-1">
                      {agent.responsibilities.map((r) => (
                        <li key={r} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-gray-600">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Tools</h3>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tools.map((t) => (
                        <span key={t} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">{t}</span>
                      ))}
                    </div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Memory</h3>
                    <p className="text-xs text-gray-400">{agent.memory}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700 text-sm text-gray-500 italic">{agent.motto}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
