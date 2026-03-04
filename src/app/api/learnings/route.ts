import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get('agent')
    const type = searchParams.get('type')
    const days = parseInt(searchParams.get('days') || '30', 10)

    const supabase = supabaseServer()
    let query = supabase
      .from('mc_learnings')
      .select('*')
      .order('created_at', { ascending: false })
      .gte('created_at', new Date(Date.now() - days * 86400000).toISOString())

    if (agent) query = query.eq('agent', agent)
    if (type) query = query.eq('type', type.toUpperCase())

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agent, type, title, content, category, context, source, session_id, tags } = body

    if (!agent || !content) {
      return NextResponse.json({ error: 'Missing agent or content' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_learnings')
      .insert({
        agent,
        type: (type || 'LEARNING').toUpperCase(),
        title: title || null,
        content,
        category: category || 'General',
        context: context || null,
        source: source || 'auto',
        session_id: session_id || null,
        tags: tags || [],
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
