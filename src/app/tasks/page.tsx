import { getTasks as fetchTasks } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getTasks() {
  return fetchTasks()
}

export default async function TasksPage() {
  const tasks = await getTasks()
  
  const columns = [
    { id: 'TODO', label: 'To Do', color: 'gray' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
    { id: 'DONE', label: 'Done', color: 'green' },
  ]

  const getPriorityClass = (p: string) => {
    switch (p) {
      case 'URGENT': return 'border-l-4 border-red-500'
      case 'HIGH': return 'border-l-4 border-yellow-500'
      case 'MEDIUM': return 'border-l-4 border-blue-500'
      default: return 'border-l-4 border-gray-600'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">✅ Task Board</h1>
        <div className="text-gray-400">{tasks.length} total tasks</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.id} className="card">
            <h2 className={`text-lg font-semibold mb-4 pb-2 border-b border-gray-700 ${
              column.color === 'gray' ? 'text-gray-300' :
              column.color === 'blue' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {column.label} ({tasks.filter((t: any) => t.status === column.id).length})
            </h2>
            <div className="space-y-3">
              {tasks.filter((t: any) => t.status === column.id).map((task: any) => (
                <div
                  key={task.id}
                  className={`p-4 bg-gray-800 rounded-lg ${getPriorityClass(task.priority)}`}
                >
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</div>
                  )}
                  {task.link && (
                    <div className="mt-2">
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-300 hover:text-blue-200 underline"
                      >
                        Open in Obsidian
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'URGENT' ? 'bg-red-900 text-red-300' :
                      task.priority === 'HIGH' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">{task.assignee}</span>
                  </div>
                </div>
              ))}
              {tasks.filter((t: any) => t.status === column.id).length === 0 && (
                <div className="text-gray-500 text-center py-8">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
