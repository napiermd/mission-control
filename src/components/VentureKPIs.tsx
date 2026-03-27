"use client"

import { useEffect, useState } from "react"

type PipelineData = {
  totalDeals: number
  closedWon: number
  pipelineFormatted: string
  pipeline: number
  error?: string
}

type Props = {
  opsItems: any[]
}

export default function VentureKPIs({ opsItems }: Props) {
  const [hubspot, setHubspot] = useState<PipelineData | null>(null)

  useEffect(() => {
    fetch("/api/hubspot/pipeline")
      .then(r => r.json())
      .then(d => setHubspot(d))
      .catch(() => {})
  }, [])

  // Dynamic counts from ops_board domains
  const byDomain = (domains: string[]) => opsItems.filter(i => domains.includes(i.domain))
  const intubladeItems = byDomain(["pilots", "leads", "ops", "rep_mgmt", "sales", "pe_outreach"])
  const sayvantItems = byDomain(["sayvant"])
  const stanfordItems = byDomain(["stanford", "academic"])
  const velixItems = byDomain(["velix", "compound_atlas"])

  // Find key milestones from ops_board titles
  const findItem = (keywords: string[]) =>
    opsItems.find(i => keywords.some(k => i.title.toLowerCase().includes(k)))

  const acepItem = findItem(["acep"])
  const hitlabItem = findItem(["hitlab", "manuscript"])
  const stanfordPaper = findItem(["stanford paper", "stanford deadline"])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* IntuBlade */}
      <div className="card border-hud-amber/20">
        <div className="section-header text-[10px] mb-2">INTUBLADE</div>
        {hubspot && hubspot.totalDeals > 0 ? (
          <div className="space-y-1">
            <div className="text-lg font-bold text-hud-amber">{hubspot.pipelineFormatted}</div>
            <div className="text-[10px] text-hud-muted">
              {hubspot.totalDeals} deals / {hubspot.closedWon} won
            </div>
          </div>
        ) : hubspot?.error ? (
          <div className="space-y-1">
            <div className="text-sm font-bold text-hud-amber">{intubladeItems.length} items</div>
            <div className="text-[10px] text-hud-muted">HubSpot unavailable</div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm text-hud-muted animate-pulse">Loading pipeline...</div>
          </div>
        )}
      </div>

      {/* Sayvant */}
      <div className="card border-purple-500/20">
        <div className="section-header text-[10px] mb-2 text-purple-400">SAYVANT</div>
        <div className="space-y-1">
          {sayvantItems.length > 0 ? (
            <>
              <div className="text-sm font-bold text-purple-400">{sayvantItems.length} active</div>
              <div className="text-[10px] text-hud-muted">
                {sayvantItems.slice(0, 2).map(i => i.title.split(' — ')[0].slice(0, 30)).join(', ')}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-purple-400">ACEP: go</div>
              <div className="text-[10px] text-hud-muted">HITLAB manuscript in progress</div>
            </>
          )}
        </div>
      </div>

      {/* Stanford */}
      <div className="card border-blue-500/20">
        <div className="section-header text-[10px] mb-2 text-blue-400">STANFORD</div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-blue-400">2 mo left</div>
          <div className="text-[10px] text-hud-muted">
            {stanfordItems.length > 0
              ? `${stanfordItems.length} items tracked`
              : "Grad program completion"}
          </div>
        </div>
      </div>

      {/* Velix */}
      <div className="card border-green-500/20">
        <div className="section-header text-[10px] mb-2 text-hud-green">VELIX HEALTH</div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-hud-green">
            {velixItems.length > 0 ? `${velixItems.length} items` : "Setup"}
          </div>
          <div className="text-[10px] text-hud-muted">
            {velixItems.length > 0
              ? velixItems[0].title.slice(0, 40)
              : "UCP registration pending"}
          </div>
        </div>
      </div>
    </div>
  )
}
