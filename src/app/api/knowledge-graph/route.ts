import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { homedir } from 'os'
import path from 'path'

const GRAPH_PATH = path.join(homedir(), '.openclaw', 'obsidian-graph.json')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const graphData = await readFile(GRAPH_PATH, 'utf-8')
    const graph = JSON.parse(graphData)

    if (action === 'full') {
      return NextResponse.json(graph)
    }

    if (action === 'stats') {
      return NextResponse.json(graph.stats)
    }

    if (action === 'hubs') {
      const minLinks = parseInt(searchParams.get('min') || '5')
      const hubs = graph.nodes
        .filter((n: any) => n.total_links >= minLinks)
        .sort((a: any, b: any) => b.total_links - a.total_links)
        .slice(0, 20)
      
      return NextResponse.json(hubs)
    }

    if (action === 'orphans') {
      const orphans = graph.nodes
        .filter((n: any) => n.total_links === 0)
        .slice(0, 50)
      
      return NextResponse.json(orphans)
    }

    if (action === 'clusters') {
      // Group by tags
      const clusters: Record<string, string[]> = {}
      
      graph.nodes.forEach((node: any) => {
        node.tags?.forEach((tag: string) => {
          if (!clusters[tag]) clusters[tag] = []
          clusters[tag].push(node.title)
        })
      })

      // Filter to clusters with ≥3 notes
      const filtered = Object.entries(clusters)
        .filter(([_, notes]) => notes.length >= 3)
        .map(([tag, notes]) => ({ tag, count: notes.length, notes: notes.slice(0, 10) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)

      return NextResponse.json(filtered)
    }

    if (action === 'search') {
      const query = searchParams.get('q')?.toLowerCase() || ''
      
      const results = graph.nodes
        .filter((n: any) => 
          n.title.toLowerCase().includes(query) ||
          n.tags?.some((t: string) => t.toLowerCase().includes(query))
        )
        .slice(0, 20)

      return NextResponse.json(results)
    }

    // Default: return summary
    return NextResponse.json({
      stats: graph.stats,
      recent_nodes: graph.nodes.slice(0, 10)
    })

  } catch (error: any) {
    console.error('Knowledge graph API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
