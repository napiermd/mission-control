"use client"

import { useMemo, useState, lazy, Suspense } from "react"
import TARSHeader from "./TARSHeader"
import AttentionPanel from "./AttentionPanel"
import TodaySchedule from "./TodaySchedule"
import TaskBoard from "./TaskBoard"
import WaitingOn from "./WaitingOn"
import MorningBrief from "./MorningBrief"
import SonOfAnton from "./SonOfAnton"
import Drawer from "./Drawer"
import { domainToVenture } from "./ContextSwitcher"

const GmailClient = lazy(() => import("@/app/gmail/GmailClient"))
const SlackClient = lazy(() => import("@/app/slack/SlackClient"))

type OpsBoardItem = {
  id: string
  title: string
  owner: string | null
  domain: string
  next_action: string | null
  next_action_date: string | null
  status: string
  priority?: number
  is_recurring?: boolean
  _score: number
}

type Stats = {
  totalItems: number
  urgentCount: number
  blockedCount: number
}

export default function DashboardClient({
  allItems,
  calendar,
  followUps,
  brief,
  devAgent,
  stats,
}: {
  allItems: OpsBoardItem[]
  calendar: any[]
  followUps: any[]
  brief: any
  devAgent: any
  stats: Stats
}) {
  const [venture, setVenture] = useState("all")
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (venture === "all") return allItems
    return allItems.filter((item) => domainToVenture(item.domain) === venture)
  }, [allItems, venture])

  const attention = useMemo(() => {
    return filtered.filter((i) => !i.is_recurring).slice(0, 8)
  }, [filtered])

  const actionable = useMemo(() => {
    return filtered
      .filter((i) => i.next_action && i.status !== "blocked" && !i.is_recurring)
      .slice(0, 12)
  }, [filtered])

  return (
    <div className="space-y-6">
      <TARSHeader stats={stats} venture={venture} onVentureChange={setVenture} />

      {/* Top row: Attention + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card card-glow lg:col-span-3">
          <AttentionPanel items={attention} />
        </div>
        <div className="card lg:col-span-2">
          <TodaySchedule events={calendar} />
        </div>
      </div>

      {/* Task Board */}
      <div className="card">
        <TaskBoard items={actionable} />
      </div>

      {/* Bottom row: Waiting On + Brief + Son of Anton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <WaitingOn items={followUps} />
        </div>
        <div className="card">
          <MorningBrief brief={brief} />
        </div>
        <div className="card">
          <SonOfAnton agent={devAgent} />
        </div>
      </div>

      {/* Drawer triggers */}
      <div className="flex gap-3">
        <button
          onClick={() => setOpenDrawer("gmail")}
          className="btn btn-secondary text-xs"
        >
          Gmail ▸
        </button>
        <button
          onClick={() => setOpenDrawer("slack")}
          className="btn btn-secondary text-xs"
        >
          Slack ▸
        </button>
        <button
          onClick={() => setOpenDrawer("calendar")}
          className="btn btn-secondary text-xs"
        >
          Calendar ▸
        </button>
      </div>

      {/* Drawers */}
      <Drawer open={openDrawer === "gmail"} onClose={() => setOpenDrawer(null)} title="GMAIL">
        <Suspense fallback={<div className="text-hud-muted text-xs">Loading...</div>}>
          <GmailClient />
        </Suspense>
      </Drawer>

      <Drawer open={openDrawer === "slack"} onClose={() => setOpenDrawer(null)} title="SLACK FEED">
        <Suspense fallback={<div className="text-hud-muted text-xs">Loading...</div>}>
          <SlackClient />
        </Suspense>
      </Drawer>

      <Drawer open={openDrawer === "calendar"} onClose={() => setOpenDrawer(null)} title="CALENDAR">
        <div className="text-xs text-hud-muted space-y-2">
          {calendar.map((e: any) => (
            <div key={e.id} className="flex gap-3">
              <span className="text-hud-amber shrink-0 w-16 text-right">{e.time || "TBD"}</span>
              <span className="text-hud-text">{e.title}</span>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  )
}
