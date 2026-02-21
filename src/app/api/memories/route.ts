import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { readData } from '@/lib/data'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('mc_memories').select('*').order('date', { ascending: false })
    if (error) throw error
    const memories = (data || []).map((m: any) => ({
      ...m,
      type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
    }))
    return NextResponse.json(memories)
  } catch {
    const data = await readData<{ memories: any[] }>('memories.json')
    const memories = (data.memories || []).map((m: any) => ({
      ...m,
      type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
    }))
    return NextResponse.json(memories)
  }
}
