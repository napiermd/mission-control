import { NextResponse } from 'next/server'
import { readData } from '@/lib/data'
import path from 'path'

export async function GET() {
  const dataDir = path.join(process.cwd(), 'data')
  const team = await readData<{ members: any[] }>('team.json')
  return NextResponse.json({
    cwd: process.cwd(),
    dataDir,
    teamCount: (team.members || []).length
  })
}
