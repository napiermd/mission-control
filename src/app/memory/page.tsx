import { getMemories as fetchMemories } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getMemories() {
  return fetchMemories()
}

export default async function MemoryPage() {
  const memories = await getMemories()

  const typeColors: Record<string, string> = {
    DAILY: 'text-blue-400 bg-blue-900',
    PREFERENCE: 'text-purple-400 bg-purple-900',
    LEARNING: 'text-green-400 bg-green-900',
    DECISION: 'text-yellow-400 bg-yellow-900',
    PERSON: 'text-pink-400 bg-pink-900',
    PROJECT: 'text-orange-400 bg-orange-900',
  }

  const types: string[] = Array.from(new Set(memories.map((m: any) => m.type)))

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🧠 Memory Bank</h1>
        <div className="text-gray-400">{memories.length} memories</div>
      </div>

      {/* Memory Types */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Memory Categories</h2>
        <div className="flex flex-wrap gap-3">
          {types.map(type => {
            const count = memories.filter((m: any) => m.type === type).length
            return (
              <span
                key={type}
                className={`px-3 py-2 rounded-lg text-sm ${typeColors[type] || 'text-gray-400 bg-gray-700'}`}
              >
                {type} ({count})
              </span>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">🔍 Search Memories</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by keyword..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-2 gap-6">
        {memories.map((memory: any) => (
          <div key={memory.id} className="card hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs ${typeColors[memory.type] || 'text-gray-400 bg-gray-700'}`}>
                {memory.type}
              </span>
              {memory.category && (
                <span className="text-xs text-gray-500">#{memory.category}</span>
              )}
            </div>
            <p className="text-gray-200">{memory.content}</p>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
              <span className="text-xs text-gray-500">Source: {memory.source}</span>
              <span className="text-xs text-gray-500">
                {new Date(memory.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {memories.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🧠</div>
          <div className="text-gray-400">No memories yet</div>
        </div>
      )}
    </div>
  )
}
