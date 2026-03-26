import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// Gmail threads are synced to mc_gmail_threads table by cron
// This route reads from Supabase and also supports direct Gmail API if token is available

async function getGmailToken(): Promise<string | null> {
  // Try env
  if (process.env.GMAIL_ACCESS_TOKEN) return process.env.GMAIL_ACCESS_TOKEN

  // Try gog token file
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const home = process.env.HOME || '/Users/andrewbot'
    const tokenFile = path.join(home, '.config/gog/token.json')
    const token = JSON.parse(await fs.readFile(tokenFile, 'utf-8'))
    return token?.access_token || null
  } catch {
    return null
  }
}

async function fetchFromGmailAPI(token: string, maxResults: number = 20) {
  try {
    // List messages
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:inbox`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!listRes.ok) return null
    const listData = await listRes.json()
    if (!listData.messages) return []

    // Fetch each message metadata
    const threads: any[] = []
    for (const msg of listData.messages.slice(0, maxResults)) {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!msgRes.ok) continue
        const msgData = await msgRes.json()
        const headers = msgData.payload?.headers || []
        const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || ''

        threads.push({
          id: msgData.id,
          thread_id: msgData.threadId,
          subject: getHeader('Subject'),
          from_name: getHeader('From').replace(/<.*>/, '').trim(),
          from_email: (getHeader('From').match(/<(.+)>/) || [])[1] || getHeader('From'),
          snippet: msgData.snippet || '',
          date: getHeader('Date'),
          is_unread: msgData.labelIds?.includes('UNREAD') || false,
          labels: msgData.labelIds || [],
        })
      } catch {}
    }
    return threads
  } catch {
    return null
  }
}

async function fetchFromSupabase() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('mc_gmail_threads')
    .select('*')
    .order('date', { ascending: false })
    .limit(30)
  if (error) return []
  return data || []
}

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

  // Try direct Gmail API first
  const token = await getGmailToken()
  if (token) {
    const apiResults = await fetchFromGmailAPI(token, limit)
    if (apiResults) {
      return NextResponse.json({ source: 'gmail_api', threads: apiResults })
    }
  }

  // Fall back to Supabase cache
  const cached = await fetchFromSupabase()
  return NextResponse.json({ source: 'supabase_cache', threads: cached.slice(0, limit) })
}
