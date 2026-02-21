import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { readData } from '@/lib/data'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('mc_calendar').select('*').order('time', { ascending: true })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    const data = await readData<{ events: any[] }>('calendar.json')
    return NextResponse.json(data.events || [])
  }
}
