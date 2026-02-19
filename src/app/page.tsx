import Link from 'next/link'

async function getTasks() {
  try {
    const res = await fetch('http://localhost:3000/api/tasks', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getContent() {
  try {
    const res = await fetch('http://localhost:3000/api/content', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getTeam() {
  try {
    const res = await fetch('http://localhost:3000/api/team', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getMemories() {
  try {
    const res = await fetch('http://localhost:3000/api/memories', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getCalendar() {
  try {
    const res = await fetch('http://localhost:3000/api/calendar', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function Dashboard() {
  const [tasks, content, team, memories, calendar] = await Promise.all([
    getTasks(),
    getContent(),
    getTeam(),
    getMemories(),
    getCalendar(),
  ])

  const todoTasks = tasks.filter((t: any) => t.status === 'TODO').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE').length
  
  const contentByStage = content.reduce((acc: any, c: any) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1
    return acc
  }, {})
  
  const workingAgents = team.filter((m: any) => m.status === 'WORKING').length

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome back, Commander</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-gray-400 text-sm">Pending Tasks</div>
          <div className="text-3xl font-bold text-yellow-400">{todoTasks}</div>
          <div className="text-xs text-gray-500 mt-2">of {tasks.length} total</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">In Progress</div>
          <div className="text-3xl font-bold text-blue-400">{inProgressTasks}</div>
          <div className="text-xs text-gray-500 mt-2">active now</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Content Items</div>
          <div className="text-3xl font-bold text-purple-400">{content.length}</div>
          <div className="text-xs text-gray-500 mt-2">{contentByStage.PUBLISHED || 0} published</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Active Agents</div>
          <div className="text-3xl font-bold text-green-400">{workingAgents}</div>
          <div className="text-xs text-gray-500 mt-2">of {team.length} team</div>
        </div>
      </div>

      {/* Quick Preview Sections */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✅ Recent Tasks
          </h2>
          <div className="space-y-3">
            {tasks.slice(0, 4).map((task: any) => (
              <div key={task.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className={task.priority === 'URGENT' ? 'text-red-400' : task.priority === 'HIGH' ? 'text-yellow-400' : 'text-gray-300'}>
                  {task.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.status === 'DONE' ? 'bg-green-900 text-green-400' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-900 text-blue-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/tasks" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
            → View all tasks
          </Link>
        </div>

        {/* Team Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            👥 Team Status
          </h2>
          <div className="space-y-3">
            {team.slice(0, 4).map((member: any) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="text-2xl">{member.avatar}</span>
                <div className="flex-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-400">{member.currentTask}</div>
                </div>
                <span className={`text-xs ${
                  member.status === 'WORKING' ? 'text-green-400' :
                  member.status === 'IDLE' ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/team" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
            → View full team
          </Link>
        </div>

        {/* Content Pipeline */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📺 Content Pipeline
          </h2>
          <div className="grid grid-cols-5 gap-2 text-center">
            {['IDEA', 'SCRIPT', 'THUMBNAIL', 'FILMING', 'PUBLISHED'].map(stage => (
              <div key={stage} className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xl font-bold">{contentByStage[stage] || 0}</div>
                <div className="text-xs text-gray-400">{stage}</div>
              </div>
            ))}
          </div>
          <Link href="/pipeline" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
            → View pipeline
          </Link>
        </div>

        {/* Calendar */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📅 Today's Schedule
          </h2>
          <div className="space-y-2">
            {calendar.slice(0, 4).map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-sm w-16">{event.time}</div>
                <div className="flex-1 truncate">{event.title}</div>
              </div>
            ))}
          </div>
          <Link href="/calendar" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
            → View calendar
          </Link>
        </div>
      </div>

      {/* Memory Quick View */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🧠 Recent Memories
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {memories.slice(0, 4).map((memory: any) => (
            <div key={memory.id} className="p-3 bg-gray-800 rounded-lg">
              <span className="text-xs text-purple-400 uppercase">{memory.type}</span>
              <p className="text-sm mt-1 text-gray-300 line-clamp-2">{memory.content}</p>
            </div>
          ))}
        </div>
        <Link href="/memory" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
          → Browse memory
        </Link>
      </div>
    </div>
  )
}
