import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { readData, writeData } from '@/lib/data'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('mc_tasks').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    const data = await readData<{ tasks: any[] }>('tasks.json')
    return NextResponse.json(data.tasks || [])
  }
}

export async function POST(request: Request) {
  const task = await request.json()
  try {
    const supabase = supabaseServer()
    const { error } = await supabase.from('mc_tasks').insert([task])
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    const data = await readData<{ tasks: any[] }>('tasks.json')
    data.tasks = data.tasks || []
    data.tasks.push({ ...task, id: Date.now().toString() })
    await writeData('tasks.json', data)
    return NextResponse.json({ success: true, fallback: true })
  }
}
