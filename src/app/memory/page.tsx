import { supabaseServer } from '@/lib/supabase'
import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'

export default async function MemoryPage() {
  let memories: any[] = []
  let debugInfo = ''
  
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_memories')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      debugInfo = `Error: ${error.message}`
      memories = []
    } else {
      memories = (data || []).map((m: any) => ({
        ...m,
        type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
      }))
      debugInfo = `Loaded ${memories.length} from Supabase`
    }
  } catch (e: any) {
    debugInfo = `Exception: ${e.message}`
  }

  return (
    <div>
      {/* Debug banner - remove after fixing */}
      <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-500">
        DEBUG: {debugInfo}
      </div>
      <MemoryClient memories={memories} />
    </div>
  )
}
