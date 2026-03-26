import DashboardClient from '@/components/DashboardClient'
import { getOpsBoardScored, getTodayCalendar, getTeamMembers, getFollowUps, getLatestBrief } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [opsBoard, calendar, team, followUps, brief] = await Promise.all([
    getOpsBoardScored(),
    getTodayCalendar(),
    getTeamMembers(),
    getFollowUps(),
    getLatestBrief(),
  ])

  const urgentCount = opsBoard.filter((i: any) => (i.priority ?? 3) <= 1).length
  const blockedCount = opsBoard.filter((i: any) => i.status === 'blocked').length
  const devAgent = team.find((m: any) => m.id === 'dev') || null

  return (
    <DashboardClient
      allItems={opsBoard as any}
      calendar={calendar as any}
      followUps={followUps as any}
      brief={brief as any}
      devAgent={devAgent as any}
      stats={{ totalItems: opsBoard.length, urgentCount, blockedCount }}
    />
  )
}
