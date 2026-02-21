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
