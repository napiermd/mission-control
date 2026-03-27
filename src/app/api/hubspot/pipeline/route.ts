import { NextResponse } from 'next/server'

// 5-minute in-memory cache
let cache: { data: any; ts: number } = { data: null, ts: 0 }
const CACHE_TTL = 5 * 60 * 1000

async function getHubSpotToken(): Promise<string | null> {
  if (process.env.HUBSPOT_API_KEY) return process.env.HUBSPOT_API_KEY
  try {
    const { execSync } = await import('child_process')
    const token = execSync(
      'export OP_SERVICE_ACCOUNT_TOKEN="$(grep OP_SERVICE_ACCOUNT_TOKEN ~/.zshrc | cut -d\'"\' -f2)" && bash ~/.openclaw/workspace-ops/tools/get-secret.sh hubspot-api-pat',
      { encoding: 'utf-8', timeout: 10000 }
    ).trim()
    return token || null
  } catch {
    return null
  }
}

async function fetchDeals(token: string, filters: any[], properties: string[]) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [{ filters }],
      properties,
      limit: 1,
    }),
  })
  if (!res.ok) return { total: 0 }
  return res.json()
}

export async function GET() {
  // Return cache if fresh
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  const token = await getHubSpotToken()
  if (!token) {
    return NextResponse.json({ error: 'No HubSpot API key', totalDeals: 0, closedWon: 0, pipeline: 0 })
  }

  try {
    // Total open deals (not closed lost)
    const openRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'dealstage', operator: 'NEQ', value: 'closedlost' }] }],
        properties: ['amount', 'dealstage'],
        limit: 200,
      }),
    })
    const openData = await openRes.json()
    const openDeals = openData.results || []
    const totalOpen = openData.total || openDeals.length

    // Closed won deals
    const wonRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true' }] }],
        properties: ['amount'],
        limit: 1,
      }),
    })
    const wonData = await wonRes.json()
    const closedWon = wonData.total || 0

    // Compute pipeline value from open deals
    let pipelineValue = 0
    const stageCounts: Record<string, { count: number; amount: number }> = {}

    const stageLabels: Record<string, string> = {
      appointmentscheduled: 'Lead/Prospect',
      '1049718030': 'Pilot/Demo',
      '1323400849': 'Negotiation',
      '1049164706': 'Closed Won',
    }

    for (const deal of openDeals) {
      const amt = parseFloat(deal.properties?.amount || '0')
      const stage = deal.properties?.dealstage || 'unknown'
      const label = stageLabels[stage] || stage
      pipelineValue += amt
      if (!stageCounts[label]) stageCounts[label] = { count: 0, amount: 0 }
      stageCounts[label].count++
      stageCounts[label].amount += amt
    }

    const result = {
      totalDeals: totalOpen,
      closedWon,
      pipeline: Math.round(pipelineValue),
      pipelineFormatted: pipelineValue >= 1000000
        ? `$${(pipelineValue / 1000000).toFixed(1)}M`
        : `$${Math.round(pipelineValue / 1000)}K`,
      stages: stageCounts,
    }

    cache = { data: result, ts: Date.now() }
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, totalDeals: 0, closedWon: 0, pipeline: 0 })
  }
}
