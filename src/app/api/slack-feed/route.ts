import { NextRequest, NextResponse } from 'next/server'

// Channel IDs from openclaw config
const CHANNELS: Record<string, string> = {
  'C0AJMEP9Q9H': 'admin-support',
  'C03S99T3EBU': 'admin-support-alt',
  'C09T70SUEMB': 'sales-team',
  'C098PLEC517': 'sales-success',
  'C08MW6P7T53': 'tars',
  'C08NSS1GB7G': 'dev',
}

async function getSlackToken(): Promise<string | null> {
  // Try env first
  if (process.env.SLACK_BOT_TOKEN) return process.env.SLACK_BOT_TOKEN

  // Try openclaw.json
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const home = process.env.HOME || '/Users/andrewbot'
    const config = JSON.parse(await fs.readFile(path.join(home, '.openclaw/openclaw.json'), 'utf-8'))
    return config?.channels?.slack?.accounts?.intublade?.botToken || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const token = await getSlackToken()
  if (!token) {
    return NextResponse.json({ error: 'No Slack token configured', messages: [] })
  }

  const channelParam = req.nextUrl.searchParams.get('channels')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30')
  const channelIds = channelParam ? channelParam.split(',') : Object.keys(CHANNELS)

  const messages: any[] = []

  for (const channelId of channelIds.slice(0, 6)) {
    try {
      const res = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&limit=${Math.min(limit, 10)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.ok && data.messages) {
        for (const msg of data.messages) {
          if (msg.subtype && msg.subtype !== 'bot_message') continue
          messages.push({
            id: msg.ts,
            channel_id: channelId,
            channel_name: CHANNELS[channelId] || channelId,
            text: msg.text?.substring(0, 300) || '',
            user: msg.user || msg.username || 'bot',
            timestamp: msg.ts,
            date: new Date(parseFloat(msg.ts) * 1000).toISOString(),
          })
        }
      }
    } catch {}
  }

  // Sort by timestamp descending
  messages.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp))

  // Resolve user names
  const userIds = [...new Set(messages.map(m => m.user).filter(u => u && !u.includes(' ')))]
  const userMap: Record<string, string> = {}

  for (const uid of userIds.slice(0, 20)) {
    try {
      const res = await fetch(`https://slack.com/api/users.info?user=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.ok && data.user) {
        userMap[uid] = data.user.real_name || data.user.name || uid
      }
    } catch {}
  }

  return NextResponse.json({
    messages: messages.slice(0, limit).map(m => ({
      ...m,
      user_name: userMap[m.user] || m.user,
    })),
  })
}
