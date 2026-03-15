'use client'

import { useEffect, useState, useRef } from 'react'

interface GraphNode {
  id: string
  title: string
  tags: string[]
  total_links: number
  centrality: number
  size: number
}

interface GraphStats {
  total_nodes: number
  total_edges: number
  total_tags: number
}

interface Hub {
  title: string
  total_links: number
  tags: string[]
}

interface Cluster {
  tag: string
  count: number
  notes: string[]
}

export default function KnowledgeGraphPage() {
  const [stats, setStats] = useState<GraphStats | null>(null)
  const [hubs, setHubs] = useState<Hub[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [orphans, setOrphans] = useState<GraphNode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GraphNode[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [statsRes, hubsRes, clustersRes, orphansRes] = await Promise.all([
        fetch('/api/knowledge-graph?action=stats'),
        fetch('/api/knowledge-graph?action=hubs&min=5'),
        fetch('/api/knowledge-graph?action=clusters'),
        fetch('/api/knowledge-graph?action=orphans')
      ])

      setStats(await statsRes.json())
      setHubs(await hubsRes.json())
      setClusters(await clustersRes.json())
      setOrphans(await orphansRes.json())
    } catch (error) {
      console.error('Failed to load knowledge graph:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (!query) {
      setSearchResults([])
      return
    }

    try {
      const res = await fetch(`/api/knowledge-graph?action=search&q=${encodeURIComponent(query)}`)
      const results = await res.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading knowledge graph...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Knowledge Graph</h1>
        <div className="text-sm text-gray-400">
          Obsidian Vault Analysis
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-gray-400 text-sm">Total Notes</div>
            <div className="text-3xl font-bold">{stats.total_nodes}</div>
            <div className="text-xs text-gray-500 mt-2">in vault</div>
          </div>
          <div className="card">
            <div className="text-gray-400 text-sm">Connections</div>
            <div className="text-3xl font-bold text-blue-400">{stats.total_edges}</div>
            <div className="text-xs text-gray-500 mt-2">wikilinks</div>
          </div>
          <div className="card">
            <div className="text-gray-400 text-sm">Tags</div>
            <div className="text-3xl font-bold text-purple-400">{stats.total_tags}</div>
            <div className="text-xs text-gray-500 mt-2">unique</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card mb-8">
        <input
          type="text"
          placeholder="Search notes by title or tag..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((note, idx) => (
              <div key={idx} className="p-3 bg-gray-800/50 rounded">
                <div className="font-medium">{note.title}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {note.total_links} links • {note.tags.length} tags
                </div>
                {note.tags.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {note.tags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Hub Notes */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Hub Notes</h2>
          <div className="text-sm text-gray-400 mb-4">
            Most connected notes in your vault
          </div>
          <div className="space-y-3">
            {hubs.map((hub, idx) => (
              <div key={idx} className="p-3 bg-gray-800/50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{hub.title}</div>
                  <div className="text-sm text-blue-400">{hub.total_links} links</div>
                </div>
                {hub.tags?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {hub.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tag Clusters */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Tag Clusters</h2>
          <div className="text-sm text-gray-400 mb-4">
            Groups of related notes
          </div>
          <div className="space-y-3">
            {clusters.map((cluster, idx) => (
              <div key={idx} className="p-3 bg-gray-800/50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-purple-400">#{cluster.tag}</div>
                  <div className="text-sm text-gray-400">{cluster.count} notes</div>
                </div>
                <div className="text-xs text-gray-500">
                  {cluster.notes.slice(0, 3).join(', ')}
                  {cluster.notes.length > 3 && ` +${cluster.notes.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orphan Notes */}
        <div className="card col-span-2">
          <h2 className="text-xl font-bold mb-4">Orphan Notes</h2>
          <div className="text-sm text-gray-400 mb-4">
            Notes with no connections (candidates for linking or archiving)
          </div>
          <div className="grid grid-cols-3 gap-3">
            {orphans.slice(0, 15).map((orphan, idx) => (
              <div key={idx} className="p-3 bg-gray-800/50 rounded text-sm">
                <div className="font-medium text-yellow-400">{orphan.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {orphan.tags.length > 0 ? `#${orphan.tags[0]}` : 'no tags'}
                </div>
              </div>
            ))}
          </div>
          {orphans.length > 15 && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              +{orphans.length - 15} more orphan notes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
