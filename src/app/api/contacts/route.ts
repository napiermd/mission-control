import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_contacts')
      .select('*')
      .order('name', { ascending: true })
    if (error) return NextResponse.json({ data: [], error: error.message })
    return NextResponse.json({ data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, role, category, handle, email, timezone, compensation, notes } = body
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('mc_contacts')
      .insert({ name, role, category: category || 'External', handle, email, timezone, compensation, notes })
      .select()
    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
