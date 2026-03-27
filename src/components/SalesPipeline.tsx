"use client"

import { useEffect, useState } from "react"

type StageData = { count: number; amount: number }
type PipelineData = {
  totalDeals: number
  closedWon: number
  pipeline: number
  pipelineFormatted: string
  stages: Record<string, StageData>
}

function formatAmount(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${n}`
}

const stageColors: Record<string, string> = {
  "Lead/Prospect": "bg-hud-amber",
  "Pilot/Demo": "bg-blue-400",
  "Negotiation": "bg-purple-400",
  "Closed Won": "bg-hud-green",
}

export default function SalesPipeline() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    fetch("/api/hubspot/pipeline")
      .then(r => r.json())
      .then(d => { if (d.totalDeals) setData(d) })
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div>
        <div className="section-header mb-3">PIPELINE</div>
        <div className="text-xs text-hud-muted">Loading HubSpot...</div>
      </div>
    )
  }

  const maxCount = Math.max(...Object.values(data.stages).map(s => s.count), 1)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header flex items-center gap-2 mb-3 w-full text-left"
      >
        <span>{expanded ? "▾" : "▸"}</span>
        PIPELINE
        <span className="text-hud-text font-normal ml-2">{data.pipelineFormatted}</span>
        <span className="text-hud-muted font-normal text-[10px] ml-1">
          {data.totalDeals} deals / {data.closedWon} won
        </span>
        <a
          href="https://app.hubspot.com/contacts/47433767/objects/0-3/views/all/list"
          target="_blank"
          rel="noopener noreferrer"
          className="text-hud-amber/50 hover:text-hud-amber text-[10px] font-normal ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          [hubspot]
        </a>
      </button>
      {expanded && (
        <div className="space-y-2">
          {Object.entries(data.stages)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([stage, info]) => (
              <div key={stage} className="flex items-center gap-3 text-xs">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-hud-muted">{stage}</span>
                    <span className="text-hud-text">{info.count} / {formatAmount(info.amount)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-space-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stageColors[stage] || "bg-hud-amber"}`}
                      style={{ width: `${(info.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
