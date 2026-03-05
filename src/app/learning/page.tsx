import { createClient } from '@supabase/supabase-js'
import LearningClient from './LearningClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LearningPage() {
  let learnings: any[] = []
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    
    const since = new Date(Date.now() - 90 * 86400000).toISOString()
    const { data, error } = await supabase
      .from('mc_learnings')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      learnings = data
    }
  }

  return <LearningClient learnings={learnings as any} />
}
