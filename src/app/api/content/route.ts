import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { readData } from '@/lib/data'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('mc_content').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    const data = await readData<{ items: any[] }>('content.json')
    return NextResponse.json(data.items || [])
  }
}
