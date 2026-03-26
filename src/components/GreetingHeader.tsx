"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"

type Props = {
  stats: {
    totalItems: number
    urgentCount: number
    blockedCount: number
    pilotCount: number
    leadCount: number
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default function GreetingHeader({ stats }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-warm-text">
          {getGreeting()}, Andrew
        </h1>
        <p className="text-sm text-warm-muted mt-0.5">
          {format(new Date(), "EEEE, MMMM d, yyyy")} &middot; IntuBlade Command Center
        </p>
      </div>
      <div className="flex items-center gap-3">
        {stats.pilotCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {stats.pilotCount} Pilots
          </span>
        )}
        {stats.leadCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            {stats.leadCount} Leads
          </span>
        )}
        {stats.urgentCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700">
            {stats.urgentCount} Urgent
          </span>
        )}
        {stats.blockedCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
            {stats.blockedCount} Blocked
          </span>
        )}
        <button
          onClick={() => router.refresh()}
          className="text-sm text-warm-muted hover:text-warm-text border border-cream-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
