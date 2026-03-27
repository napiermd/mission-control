import { NextResponse } from 'next/server'

let cache: { data: any; ts: number } = { data: null, ts: 0 }
const CACHE_TTL = 10 * 60 * 1000 // 10 min

async function getOuraToken(): Promise<string | null> {
  if (process.env.OURA_PAT) return process.env.OURA_PAT
  try {
    const { execSync } = await import('child_process')
    return execSync(
      'export OP_SERVICE_ACCOUNT_TOKEN="$(grep OP_SERVICE_ACCOUNT_TOKEN ~/.zshrc | cut -d\'"\' -f2)" && bash ~/.openclaw/workspace-ops/tools/get-secret.sh oura-pat',
      { encoding: 'utf-8', timeout: 10000 }
    ).trim() || null
  } catch {
    return null
  }
}

export async function GET() {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  const token = await getOuraToken()
  if (!token) {
    return NextResponse.json({ error: 'No Oura token' })
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    const [readinessRes, sleepRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${yesterday}&end_date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${yesterday}&end_date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    const readiness = await readinessRes.json()
    const sleep = await sleepRes.json()

    const todayReadiness = readiness.data?.find((d: any) => d.day === today) || readiness.data?.[readiness.data.length - 1]
    const todaySleep = sleep.data?.find((d: any) => d.day === today) || sleep.data?.[sleep.data.length - 1]

    const result = {
      readiness: todayReadiness?.score || null,
      sleep: todaySleep?.score || null,
      hrv: todayReadiness?.contributors?.hrv_balance || null,
      rhr: todayReadiness?.contributors?.resting_heart_rate || null,
    }

    cache = { data: result, ts: Date.now() }
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
