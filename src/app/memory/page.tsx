import { supabaseServer } from '@/lib/supabase'
import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'

export default async function MemoryPage() {
  let memories: any[] = []
  let debugInfo = ''
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'NO_URL'
    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY)
    const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
    
    const supabase = supabaseServer()
    const { data, error, count } = await supabase
      .from('mc_memories')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
    
    if (error) {
      debugInfo = `Error: ${error.message} | URL: ${url.substring(0, 30)}... | svcKey: ${hasServiceKey} | anonKey: ${hasAnonKey}`
    } else {
      memories = (data || []).map((m: any) => ({
        ...m,
        type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
      }))
      debugInfo = `Loaded ${memories.length} (count=${count}) | URL: ${url.substring(0, 30)}... | svcKey: ${hasServiceKey}`
    }
  } catch (e: any) {
    debugInfo = `Exception: ${e.message}`
  }

  return (
    <div>
      <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-500">
        DEBUG: {debugInfo}
      </div>
      <MemoryClient memories={memories} />
    </div>
  )
}
