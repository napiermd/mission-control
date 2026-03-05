import { createClient } from '@supabase/supabase-js'
import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MemoryPage() {
  let memories: any[] = []
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    
    const { data, error } = await supabase
      .from('mc_memories')
      .select('*')
      .order('date', { ascending: false })
    
    if (!error && data) {
      memories = data.map((m: any) => ({
        ...m,
        type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
      }))
    }
  }

  return <MemoryClient memories={memories} />
}
