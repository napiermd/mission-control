import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import os from 'os'

const DB_PATH = path.join(os.homedir(), '.openclaw', 'skill-evolution.db')

async function getDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const db = await getDb()

    if (action === 'list') {
      // Get all skills with recent execution stats
      const skills = await db.all(`
        SELECT 
          skill_name,
          skill_version,
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

      const enriched = skills.map(s => ({
        ...s,
        success_rate: s.total_executions > 0 ? (s.successes / s.total_executions * 100) : 0,
        status: s.total_executions > 0 && (s.successes / s.total_executions * 100) >= 90 ? 'healthy' :
                s.total_executions > 0 && (s.successes / s.total_executions * 100) >= 70 ? 'warning' : 'critical'
      }))

      await db.close()
      return NextResponse.json(enriched)
    }

    if (action === 'stats') {
      const skillName = searchParams.get('skill')
      if (!skillName) {
        return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      }

      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000

      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures,
          AVG(latency_ms) as avg_latency,
          AVG(tokens_used) as avg_tokens
        FROM skill_executions
        WHERE skill_name = ? AND started_at >= ?
      `, [skillName, cutoff])

      const failureTypes = await db.all(`
        SELECT error_type, COUNT(*) as count
        FROM skill_executions
        WHERE skill_name = ? AND started_at >= ? AND status = 'failure'
        GROUP BY error_type
      `, [skillName, cutoff])

      await db.close()
      return NextResponse.json({
        ...stats,
        success_rate: stats.total_executions > 0 ? (stats.successes / stats.total_executions * 100) : 0,
        failure_types: failureTypes.reduce((acc, ft) => ({ ...acc, [ft.error_type]: ft.count }), {})
      })
    }

    if (action === 'failures') {
      const skillName = searchParams.get('skill')
      const limit = parseInt(searchParams.get('limit') || '10')

      if (!skillName) {
        return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      }

      const failures = await db.all(`
        SELECT 
          id, started_at, error_type, error_message, 
          context_snapshot, model
        FROM skill_executions
        WHERE skill_name = ? AND status = 'failure'
        ORDER BY started_at DESC
        LIMIT ?
      `, [skillName, limit])

      await db.close()
      return NextResponse.json(failures)
    }

    if (action === 'patterns') {
      const skillName = searchParams.get('skill')
      
      if (!skillName) {
        return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      }

      const patterns = await db.all(`
        SELECT 
          error_type,
          error_message,
          COUNT(*) as count,
          MIN(started_at) as first_seen,
          MAX(started_at) as last_seen
        FROM skill_executions
        WHERE skill_name = ? AND status = 'failure' AND error_type IS NOT NULL
        GROUP BY error_type, error_message
        HAVING COUNT(*) >= 3
        ORDER BY count DESC
      `, [skillName])

      await db.close()
      return NextResponse.json(patterns)
    }

    if (action === 'timeline') {
      const skillName = searchParams.get('skill')
      
      if (!skillName) {
        return NextResponse.json({ error: 'skill parameter required' }, { status: 400 })
      }

      // Get hourly execution stats for the last 24 hours
      const timeline = await db.all(`
        SELECT 
          strftime('%Y-%m-%d %H:00:00', datetime(started_at/1000, 'unixepoch')) as hour,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures
        FROM skill_executions
        WHERE skill_name = ? AND started_at >= ?
        GROUP BY hour
        ORDER BY hour ASC
      `, [skillName, Date.now() - 24 * 60 * 60 * 1000])

      await db.close()
      return NextResponse.json(timeline)
    }

    await db.close()
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Skills API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
