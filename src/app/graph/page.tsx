'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  title: string
  tags: string[]
  total_links: number
  centrality: number
  size: number
  x?: number
  y?: number
}

interface GraphEdge {
  source: string
  target: string
  type: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  stats: {
    total_nodes: number
    total_edges: number
    total_tags: number
  }
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const fgRef = useRef<any>()

  useEffect(() => {
    loadGraph()
  }, [])

  async function loadGraph() {
    try {
      const res = await fetch('/api/knowledge-graph?action=full')
      const data = await res.json()

      const nodes = data.nodes.map((n: any) => ({
        ...n,
        val: Math.max(n.total_links * 2, 1),
        color: getNodeColor(n)
      }))

      setGraphData({ ...data, nodes })
    } catch (error) {
      console.error('Failed to load graph:', error)
    } finally {
      setLoading(false)
    }
  }

  function getNodeColor(node: GraphNode) {
    if (node.total_links === 0) return '#D97706' // Orphan (amber)
    if (node.total_links >= 10) return '#2563EB' // Hub (blue)
    if (node.total_links >= 5) return '#7C3AED' // Connected (purple)
    return '#9CA3AF' // Normal (gray)
  }

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)

    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000)
      fgRef.current.zoom(2, 1000)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading knowledge graph...</div>
  }

  if (!graphData) {
    return <div className="text-center py-12">Failed to load graph</div>
  }

  const filteredData = filter
    ? {
        nodes: graphData.nodes.filter(n =>
          n.title.toLowerCase().includes(filter.toLowerCase()) ||
          n.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
        ),
        links: graphData.edges.filter(e => {
          const sourceMatches = graphData.nodes.find(n => n.id === e.source &&
            (n.title.toLowerCase().includes(filter.toLowerCase()) ||
             n.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))))
          const targetMatches = graphData.nodes.find(n => n.id === e.target &&
            (n.title.toLowerCase().includes(filter.toLowerCase()) ||
             n.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))))
          return sourceMatches || targetMatches
        })
      }
    : { nodes: graphData.nodes, links: graphData.edges }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b border-cream-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Knowledge Graph</h1>
          <div className="text-sm text-warm-muted">
            {filteredData.nodes.length} nodes — {filteredData.links.length} edges
          </div>
        </div>

        <input
          type="text"
          placeholder="Filter by note title or tag..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-white text-warm-text px-4 py-2 rounded-lg border border-cream-200 focus:border-blue-500 focus:outline-none"
        />

        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-warm-muted">Hub (≥10 links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-warm-muted">Connected (5-9 links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-warm-muted">Normal (1-4 links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-warm-muted">Orphan (0 links)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <ForceGraph2D
          ref={fgRef}
          graphData={filteredData}
          nodeLabel="title"
          nodeAutoColorBy="color"
          nodeVal="val"
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={handleNodeClick}
          backgroundColor="#FFFBF5"
          linkColor={() => '#E8E0D8'}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.title
            const fontSize = 12/globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            ctx.fillStyle = node.color
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false)
            ctx.fill()

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#1A1A1A'
            ctx.fillText(label.substring(0, 20), node.x, node.y + node.val + fontSize)
          }}
        />

        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{selectedNode.title}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-warm-muted hover:text-warm-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-muted">Total Links:</span>
                <span className="font-medium">{selectedNode.total_links}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-muted">Centrality:</span>
                <span className="font-medium">{selectedNode.centrality}</span>
              </div>
              {selectedNode.tags.length > 0 && (
                <div>
                  <div className="text-warm-muted mb-2">Tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
