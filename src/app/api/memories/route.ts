import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_memories')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ data: [], error: error.message })
    }

    return NextResponse.json({ 
      data: data || [],
      count: (data || []).length 
    })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message })
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
