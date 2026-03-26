"use client"

type KPI = {
  label: string
  value: string
  detail?: string
}

export default function KPICards({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="card">
          <div className="text-xs text-warm-muted uppercase tracking-wide">{kpi.label}</div>
          <div className="text-2xl font-bold text-warm-text mt-1">{kpi.value}</div>
          {kpi.detail && (
            <div className="text-xs text-warm-muted mt-0.5">{kpi.detail}</div>
          )}
        </div>
      ))}
    </div>
  )
}
