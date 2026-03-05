import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// POST /api/sync — runs sync operations server-side (where Supabase keys exist)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const target = body.target || 'all'
    const results: Record<string, any> = {}
    const supabase = supabaseServer()

    // ── SYNC TEAM STATUS ──
    if (target === 'all' || target === 'team') {
      const agents = [
        { id: 'dev', name: 'Tony', role: 'Development', department: 'Engineering', responsibilities: 'Code, GitHub, CI/CD, Architecture', status: 'IDLE' },
        { id: 'ops', name: 'Ops', role: 'Operations', department: 'Operations', responsibilities: 'Calendar, Email, Tasks, Briefings', status: 'IDLE' },
        { id: 'sales', name: 'Sales', role: 'Sales', department: 'Revenue', responsibilities: 'Pipeline, CRM, Outreach', status: 'IDLE' },
        { id: 'research', name: 'Research', role: 'Research', department: 'Intelligence', responsibilities: 'Market Analysis, Papers, Competitive Intel', status: 'IDLE' },
        { id: 'main', name: 'Main', role: 'Primary Assistant', department: 'General', responsibilities: 'Coordination, General Tasks', status: 'IDLE' },
        { id: 'academic', name: 'Academic', role: 'Academic', department: 'Education', responsibilities: 'Stanford, Coursework, Study', status: 'IDLE' },
      ]

      // Update agent status based on body.agentStatus if provided
      if (body.agentStatus && typeof body.agentStatus === 'object') {
        for (const agent of agents) {
          const status = body.agentStatus[agent.id]
          if (status) {
            agent.status = status.status || 'IDLE'
            ;(agent as any).current_task = status.currentTask || null
          }
        }
      }

      const { error } = await supabase
        .from('mc_team')
        .upsert(agents, { onConflict: 'id' })

      results.team = error ? { error: error.message } : { synced: agents.length }
    }

    // ── SYNC CALENDAR ──
    if (target === 'all' || target === 'calendar') {
      if (body.events && Array.isArray(body.events)) {
        // Agent sends calendar events from gog or KyberOS
        // Clear and re-insert
        await supabase.from('mc_calendar').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        const calEvents = body.events.map((e: any) => ({
          title: e.title || 'Untitled',
          time: e.time || null,
          source: e.source || 'sync',
          status: e.status || null,
        }))

        if (calEvents.length > 0) {
          const { error } = await supabase.from('mc_calendar').insert(calEvents)
          results.calendar = error ? { error: error.message } : { synced: calEvents.length }
        } else {
          results.calendar = { synced: 0 }
        }
      } else {
        results.calendar = { skipped: 'no events provided' }
      }
    }

    // ── SYNC TASKS ──
    if (target === 'all' || target === 'tasks') {
      if (body.tasks && Array.isArray(body.tasks)) {
        const mcTasks = body.tasks.map((t: any) => ({
          title: t.title,
          status: t.status || 'TODO',
          priority: t.priority || 'MEDIUM',
          assignee: t.assignee || null,
          external_id: t.external_id || null,
          context: t.context || null,
        }))

        // Upsert by external_id if present
        for (const task of mcTasks) {
          if (task.external_id) {
            const { data: existing } = await supabase
              .from('mc_tasks')
              .select('id')
              .eq('external_id', task.external_id)
              .maybeSingle()

            if (existing) {
              await supabase.from('mc_tasks').update(task).eq('id', existing.id)
            } else {
              await supabase.from('mc_tasks').insert(task)
            }
          } else {
            await supabase.from('mc_tasks').insert(task)
          }
        }

        results.tasks = { synced: mcTasks.length }
      } else {
        results.tasks = { skipped: 'no tasks provided' }
      }
    }

    // ── SYNC METRICS ──
    if (target === 'all' || target === 'metrics') {
      const metrics = body.metrics || {}
      const entries = Object.entries(metrics).map(([key, value]) => ({
        key,
        ...(typeof value === 'number' ? { value_num: value } : { value_text: String(value) }),
      }))

      // Always add last_sync timestamp
      entries.push({ key: 'last_sync', value_text: new Date().toISOString() })

      if (entries.length > 0) {
        const { error } = await supabase
          .from('mc_metrics')
          .upsert(entries, { onConflict: 'key' })
        results.metrics = error ? { error: error.message } : { synced: entries.length }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data } = await supabase
      .from('mc_metrics')
      .select('*')
      .eq('key', 'last_sync')
      .maybeSingle()

    return NextResponse.json({
      lastSync: data?.value_text || 'never',
      status: 'ok',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
