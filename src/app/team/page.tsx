import { createClient } from '@supabase/supabase-js'
import TeamClient from './TeamClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeamPage() {
  let team: any[] = []
  let learnings: any[] = []
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const [teamRes, learnRes] = await Promise.all([
      supabase.from('mc_team').select('*').order('name'),
      supabase.from('mc_learnings').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    team = teamRes.data || []
    learnings = learnRes.data || []
  }
  return <TeamClient team={team} learnings={learnings} />
}
