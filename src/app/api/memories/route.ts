import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error, count } = await supabase
      .from('mc_memories')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
    
    return NextResponse.json({ 
      count: data?.length || 0,
      error: error?.message || null,
      first3: (data || []).slice(0, 3).map((m: any) => ({ id: m.id, type: m.type, content: m.content?.substring(0, 50) })),
      last3: (data || []).slice(-3).map((m: any) => ({ id: m.id, type: m.type, content: m.content?.substring(0, 50) })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, content, category, source } = body

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing type or content' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_memories')
      .insert({
        type: type.toUpperCase(),
        content,
        category: category || 'General',
        source: source || 'auto-capture',
        date: new Date().toISOString().split('T')[0]
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
