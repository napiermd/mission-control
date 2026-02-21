import DashboardClient from '@/components/DashboardClient'
import { getCalendarEvents, getContentItems, getMemories, getTasks, getTeamMembers, getMetrics, getProjects } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [tasks, content, team, memories, calendar, metrics, projects] = await Promise.all([
    getTasks(),
    getContentItems(),
    getTeamMembers(),
    getMemories(),
    getCalendarEvents(),
    getMetrics(),
    getProjects(),
  ])

  const todoTasks = tasks.filter((t: any) => t.status === 'TODO').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE').length
  const urgentTasks = tasks.filter((t: any) => t.priority === 'URGENT').length
  const highTasks = tasks.filter((t: any) => t.priority === 'HIGH').length

  const publishedContent = content.filter((c: any) => c.stage === 'PUBLISHED').length
  const workingAgents = team.filter((m: any) => m.status === 'WORKING').length

  const obsidianTasks = tasks.filter((t: any) => (t.external_id || '').startsWith('obsidian:')).length
  const kyberTasks = tasks.filter((t: any) => (t.external_id || '').startsWith('kyber-task:')).length
  const manualTasks = tasks.length - obsidianTasks - kyberTasks

  const metricsMap = (metrics as any[]).reduce((acc: any, m: any) => {
    acc[m.key] = m.value_num ?? m.value_text
    return acc
  }, {})

  const stats = {
    totalTasks: tasks.length,
    todoTasks,
    inProgressTasks,
    doneTasks,
    urgentTasks,
    highTasks,
    obsidianTasks,
    kyberTasks,
    manualTasks,
    workingAgents,
    totalAgents: team.length,
    publishedContent,
    inboxCount: Number(metricsMap.obsidian_inbox_count || 0),
    homeworkOpen: Number(metricsMap.obsidian_homework_open || 0),
  }

  return (
    <DashboardClient
      tasks={tasks as any}
      calendar={calendar as any}
      memories={memories as any}
      content={content as any}
      team={team as any}
      stats={stats}
      projects={projects as any}
    />
  )
}
