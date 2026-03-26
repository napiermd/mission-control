"use client"

import { useMemo, useState } from "react"
import GreetingHeader from "./GreetingHeader"
import KPICards from "./KPICards"
import ConstraintsList from "./ConstraintsList"
import TaskBoard from "./TaskBoard"
import ContextSwitcher, { domainToVenture } from "./ContextSwitcher"

type KPI = { label: string; value: string; detail?: string }

type HeaderStats = {
  totalItems: number
  urgentCount: number
  blockedCount: number
  pilotCount: number
  leadCount: number
}

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

export default function DashboardClient({
  allItems,
  kpis,
  headerStats,
}: {
  allItems: OpsBoardItem[]
  kpis: KPI[]
  headerStats: HeaderStats
}) {
  const [venture, setVenture] = useState("all")

  const filtered = useMemo(() => {
    if (venture === "all") return allItems
    return allItems.filter((item) => domainToVenture(item.domain) === venture)
  }, [allItems, venture])

  const constraints = useMemo(() => {
    return filtered.filter((i) => !i.is_recurring).slice(0, 12)
  }, [filtered])

  const actionableItems = useMemo(() => {
    return filtered
      .filter((i) => i.next_action && i.status !== "blocked" && !i.is_recurring)
      .slice(0, 15)
  }, [filtered])

  // Recompute KPIs based on venture filter
  const filteredKpis = useMemo(() => {
    if (venture === "all") return kpis
    const items = filtered
    const openCount = items.filter((i) => i.status === "open").length
    const blockedCount = items.filter((i) => i.status === "blocked").length
    const urgentCount = items.filter((i) => (i.priority ?? 3) <= 1).length
    return [
      { label: "Active", value: String(items.length), detail: `${openCount} open` },
      { label: "Urgent", value: String(urgentCount), detail: "priority 1" },
      { label: "Blocked", value: String(blockedCount), detail: "needs attention" },
      { label: "Actionable", value: String(actionableItems.length), detail: "with next steps" },
    ]
  }, [venture, filtered, kpis, actionableItems])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <GreetingHeader stats={headerStats} />
      </div>
      <ContextSwitcher active={venture} onChange={setVenture} />
      <KPICards kpis={filteredKpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <ConstraintsList items={constraints} />
        </div>
        <div className="card">
          <TaskBoard items={actionableItems} />
        </div>
      </div>
    </div>
  )
}
