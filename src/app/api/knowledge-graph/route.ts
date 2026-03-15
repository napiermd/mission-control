import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

// Read static JSON bundled with the deployment (public/data/)
function loadGraph() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'knowledge-graph.json')
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { nodes: [], edges: [], stats: { total_nodes: 0, total_edges: 0, total_tags: 0 }, tags: [] }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const graph = loadGraph()
    const nodes: any[] = Array.isArray(graph.nodes) ? graph.nodes : []
    const edges: any[] = Array.isArray(graph.edges) ? graph.edges : []

    const stats = graph.stats || {
      total_nodes: nodes.length,
      total_edges: edges.length,
      total_tags: Array.isArray(graph.tags) ? graph.tags.length : 0
    }

    if (action === 'full') {
      return NextResponse.json({ nodes, edges, stats })
    }

    if (action === 'stats') {
      return NextResponse.json(stats)
    }

    if (action === 'hubs') {
      const minLinks = parseInt(searchParams.get('min') || '5')
      const hubs = nodes
        .filter(n => (n.total_links || 0) >= minLinks)
        .sort((a, b) => (b.total_links || 0) - (a.total_links || 0))
        .slice(0, 20)
      return NextResponse.json(hubs)
    }

    if (action === 'orphans') {
      const orphans = nodes
        .filter(n => (n.total_links || 0) === 0)
        .slice(0, 50)
      return NextResponse.json(orphans)
    }

    if (action === 'clusters') {
      const clusters: Record<string, string[]> = {}
      nodes.forEach(node => {
        ;(node.tags || []).forEach((tag: string) => {
          if (!clusters[tag]) clusters[tag] = []
          clusters[tag].push(node.title)
        })
      })
      const filtered = Object.entries(clusters)
        .filter(([_, notes]) => notes.length >= 3)
        .map(([tag, notes]) => ({ tag, count: notes.length, notes: notes.slice(0, 10) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
      return NextResponse.json(filtered)
    }

    if (action === 'search') {
      const query = (searchParams.get('q') || '').toLowerCase()
      const results = nodes
        .filter(n =>
          n.title.toLowerCase().includes(query) ||
          (n.tags || []).some((t: string) => t.toLowerCase().includes(query))
        )
        .slice(0, 20)
      return NextResponse.json(results)
    }

    return NextResponse.json({ stats, recent_nodes: nodes.slice(0, 10) })

  } catch (error: any) {
    console.error('Knowledge graph API error:', error)
    return NextResponse.json({
      stats: { total_nodes: 0, total_edges: 0, total_tags: 0 },
      nodes: [], edges: []
    }, { status: 500 })
  }
}
