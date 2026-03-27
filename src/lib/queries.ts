import { supabaseServer } from '@/lib/supabase'

export async function getTasks() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_tasks').select('*').order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getContentItems() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_content').select('*').order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getTeamMembers() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_team').select('*').order('name', { ascending: true })
  if (error) return []
  return data || []
}

export async function getMemories() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_memories').select('*').order('date', { ascending: false })
  if (error) return []
  return (data || []).map((m: any) => ({
    ...m,
    type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
  }))
}

export async function getCalendarEvents() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_calendar').select('*').order('time', { ascending: true })
  if (error) return []
  return data || []
}

export async function getMetrics() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_metrics').select('*')
  if (error) return []
  return data || []
}

export async function getProjects() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('mc_projects').select('*').order('updated_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getLearnings(days = 30) {
  const supabase = supabaseServer()
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase
    .from('mc_learnings')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getOpsBoard() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('ops_board')
    .select('*')
    .neq('status', 'done')
    .order('priority', { ascending: true })
  if (error) return []
  return data || []
}

export async function getOpsBoardScored() {
  const items = await getOpsBoard()
  const now = new Date()
  return items.map((item: any) => {
    const pri = item.priority ?? 3
    const nad = item.next_action_date ? new Date(item.next_action_date) : null
    const lad = item.last_action_date ? new Date(item.last_action_date) : null
    const daysUntilDue = nad ? Math.max(0, (nad.getTime() - now.getTime()) / 86400000) : 30
    const daysStale = lad ? Math.max(0, (now.getTime() - lad.getTime()) / 86400000) : 0
    const isBlocked = item.status === 'blocked' ? 1 : 0
    const score = (5 - pri) * 10
      + Math.max(0, 30 - daysUntilDue) * 2
      + Math.min(daysStale, 14)
      + 10 * isBlocked
    return { ...item, _score: Math.round(score) }
  }).sort((a: any, b: any) => b._score - a._score)
}

export async function getFollowUps() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('status', 'waiting')
    .order('sent_at', { ascending: true })
  if (error) return []
  return data || []
}

export async function getLatestBrief() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('tars_brief_context')
    .select('*')
    .order('hydrated_at', { ascending: false })
    .limit(1)
  if (error) return null
  return data?.[0] || null
}

export async function getTodayCalendar() {
  const supabase = supabaseServer()
  // Force Pacific timezone for date calculation
  const now = new Date()
  const pacific = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const today = `${pacific.getFullYear()}-${String(pacific.getMonth() + 1).padStart(2, '0')}-${String(pacific.getDate()).padStart(2, '0')}`
  const { data, error } = await supabase
    .from('mc_calendar')
    .select('*')
    .eq('recurrence', today)
    .order('time', { ascending: true })
  if (error) return []
  return data || []
}

export async function getObsidianStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/obsidian`, { cache: 'no-store' })
    if (!res.ok) return { available: false, inboxCount: 0, totalNotes: 0, recentNotes: [], folders: [] }
    return res.json()
  } catch {
    return { available: false, inboxCount: 0, totalNotes: 0, recentNotes: [], folders: [] }
  }
}
