"use client"

import { useEffect, useState } from "react"

type PipelineData = {
  totalDeals: number
  closedWon: number
  pipelineFormatted: string
  pipeline: number
}

type Props = {
  opsItems: any[]
}

export default function VentureKPIs({ opsItems }: Props) {
  const [hubspot, setHubspot] = useState<PipelineData | null>(null)

  useEffect(() => {
    fetch("/api/hubspot/pipeline")
      .then(r => r.json())
      .then(d => { if (d.totalDeals) setHubspot(d) })
      .catch(() => {})
  }, [])

  // Compute venture stats from ops_board
  const sayvantItems = opsItems.filter(i => ["sayvant"].includes(i.domain))
  const stanfordItems = opsItems.filter(i => ["stanford", "academic"].includes(i.domain))
  const velixItems = opsItems.filter(i => ["velix"].includes(i.domain))

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* IntuBlade */}
      <div className="card border-hud-amber/20">
        <div className="section-header text-[10px] mb-2">INTUBLADE</div>
        {hubspot ? (
          <div className="space-y-1">
            <div className="text-lg font-bold text-hud-amber">{hubspot.pipelineFormatted}</div>
            <div className="text-[10px] text-hud-muted">
              {hubspot.totalDeals} deals / {hubspot.closedWon} won
            </div>
          </div>
        ) : (
          <div className="text-xs text-hud-muted">Loading pipeline...</div>
        )}
      </div>

      {/* Sayvant */}
      <div className="card border-purple-500/20">
        <div className="section-header text-[10px] mb-2 text-purple-400">SAYVANT</div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-purple-400">ACEP: green light</div>
          <div className="text-[10px] text-hud-muted">
            HITLAB manuscript in progress
          </div>
          {sayvantItems.length > 0 && (
            <div className="text-[10px] text-hud-muted">{sayvantItems.length} items tracked</div>
          )}
        </div>
      </div>

      {/* Stanford */}
      <div className="card border-blue-500/20">
        <div className="section-header text-[10px] mb-2 text-blue-400">STANFORD</div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-blue-400">2 mo left</div>
          <div className="text-[10px] text-hud-muted">
            Grad program completion
          </div>
          {stanfordItems.length > 0 && (
            <div className="text-[10px] text-hud-muted">{stanfordItems.length} items tracked</div>
          )}
        </div>
      </div>

      {/* Velix */}
      <div className="card border-green-500/20">
        <div className="section-header text-[10px] mb-2 text-hud-green">VELIX HEALTH</div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-hud-green">Setup</div>
          <div className="text-[10px] text-hud-muted">
            UCP registration pending
          </div>
          {velixItems.length > 0 && (
            <div className="text-[10px] text-hud-muted">{velixItems.length} items tracked</div>
          )}
        </div>
      </div>
    </div>
  )
}
