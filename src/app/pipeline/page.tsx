import { getContentItems } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getContent() {
  return getContentItems()
}

export default async function PipelinePage() {
  const content = await getContent()
  
  const stages = [
    { id: 'IDEA', label: '💡 Ideas', color: 'gray' },
    { id: 'SCRIPT', label: '📝 Script', color: 'purple' },
    { id: 'THUMBNAIL', label: '🖼️ Thumbnail', color: 'yellow' },
    { id: 'FILMING', label: '🎬 Filming', color: 'blue' },
    { id: 'PUBLISHED', label: '✅ Published', color: 'green' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📺 Content Pipeline</h1>
        <div className="text-gray-400">{content.length} total items</div>
      </div>

      {/* Pipeline Overview */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Pipeline Progress</h2>
        <div className="flex gap-4">
          {stages.map(stage => {
            const count = content.filter((c: any) => c.stage === stage.id).length
            const pct = content.length > 0 ? Math.round((count / content.length) * 100) : 0
            return (
              <div key={stage.id} className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{stage.label}</span>
                  <span className={stage.color === 'green' ? 'text-green-400' : stage.color === 'blue' ? 'text-blue-400' : stage.color === 'purple' ? 'text-purple-400' : stage.color === 'yellow' ? 'text-yellow-400' : 'text-gray-400'}>{count}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stage.color === 'green' ? 'bg-green-500' :
                      stage.color === 'blue' ? 'bg-blue-500' :
                      stage.color === 'purple' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Cards by Stage */}
      <div className="space-y-6">
        {stages.map(stage => {
          const items = content.filter((c: any) => c.stage === stage.id)
          if (items.length === 0) return null
          return (
            <div key={stage.id} className="card">
              <h2 className={`text-lg font-semibold mb-4 pb-2 border-b border-gray-700 ${
                stage.color === 'green' ? 'text-green-400' :
                stage.color === 'blue' ? 'text-blue-400' :
                stage.color === 'purple' ? 'text-purple-400' :
                stage.color === 'yellow' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {stage.label} ({items.length})
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {items.map((item: any) => (
                  <div key={item.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="font-medium">{item.title}</div>
                    {item.script && (
                      <div className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {item.script}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-2">📝 {item.notes}</div>
                    )}
                    {item.publishedAt && (
                      <div className="text-xs text-green-400 mt-2">
                        Published: {new Date(item.publishedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
