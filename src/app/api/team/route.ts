import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { readData } from '@/lib/data'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('mc_team').select('*').order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    const data = await readData<{ members: any[] }>('team.json')
    return NextResponse.json(data.members || [])
  }
}
