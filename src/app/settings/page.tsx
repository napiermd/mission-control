import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLastSync() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await supabase.from('mc_metrics').select('*').eq('key', 'last_sync').maybeSingle()
  return data?.value_text || null
}

export default async function SettingsPage() {
  const lastSync = await getLastSync()

  const integrations = [
    { name: "Discord", status: "active", detail: "Connected — 6 channels" },
    { name: "Telegram", status: "active", detail: "Connected — DM + groups" },
    { name: "Supabase", status: "active", detail: "befiquqsnvktgtwfyzgw" },
    { name: "GitHub", status: "active", detail: "gh CLI authenticated" },
    { name: "Obsidian", status: "active", detail: "Tri-Vault" },
    { name: "Ollama", status: "active", detail: "localhost:11434" },
    { name: "Slack", status: "active", detail: "IntuBlade workspace" },
    { name: "Google Workspace", status: "pending", detail: "gogcli — needs calendar auth" },
    { name: "HubSpot", status: "pending", detail: "API integration in progress" },
    { name: "Sentry", status: "inactive", detail: "Not configured" },
    { name: "Figma", status: "inactive", detail: "MCP not configured" },
  ]

  const statusDots: Record<string, string> = {
    active: "bg-green-500",
    pending: "bg-amber-500",
    error: "bg-red-500",
    inactive: "bg-warm-muted/40",
  }

  const agents = [
    { id: "dev", name: "Tony", model: "claude-opus-4-6", default: "gpt-5.3-codex" },
    { id: "ops", name: "Ops", model: "claude-sonnet-4-5", default: "gpt-5.3-codex" },
    { id: "sales", name: "Sales", model: "claude-sonnet-4-5", default: "gpt-5.3-codex" },
    { id: "research", name: "Research", model: "claude-sonnet-4-5", default: "gpt-5.3-codex" },
    { id: "main", name: "Main", model: "kimi-k2.5", default: "gpt-5.3-codex" },
    { id: "academic", name: "Academic", model: "claude-sonnet-4-5", default: "gpt-5.3-codex" },
  ]

  const cronStats = [
    { name: "Watchdog Pre-check", type: "launchd", interval: "*/10 min", status: "active", tokens: "0 (bash only)" },
    { name: "Meeting Pre-check", type: "launchd", interval: "*/30 min", status: "active", tokens: "0 (bash only)" },
    { name: "Mission Control Sync", type: "OpenClaw", interval: "4h", status: "active", tokens: "minimal" },
    { name: "Morning Briefing", type: "OpenClaw", interval: "7:00 AM PT", status: "active", tokens: "sonnet" },
    { name: "Evening Summary", type: "OpenClaw", interval: "8:00 PM PT", status: "active", tokens: "sonnet" },
    { name: "Workday Autopilot", type: "OpenClaw", interval: "3x/day", status: "active", tokens: "sonnet" },
    { name: "GitHub Ship Loop", type: "OpenClaw", interval: "2x/day", status: "active", tokens: "sonnet" },
    { name: "Sales Pipeline", type: "OpenClaw", interval: "daily", status: "active", tokens: "sonnet" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-warm-muted text-sm mt-1">System configuration, integrations, and cron management</p>
      </div>

      {/* Sync Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sync Status</h2>
            <p className="text-xs text-warm-muted mt-1">
              Last sync: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${lastSync ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* Integrations */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((int) => (
            <div key={int.name} className="p-3 bg-cream-100 rounded-lg flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDots[int.status] || "bg-warm-muted/40"}`} />
              <div>
                <div className="text-sm font-medium">{int.name}</div>
                <div className="text-[10px] text-warm-muted">{int.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Configuration */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Agent Configuration</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-warm-muted border-b border-cream-200">
                <th className="pb-2">Agent</th>
                <th className="pb-2">Session Model</th>
                <th className="pb-2">Default Model</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-b border-cream-100">
                  <td className="py-2 font-medium">{a.name} <span className="text-warm-muted text-xs">({a.id})</span></td>
                  <td className="py-2 text-xs text-warm-muted">{a.model}</td>
                  <td className="py-2 text-xs text-warm-muted">{a.default}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cron Job Manager */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Cron Jobs</h2>
        <div className="space-y-2">
          {cronStats.map((cron) => (
            <div key={cron.name} className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full shrink-0 ${cron.status === "active" ? "bg-green-500" : cron.status === "error" ? "bg-red-500" : "bg-warm-muted/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{cron.name}</div>
                <div className="text-[10px] text-warm-muted">{cron.type} · {cron.interval}</div>
              </div>
              <div className="text-[10px] text-warm-muted shrink-0">{cron.tokens}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-warm-muted/70 mt-3">
          78 total cron jobs. High-frequency monitors use 2-layer pattern (bash pre-check → model only on alert).
        </p>
      </div>

      {/* Architecture */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Architecture</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-cream-100 rounded-lg">
            <div className="font-medium text-warm-text">Runtime</div>
            <div className="text-warm-muted mt-1">OpenClaw 2026.2.15</div>
            <div className="text-warm-muted">Mac Mini (arm64)</div>
          </div>
          <div className="p-3 bg-cream-100 rounded-lg">
            <div className="font-medium text-warm-text">Gateway</div>
            <div className="text-warm-muted mt-1">Port 47382</div>
            <div className="text-warm-muted">Always-on daemon</div>
          </div>
          <div className="p-3 bg-cream-100 rounded-lg">
            <div className="font-medium text-warm-text">Database</div>
            <div className="text-warm-muted mt-1">Supabase (Postgres)</div>
            <div className="text-warm-muted">befiquqsnvktgtwfyzgw</div>
          </div>
          <div className="p-3 bg-cream-100 rounded-lg">
            <div className="font-medium text-warm-text">Dashboard</div>
            <div className="text-warm-muted mt-1">Next.js 16 + Vercel</div>
            <div className="text-warm-muted">Tailwind CSS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
