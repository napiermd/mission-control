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
    { name: "Google Calendar", status: "active", detail: "Sayvant + IntuBlade calendars synced" },
    { name: "Gmail", status: "active", detail: "MCP sync to mc_emails" },
    { name: "HubSpot", status: "active", detail: "Paid tier — API connected" },
    { name: "Sentry", status: "inactive", detail: "Not configured" },
    { name: "Figma", status: "inactive", detail: "MCP not configured" },
  ]

  const statusDots: Record<string, string> = {
    active: "bg-hud-green",
    pending: "bg-hud-amber",
    error: "bg-hud-red",
    inactive: "bg-space-border",
  }

  const agents = [
    { id: "main", name: "TARS", model: "claude-opus-4-6", default: "sonnet-4-6 → gemini-2.5-flash" },
    { id: "dev", name: "Son of Anton", model: "gpt-5.4-codex", default: "opus-4-6 → sonnet-4-6" },
    { id: "ops", name: "Ops", model: "claude-opus-4-6", default: "sonnet-4-6 → gemini-2.5-flash" },
    { id: "sales", name: "Sales", model: "claude-opus-4-6", default: "sonnet-4-6 → gemini-2.5-flash" },
    { id: "research", name: "Research", model: "claude-opus-4-6", default: "sonnet-4-6 → gemini-2.5-flash" },
    { id: "finance", name: "Finance", model: "claude-opus-4-6", default: "sonnet-4-6 → gemini-2.5-flash" },
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
        <p className="text-hud-muted text-sm mt-1">System configuration, integrations, and cron management</p>
      </div>

      {/* Sync Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sync Status</h2>
            <p className="text-xs text-hud-muted mt-1">
              Last sync: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${lastSync ? "bg-hud-green" : "bg-hud-red"}`} />
        </div>
      </div>

      {/* Integrations */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((int) => (
            <div key={int.name} className="p-3 bg-space-panel rounded-lg flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDots[int.status] || "bg-space-border"}`} />
              <div>
                <div className="text-sm font-medium">{int.name}</div>
                <div className="text-[10px] text-hud-muted">{int.detail}</div>
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
              <tr className="text-left text-xs text-hud-muted border-b border-space-border">
                <th className="pb-2">Agent</th>
                <th className="pb-2">Session Model</th>
                <th className="pb-2">Default Model</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-b border-space-border">
                  <td className="py-2 font-medium">{a.name} <span className="text-hud-muted text-xs">({a.id})</span></td>
                  <td className="py-2 text-xs text-hud-muted">{a.model}</td>
                  <td className="py-2 text-xs text-hud-muted">{a.default}</td>
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
            <div key={cron.name} className="flex items-center gap-3 p-3 bg-space-panel rounded-lg">
              <div className={`w-2 h-2 rounded-full shrink-0 ${cron.status === "active" ? "bg-hud-green" : cron.status === "error" ? "bg-hud-red" : "bg-space-border"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{cron.name}</div>
                <div className="text-[10px] text-hud-muted">{cron.type} · {cron.interval}</div>
              </div>
              <div className="text-[10px] text-hud-muted shrink-0">{cron.tokens}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-hud-muted/70 mt-3">
          78 total cron jobs. High-frequency monitors use 2-layer pattern (bash pre-check → model only on alert).
        </p>
      </div>

      {/* Architecture */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Architecture</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-space-panel rounded-lg">
            <div className="font-medium text-hud-text">Runtime</div>
            <div className="text-hud-muted mt-1">OpenClaw 2026.2.15</div>
            <div className="text-hud-muted">Mac Mini (arm64)</div>
          </div>
          <div className="p-3 bg-space-panel rounded-lg">
            <div className="font-medium text-hud-text">Gateway</div>
            <div className="text-hud-muted mt-1">Port 47382</div>
            <div className="text-hud-muted">Always-on daemon</div>
          </div>
          <div className="p-3 bg-space-panel rounded-lg">
            <div className="font-medium text-hud-text">Database</div>
            <div className="text-hud-muted mt-1">Supabase (Postgres)</div>
            <div className="text-hud-muted">befiquqsnvktgtwfyzgw</div>
          </div>
          <div className="p-3 bg-space-panel rounded-lg">
            <div className="font-medium text-hud-text">Dashboard</div>
            <div className="text-hud-muted mt-1">Next.js 16 + Vercel</div>
            <div className="text-hud-muted">Tailwind CSS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
