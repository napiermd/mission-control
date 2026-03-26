"use client"

type Constraint = {
  id: string
  title: string
  owner: string | null
  domain: string
  next_action: string | null
  next_action_date: string | null
  status: string
  _score: number
}

function scoreToDot(score: number) {
  if (score >= 40) return "bg-red-500"
  if (score >= 25) return "bg-amber-500"
  return "bg-green-500"
}

function formatDueDate(dateStr: string | null) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return `overdue ${Math.abs(diff)}d`
  if (diff === 0) return "due today"
  if (diff === 1) return "due tomorrow"
  return `due ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
}

function domainLabel(domain: string) {
  const map: Record<string, string> = {
    pilots: "Pilot",
    leads: "Lead",
    ops: "Ops",
    personal: "Personal",
    rep_mgmt: "Sales",
  }
  return map[domain] || domain
}

export default function ConstraintsList({ items }: { items: Constraint[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-4">
        Today's Constraints
      </h2>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="flex gap-3 items-start">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${scoreToDot(item._score)}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-warm-text">
                <span className="font-medium">{item.title}</span>
                {item.owner && (
                  <span className="text-warm-muted"> — {item.owner}</span>
                )}
              </div>
              {item.next_action && (
                <div className="text-xs text-warm-muted mt-0.5">
                  {item.next_action}
                </div>
              )}
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cream-100 text-warm-muted">
                  {domainLabel(item.domain)}
                </span>
                {item.next_action_date && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    formatDueDate(item.next_action_date).startsWith("overdue")
                      ? "bg-red-50 text-red-600"
                      : formatDueDate(item.next_action_date).includes("today")
                        ? "bg-amber-50 text-amber-600"
                        : "bg-cream-100 text-warm-muted"
                  }`}>
                    {formatDueDate(item.next_action_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-sm text-warm-muted">No active constraints.</div>
        )}
      </div>
    </div>
  )
}
