"use client"

import { useMemo, useState } from "react"

type TeamMember = {
  id: string
  name: string
  role: string | null
  department: string | null
  status: string | null
  current_task: string | null
  responsibilities: string | null
}

type Learning = {
  id: string
  agent: string
  type: string
  title: string | null
  content: string
  created_at: string
}

const statusDot: Record<string, string> = {
  WORKING: "bg-green-400",
  ACTIVE: "bg-green-400",
  IDLE: "bg-gray-400",
  PENDING: "bg-yellow-400",
  ERROR: "bg-red-400",
  OFFLINE: "bg-gray-600",
}

const statusBadge: Record<string, string> = {
  WORKING: "text-green-400 bg-green-900/30",
  IDLE: "text-hud-muted bg-space-panel",
  OFFLINE: "text-hud-muted bg-space-panel",
}

const agentSkills: Record<string, { skills: string[]; tools: string[]; captures: string }> = {
  dev: {
    skills: ["Senior Developer", "DevOps Automator", "Frontend Developer", "Backend Architect", "Rapid Prototyper", "Reality Checker"],
    tools: ["GitHub CLI", "Claude Code", "Codex", "Shell", "Docker", "Supabase", "Impeccable Design"],
    captures: "Error fixes, code patterns, architecture decisions, tool gotchas",
  },
  ops: {
    skills: ["Project Manager Senior", "Sprint Prioritizer", "Analytics Reporter", "Infrastructure Maintainer"],
    tools: ["gogcli", "KyberOS Bridge", "Obsidian CLI", "Apple Reminders", "Cron"],
    captures: "Process improvements, scheduling patterns, tool preferences",
  },
  sales: {
    skills: ["Growth Hacker", "TikTok Strategist", "Content Creator", "Finance Tracker"],
    tools: ["HubSpot API", "BreezeDoc", "Email Templates", "Web Research"],
    captures: "Sales patterns, objection handling, pipeline insights, growth experiments",
  },
  research: {
    skills: ["Trend Researcher", "Feedback Synthesizer", "Legal Compliance", "Tool Evaluator"],
    tools: ["Web Search", "PDF Analysis", "Summarization", "Knowledge Base"],
    captures: "Research findings, market insights, competitive data, regulatory changes",
  },
  main: {
    skills: ["Agent Orchestrator", "Cross-domain Coordination"],
    tools: ["All tools", "Agent coordination", "Session management"],
    captures: "Cross-domain learnings, user preferences, system decisions",
  },
  academic: {
    skills: ["Research Analysis", "Study Planning", "Course Management"],
    tools: ["Web Search", "Document Analysis", "Obsidian"],
    captures: "Academic insights, course notes, study patterns",
  },
}

export default function TeamClient({ team, learnings }: { team: TeamMember[]; learnings: Learning[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const departments = useMemo(() => Array.from(new Set(team.map((m) => m.department || "General"))).sort(), [team])
  const workingCount = team.filter((m) => m.status === "WORKING").length
  const idleCount = team.filter((m) => m.status === "IDLE").length
  const offlineCount = team.filter((m) => !m.status || m.status === "OFFLINE").length

  const getAgentLearnings = (agentId: string) => learnings.filter((l) => l.agent === agentId).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Team</h1>
          <p className="text-hud-muted text-sm mt-1">{team.length} agents</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div><div className="text-xs text-hud-muted">Working</div><div className="text-2xl font-bold text-green-400">{workingCount}</div></div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <div><div className="text-xs text-hud-muted">Idle</div><div className="text-2xl font-bold text-hud-muted">{idleCount}</div></div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <div><div className="text-xs text-hud-muted">Offline</div><div className="text-2xl font-bold text-hud-muted">{offlineCount}</div></div>
        </div>
      </div>

      {/* Department Groups */}
      {departments.map((dept) => {
        const deptMembers = team.filter((m) => (m.department || "General") === dept)
        return (
          <div key={dept}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-hud-muted uppercase">{dept}</h2>
              <div className="flex-1 h-px bg-space-border" />
              <span className="text-xs text-hud-muted">{deptMembers.length}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {deptMembers.map((member) => {
                const skills = agentSkills[member.id] || { skills: [], tools: [], captures: "" }
                const agentLearnings = getAgentLearnings(member.id)
                const isExpanded = expandedId === member.id

                return (
                  <div
                    key={member.id}
                    className="card hover:border-space-border transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : member.id)}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${statusDot[member.status || "IDLE"]}`} />
                      <div className="flex-1">
                        <div className="font-bold text-lg">{member.name}</div>
                        <div className="text-sm text-hud-muted">{member.role}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${statusBadge[member.status || "IDLE"] || "text-hud-muted bg-space-panel"}`}>
                        {member.status || "IDLE"}
                      </span>
                    </div>

                    {/* Current Task */}
                    {member.current_task && (
                      <div className="mt-3 p-2 bg-space-panel rounded text-sm text-hud-text">
                        → {member.current_task}
                      </div>
                    )}

                    {/* Responsibilities */}
                    {member.responsibilities && (
                      <div className="mt-2 text-xs text-hud-muted">{member.responsibilities}</div>
                    )}

                    {/* Expand indicator */}
                    <div className="text-[10px] text-hud-muted/70 mt-2">{isExpanded ? "▾ Click to collapse" : "▸ Click for details"}</div>

                    {/* Expanded Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-space-border space-y-4">
                        {/* Skills */}
                        {skills.skills.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-hud-muted uppercase mb-2">Skills</div>
                            <div className="flex flex-wrap gap-1">
                              {skills.skills.map((s) => (
                                <span key={s} className="text-[10px] px-2 py-1 bg-space-panel rounded text-hud-text">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tools */}
                        {skills.tools.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-hud-muted uppercase mb-2">Tools</div>
                            <div className="flex flex-wrap gap-1">
                              {skills.tools.map((t) => (
                                <span key={t} className="text-[10px] px-2 py-1 bg-blue-900/30 rounded text-blue-400">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Captures */}
                        {skills.captures && (
                          <div>
                            <div className="text-xs font-semibold text-hud-muted uppercase mb-1">Captures</div>
                            <div className="text-xs text-hud-muted">{skills.captures}</div>
                          </div>
                        )}

                        {/* Recent Work */}
                        {agentLearnings.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-hud-muted uppercase mb-2">Recent Work</div>
                            <div className="space-y-1">
                              {agentLearnings.map((l) => (
                                <div key={l.id} className="text-xs p-2 bg-space-panel rounded">
                                  <span className="text-hud-muted">{new Date(l.created_at).toLocaleDateString()}</span>{" "}
                                  <span className="text-hud-text">{l.title || l.content.substring(0, 80)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Performance */}
                        <div>
                          <div className="text-xs font-semibold text-hud-muted uppercase mb-2">Performance</div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-space-panel rounded text-center">
                              <div className="text-lg font-bold text-green-400">{agentLearnings.length}</div>
                              <div className="text-[10px] text-hud-muted">Learnings</div>
                            </div>
                            <div className="p-2 bg-space-panel rounded text-center">
                              <div className="text-lg font-bold text-blue-400">{agentLearnings.filter((l) => l.type === "ERROR_FIX").length}</div>
                              <div className="text-[10px] text-hud-muted">Fixes</div>
                            </div>
                            <div className="p-2 bg-space-panel rounded text-center">
                              <div className="text-lg font-bold text-purple-400">{agentLearnings.filter((l) => l.type === "DECISION").length}</div>
                              <div className="text-[10px] text-hud-muted">Decisions</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
