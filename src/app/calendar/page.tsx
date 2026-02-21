import { getCalendarEvents } from '@/lib/queries'

export const dynamic = 'force-dynamic'

async function getCalendar() {
  return getCalendarEvents()
}

export default async function CalendarPage() {
  const events = await getCalendar()

  const colors: Record<string, string> = {
    blue: 'bg-blue-900 text-blue-300 border-blue-500',
    green: 'bg-green-900 text-green-300 border-green-500',
    yellow: 'bg-yellow-900 text-yellow-300 border-yellow-500',
    purple: 'bg-purple-900 text-purple-300 border-purple-500',
    red: 'bg-red-900 text-red-300 border-red-500',
  }

  // Group events by recurrence pattern
  const recurring = events.filter((e: any) => e.recurrence)
  const oneTime = events.filter((e: any) => !e.recurrence)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📅 Calendar</h1>
        <div className="text-gray-400">{events.length} events</div>
      </div>

      {/* Calendar Grid View */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-gray-400 text-sm font-medium">{day}</div>
              <div className="text-xs text-gray-600 mt-1">
                {recurring.filter((e: any) => e.recurrence?.includes(day.toLowerCase())).length} events
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring Events */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">🔄 Recurring Events</h2>
        <div className="space-y-3">
          {recurring.map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl">🕐</div>
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-400">
                  {event.time} • {event.recurrence} • {event.source}
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${colors[event.color] || colors.blue}`}>
                {event.color}
              </span>
            </div>
          ))}
          {recurring.length === 0 && (
            <div className="text-gray-500 text-center py-8">No recurring events</div>
          )}
        </div>
      </div>

      {/* One-time Events */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">📌 One-time Events</h2>
        <div className="space-y-3">
          {oneTime.map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl">📅</div>
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-400">{event.time} • {event.source}</div>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${colors[event.color] || colors.blue}`}>
                {event.color}
              </span>
            </div>
          ))}
          {oneTime.length === 0 && (
            <div className="text-gray-500 text-center py-8">No one-time events</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 card">
        <h2 className="text-lg font-semibold mb-4">🎨 Event Colors</h2>
        <div className="flex gap-4">
          {Object.entries(colors).map(([color, classes]) => (
            <div key={color} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${classes.split(' ')[0]}`} />
              <span className="text-sm text-gray-400 capitalize">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
