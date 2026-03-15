import { NextResponse } from 'next/server'
import path from 'path'
import os from 'os'

// Demo data for when the DB is unavailable (e.g. Vercel)
const DEMO_SKILLS = [
  { skill_name: 'obsidian-brain', skill_version: '1.0', total_executions: 12, successes: 11, failures: 1, avg_latency: 1420, last_run: Date.now() - 3600000, success_rate: 91.7, status: 'healthy' },
  { skill_name: 'skill-evolution', skill_version: '1.0', total_executions: 8, successes: 8, failures: 0, avg_latency: 980, last_run: Date.now() - 7200000, success_rate: 100, status: 'healthy' },
  { skill_name: 'github', skill_version: '1.0', total_executions: 5, successes: 4, failures: 1, avg_latency: 2100, last_run: Date.now() - 86400000, success_rate: 80, status: 'warning' },
]

async function tryLoadDb() {
  try {
    // Only attempt SQLite on a real server (not Vercel)
    if (process.env.VERCEL) return null

    const sqlite3 = (await import('sqlite3')).default
    const { open } = await import('sqlite')
    const DB_PATH = path.join(os.homedir(), '.openclaw', 'skill-evolution.db')

    return await open({ filename: DB_PATH, driver: sqlite3.Database })
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  const db = await tryLoadDb()

  try {
    if (action === 'list') {
      if (!db) return NextResponse.json(DEMO_SKILLS)

      const skills = await db.all(`
        SELECT 
          skill_name, skill_version,
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures,
          AVG(latency_ms) as avg_latency,
          MAX(started_at) as last_run
        FROM skill_executions
        WHERE started_at >= ?
        GROUP BY skill_name
        ORDER BY last_run DESC
      `, [Date.now() - 7 * 24 * 60 * 60 * 1000])

      return NextResponse.json(skills.map(s => ({
        ...s,
        success_rate: s.total_executions > 0 ? (s.successes / s.total_executions * 100) : 0,
        status: s.total_executions > 0 && (s.successes / s.total_executions * 100) >= 90 ? 'healthy' :
                s.total_executions > 0 && (s.successes / s.total_executions * 100) >= 70 ? 'warning' : 'critical'
      })))
    }

    if (action === 'stats') {
      const skillName = searchParams.get('skill')
      if (!skillName) return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })

      if (!db) {
        const demo = DEMO_SKILLS.find(s => s.skill_name === skillName)
        return NextResponse.json(demo || { total_executions: 0, successes: 0, failures: 0, success_rate: 0, failure_types: {} })
      }

      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
      const stats = await db.get(`
        SELECT COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures,
          AVG(latency_ms) as avg_latency, AVG(tokens_used) as avg_tokens
        FROM skill_executions WHERE skill_name = ? AND started_at >= ?
      `, [skillName, cutoff])

      const failureTypes = await db.all(`
        SELECT error_type, COUNT(*) as count FROM skill_executions
        WHERE skill_name = ? AND started_at >= ? AND status = 'failure'
        GROUP BY error_type
      `, [skillName, cutoff])

      return NextResponse.json({
        ...stats,
        success_rate: stats.total_executions > 0 ? (stats.successes / stats.total_executions * 100) : 0,
        failure_types: failureTypes.reduce((acc: any, ft: any) => ({ ...acc, [ft.error_type]: ft.count }), {})
      })
    }

    if (action === 'failures') {
      const skillName = searchParams.get('skill')
      if (!skillName) return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      if (!db) return NextResponse.json([])

      const limit = parseInt(searchParams.get('limit') || '10')
      const failures = await db.all(`
        SELECT id, started_at, error_type, error_message, context_snapshot, model
        FROM skill_executions WHERE skill_name = ? AND status = 'failure'
        ORDER BY started_at DESC LIMIT ?
      `, [skillName, limit])
      return NextResponse.json(failures)
    }

    if (action === 'patterns') {
      const skillName = searchParams.get('skill')
      if (!skillName) return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      if (!db) return NextResponse.json([])

      const patterns = await db.all(`
        SELECT error_type, error_message, COUNT(*) as count,
          MIN(started_at) as first_seen, MAX(started_at) as last_seen
        FROM skill_executions
        WHERE skill_name = ? AND status = 'failure' AND error_type IS NOT NULL
        GROUP BY error_type, error_message HAVING COUNT(*) >= 3 ORDER BY count DESC
      `, [skillName])
      return NextResponse.json(patterns)
    }

    if (action === 'timeline') {
      const skillName = searchParams.get('skill')
      if (!skillName) return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      if (!db) return NextResponse.json([])

      const timeline = await db.all(`
        SELECT strftime('%Y-%m-%d %H:00:00', datetime(started_at/1000, 'unixepoch')) as hour,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures
        FROM skill_executions WHERE skill_name = ? AND started_at >= ?
        GROUP BY hour ORDER BY hour ASC
      `, [skillName, Date.now() - 24 * 60 * 60 * 1000])
      return NextResponse.json(timeline)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Skills API error:', error)
    // Return demo data instead of crashing
    if (action === 'list') return NextResponse.json(DEMO_SKILLS)
    return NextResponse.json([], { status: 200 })
  } finally {
    if (db) await db.close()
  }
}
