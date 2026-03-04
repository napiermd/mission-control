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
