"use client"

import { useEffect, useMemo, useState, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import TARSHeader from "./TARSHeader"
import AttentionPanel from "./AttentionPanel"
import TodaySchedule from "./TodaySchedule"
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
  emailCount: number
  slackCount: number
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
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const router = useRouter()

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
      setLastRefresh(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [router])

  const filtered = useMemo(() => {
    if (venture === "all") return allItems
    return allItems.filter((item) => domainToVenture(item.domain) === venture)
  }, [allItems, venture])

  // Single unified action list — no more ATTENTION vs TASK BOARD split
  const actionItems = useMemo(() => {
    return filtered
      .filter((i) => !i.is_recurring && i.title.length > 10)
      .slice(0, 15)
  }, [filtered])

  const secondsAgo = Math.floor((Date.now() - lastRefresh) / 1000)

  return (
    <div className="space-y-6">
      <TARSHeader stats={stats} venture={venture} onVentureChange={setVenture} />

      {/* Top row: Action Items + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card card-glow lg:col-span-3">
          <AttentionPanel items={actionItems} />
        </div>
        <div className="card lg:col-span-2">
          <TodaySchedule events={calendar} />
        </div>
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

      {/* Quick access drawers with counts */}
      <div className="flex gap-3 pt-2 border-t border-space-border">
        <button
          onClick={() => setOpenDrawer("gmail")}
          className="flex-1 btn btn-secondary text-xs py-3"
        >
          Gmail {stats.emailCount > 0 && <span className="text-hud-amber ml-1">({stats.emailCount})</span>} ▸
        </button>
        <button
          onClick={() => setOpenDrawer("slack")}
          className="flex-1 btn btn-secondary text-xs py-3"
        >
          Slack {stats.slackCount > 0 && <span className="text-hud-amber ml-1">({stats.slackCount})</span>} ▸
        </button>
        <button
          onClick={() => setOpenDrawer("calendar")}
          className="flex-1 btn btn-secondary text-xs py-3"
        >
          Calendar ▸
        </button>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-[9px] text-hud-muted/30">
        auto-refresh 60s
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
