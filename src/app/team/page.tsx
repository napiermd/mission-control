import { getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getTeam() {
  return getTeamMembers()
}

export default async function TeamPage() {
  const team = await getTeam()

  const statusColors: Record<string, string> = {
    WORKING: 'text-green-400 bg-green-900 border-green-500',
    IDLE: 'text-yellow-400 bg-yellow-900 border-yellow-500',
    OFFLINE: 'text-gray-400 bg-gray-700 border-gray-500',
  }

  const departments: string[] = Array.from(new Set(team.map((m: any) => m.department)))

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👥 Team</h1>
        <div className="text-gray-400">{team.length} members</div>
      </div>

      {/* Status Overview */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Status Overview</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Working:</span>
            <span className="font-bold text-green-400">
              {team.filter((m: any) => m.status === 'WORKING').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Idle:</span>
            <span className="font-bold text-yellow-400">
              {team.filter((m: any) => m.status === 'IDLE').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-gray-400">Offline:</span>
            <span className="font-bold text-gray-400">
              {team.filter((m: any) => m.status === 'OFFLINE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Department Groups */}
      {departments.map(dept => {
        const deptMembers = team.filter((m: any) => m.department === dept)
        return (
          <div key={dept} className="card mb-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
              {dept} ({deptMembers.length})
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {deptMembers.map((member: any) => (
                <div key={member.id} className="p-4 bg-gray-800 rounded-lg flex gap-4">
                  <div className="text-4xl">{member.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.role}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${statusColors[member.status] || statusColors.OFFLINE}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Current Task</div>
                      <div className="text-sm text-gray-300">{member.currentTask}</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 uppercase mb-1">Responsibilities</div>
                      <div className="text-xs text-gray-400">{member.responsibilities}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
