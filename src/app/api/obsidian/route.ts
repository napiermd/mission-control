import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const VAULT_PATH = path.join(process.env.HOME || '/Users/andrewbot', 'Obsidian', 'Tri-Vault')

async function dirExists(p: string) {
  try { await fs.access(p); return true } catch { return false }
}

async function walkDir(dir: string, base: string): Promise<{ name: string; modified: number; folder: string }[]> {
  const results: { name: string; modified: number; folder: string }[] = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const sub = await walkDir(full, base)
        results.push(...sub)
      } else if (entry.name.endsWith('.md')) {
        const stat = await fs.stat(full)
        results.push({
          name: entry.name.replace('.md', ''),
          modified: stat.mtimeMs,
          folder: path.relative(base, dir) || 'Root',
        })
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results
}

export async function GET() {
  try {
    if (!(await dirExists(VAULT_PATH))) {
      return NextResponse.json({
        available: false,
        inboxCount: 0,
        totalNotes: 0,
        recentNotes: [],
        folders: [],
      })
    }

    const allNotes = await walkDir(VAULT_PATH, VAULT_PATH)

    // Count inbox
    const inboxPath = path.join(VAULT_PATH, '00 Inbox')
    let inboxCount = 0
    if (await dirExists(inboxPath)) {
      const inboxFiles = await fs.readdir(inboxPath)
      inboxCount = inboxFiles.filter(f => f.endsWith('.md')).length
    }

    // Recent notes (top 10 by modified time)
    const recentNotes = [...allNotes]
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 10)
      .map(n => ({
        name: n.name,
        modified: new Date(n.modified).toISOString(),
        folder: n.folder,
      }))

    // Folder breakdown
    const folderMap: Record<string, number> = {}
    for (const note of allNotes) {
      const top = note.folder.split(path.sep)[0] || 'Root'
      folderMap[top] = (folderMap[top] || 0) + 1
    }
    const folders = Object.entries(folderMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      available: true,
      inboxCount,
      totalNotes: allNotes.length,
      recentNotes,
      folders,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
