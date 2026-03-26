"use client"

const ventures = [
  { id: "all", label: "All" },
  { id: "intublade", label: "IntuBlade" },
  { id: "sayvant", label: "Sayvant" },
  { id: "stanford", label: "Stanford" },
  { id: "velix", label: "Velix Health" },
  { id: "personal", label: "Personal" },
]

export default function ContextSwitcher({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-1">
      {ventures.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            active === v.id
              ? "bg-hud-amber text-space-black"
              : "bg-space-panel text-hud-muted hover:text-hud-amber border border-space-border"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

// Map ops_board domains to ventures
export function domainToVenture(domain: string): string {
  const map: Record<string, string> = {
    pilots: "intublade",
    leads: "intublade",
    rep_mgmt: "intublade",
    sales: "intublade",
    manufacturing: "intublade",
    ops: "intublade",
    sayvant: "sayvant",
    stanford: "stanford",
    academic: "stanford",
    velix: "velix",
    compound_atlas: "velix",
    personal: "personal",
    family: "personal",
  }
  return map[domain] || "intublade"
}

// Classify Gmail threads by venture
export function classifyEmail(from: string, subject: string): string {
  const text = `${from} ${subject}`.toLowerCase()
  if (text.includes("stanford") || text.includes("edu") || text.includes("cost-effectiveness")) return "stanford"
  if (text.includes("sayvant") || text.includes("rupa") || text.includes("peptide")) return "sayvant"
  if (text.includes("velix") || text.includes("compound atlas") || text.includes("trt")) return "velix"
  if (text.includes("intublade") || text.includes("allegiance") || text.includes("opcom") || text.includes("pilot")
    || text.includes("blade") || text.includes("hubspot") || text.includes("eku") || text.includes("soma")
    || text.includes("ems world") || text.includes("dave") || text.includes("jordan")) return "intublade"
  if (text.includes("aaron") || text.includes("arthur") || text.includes("santos") || text.includes("gym")) return "personal"
  return "intublade" // default
}

// Classify Slack channels by venture
export function classifyChannel(channelName: string): string {
  const name = channelName.toLowerCase()
  if (name.includes("sales") || name.includes("admin") || name.includes("ops")) return "intublade"
  if (name.includes("sayvant")) return "sayvant"
  if (name.includes("stanford") || name.includes("academic")) return "stanford"
  if (name.includes("tars") || name.includes("dev") || name.includes("tony")) return "intublade"
  return "intublade"
}
