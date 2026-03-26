import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, status, last_action } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const supabase = supabaseServer()
  const update: Record<string, any> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (last_action) {
    update.last_action = last_action
    update.last_action_date = new Date().toISOString()
  }

  const { error } = await supabase.from('ops_board').update(update).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
