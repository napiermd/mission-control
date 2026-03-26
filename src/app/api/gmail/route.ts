import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30')

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('mc_emails')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message, threads: [] })
  }

  const threads = (data || [])
    .filter((e: any) => e.external_id !== 'probe-1')
    .map((e: any) => ({
      id: e.id,
      thread_id: e.external_id,
      subject: e.subject || '',
      from_name: (e.from_address || '').replace(/<.*>/, '').trim(),
      from_email: ((e.from_address || '').match(/<(.+)>/) || [])[1] || e.from_address || '',
      snippet: e.summary || '',
      date: e.received_at || '',
      is_unread: e.priority === 'high',
      labels: [],
      venture: e.category || 'intublade',
    }))

  return NextResponse.json({ source: 'supabase', threads })
}
