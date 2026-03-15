import { NextResponse } from 'next/server'

// In production, read from static JSON file deployed with the app
// In local dev, could read from filesystem, but for consistency use static file
const GRAPH_URL = '/data/knowledge-graph.json'

async function loadGraph() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  
  const url = `${baseUrl}${GRAPH_URL}`
  const response = await fetch(url, { cache: 'no-store' })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.statusText}`)
  }
  
  return response.json()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const graph = await loadGraph()

    if (action === 'full') {
      return NextResponse.json(graph)
    }

    if (action === 'stats') {
      return NextResponse.json(graph.stats || {
        total_nodes: graph.nodes?.length || 0,
        total_edges: graph.edges?.length || 0,
        total_tags: graph.tags?.length || 0
      })
    }

    if (action === 'hubs') {
      const minLinks = parseInt(searchParams.get('min') || '5')
      const hubs = (graph.nodes || [])
        .filter((n: any) => n.total_links >= minLinks)
        .sort((a: any, b: any) => b.total_links - a.total_links)
        .slice(0, 20)
      
      return NextResponse.json(hubs)
    }

    if (action === 'orphans') {
      const orphans = (graph.nodes || [])
        .filter((n: any) => n.total_links === 0)
        .slice(0, 50)
      
      return NextResponse.json(orphans)
    }

    if (action === 'clusters') {
      // Group by tags
      const clusters: Record<string, string[]> = {}
      
      ;(graph.nodes || []).forEach((node: any) => {
        ;(node.tags || []).forEach((tag: string) => {
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
      
      const results = (graph.nodes || [])
        .filter((n: any) => 
          n.title.toLowerCase().includes(query) ||
          (n.tags || []).some((t: string) => t.toLowerCase().includes(query))
        )
        .slice(0, 20)

      return NextResponse.json(results)
    }

    // Default: return summary
    return NextResponse.json({
      stats: graph.stats || {
        total_nodes: graph.nodes?.length || 0,
        total_edges: graph.edges?.length || 0,
        total_tags: graph.tags?.length || 0
      },
      recent_nodes: (graph.nodes || []).slice(0, 10)
    })

  } catch (error: any) {
    console.error('Knowledge graph API error:', error)
    return NextResponse.json({ 
      error: error.message,
      // Fallback data structure
      stats: { total_nodes: 0, total_edges: 0, total_tags: 0 },
      nodes: [],
      edges: []
    }, { status: 500 })
  }
}
