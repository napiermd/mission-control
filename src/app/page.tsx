import DashboardClient from '@/components/DashboardClient'
import { getOpsBoardScored, getContentItems, getTeamMembers, getMetrics } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [opsBoard, content, team, metrics] = await Promise.all([
    getOpsBoardScored(),
    getContentItems(),
    getTeamMembers(),
    getMetrics(),
  ])

  // Compute domain counts from ops_board
  const pilotCount = opsBoard.filter((i: any) => i.domain === 'pilots').length
  const leadCount = opsBoard.filter((i: any) => i.domain === 'leads').length
  const urgentCount = opsBoard.filter((i: any) => (i.priority ?? 3) <= 1).length
  const blockedCount = opsBoard.filter((i: any) => i.status === 'blocked').length

  // Dynamic KPI cards from real data
  const publishedContent = content.filter((c: any) => c.stage === 'PUBLISHED').length
  const workingAgents = team.filter((m: any) => m.status === 'WORKING').length

  const kpis = [
    {
      label: 'Active Pilots',
      value: String(pilotCount),
      detail: `${opsBoard.filter((i: any) => i.domain === 'pilots' && i.status === 'open').length} open`,
    },
    {
      label: 'Leads',
      value: String(leadCount),
      detail: 'in pipeline',
    },
    {
      label: 'Ops',
      value: String(opsBoard.filter((i: any) => i.domain === 'ops').length),
      detail: `${blockedCount} blocked`,
    },
    {
      label: 'Agents',
      value: `${workingAgents}/${team.length}`,
      detail: 'working',
    },
  ]

  const headerStats = {
    totalItems: opsBoard.length,
    urgentCount,
    blockedCount,
    pilotCount,
    leadCount,
  }

  return (
    <DashboardClient
      allItems={opsBoard as any}
      kpis={kpis}
      headerStats={headerStats}
    />
  )
}
