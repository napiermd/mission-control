"use client"

type AgentData = {
  id: string
  name: string
  status: string | null
  current_task: string | null
  role: string | null
} | null

const statusColor: Record<string, string> = {
  WORKING: "text-hud-green",
  ACTIVE: "text-hud-green",
  IDLE: "text-hud-muted",
  ERROR: "text-hud-red",
  OFFLINE: "text-hud-muted",
}

const statusDot: Record<string, string> = {
  WORKING: "bg-hud-green",
  ACTIVE: "bg-hud-green",
  IDLE: "bg-hud-muted",
  ERROR: "bg-hud-red",
  OFFLINE: "bg-space-border",
}

export default function SonOfAnton({ agent }: { agent: AgentData }) {
  const status = agent?.status || "OFFLINE"

  return (
    <div>
      <div className="section-header mb-3">SON OF ANTON</div>
      <div className="text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot[status] || "bg-space-border"}`} />
          <span className={statusColor[status] || "text-hud-muted"}>
            {status.toLowerCase()}
          </span>
        </div>
        {agent?.current_task && (
          <div className="text-hud-text">
            <span className="text-hud-muted">task:</span> {agent.current_task}
          </div>
        )}
        {agent?.role && (
          <div className="text-hud-muted">{agent.role}</div>
        )}
        {!agent && (
          <div className="text-hud-muted">Agent offline.</div>
        )}
      </div>
    </div>
  )
}
