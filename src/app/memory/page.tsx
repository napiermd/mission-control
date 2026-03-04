import { supabaseServer } from '@/lib/supabase'
import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'

export default async function MemoryPage() {
  let memories: any[] = []
  
  try {
    const supabase = supabaseServer()
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
  } catch {}

  return <MemoryClient memories={memories} />
}
