import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    const supabase = supabaseServer()
    const { error } = await supabase.from('mc_tasks').update({ status }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
