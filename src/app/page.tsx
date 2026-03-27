import DashboardClient from '@/components/DashboardClient'
import { getOpsBoardScored, getTodayCalendar, getTeamMembers, getFollowUps, getLatestBrief } from '@/lib/queries'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [opsBoard, calendar, team, followUps, brief] = await Promise.all([
    getOpsBoardScored(),
    getTodayCalendar(),
    getTeamMembers(),
    getFollowUps(),
    getLatestBrief(),
  ])

  // Email count
  let emailCount = 0
  try {
    const supabase = supabaseServer()
    const { count } = await supabase
      .from('mc_emails')
      .select('*', { count: 'exact', head: true })
    emailCount = count || 0
  } catch {}

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
      stats={{
        totalItems: opsBoard.length,
        urgentCount,
        blockedCount,
        emailCount,
        slackCount: 0, // Slack count requires API call, skip for SSR perf
      }}
    />
  )
}
