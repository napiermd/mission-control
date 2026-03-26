"use client"

import { useMemo, useState } from "react"

type CalEvent = {
  id: string
  title: string
  time: string | null
  color: string | null
  source: string | null
  recurrence: string | null
  description?: string | null
}

type ViewMode = "month" | "week" | "day"

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  blue: { bg: "bg-blue-900/30", text: "text-blue-400", dot: "bg-blue-400" },
  green: { bg: "bg-green-900/30", text: "text-green-400", dot: "bg-green-400" },
  purple: { bg: "bg-purple-900/30", text: "text-purple-400", dot: "bg-purple-400" },
  yellow: { bg: "bg-amber-900/30", text: "text-amber-400", dot: "bg-yellow-400" },
  red: { bg: "bg-red-900/30", text: "text-red-400", dot: "bg-red-400" },
  gray: { bg: "bg-space-panel", text: "text-hud-muted", dot: "bg-gray-400" },
}

function getColor(c: string | null) {
  return categoryColors[c || "gray"] || categoryColors.gray
}

function startOfWeek(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6am-9pm

export default function CalendarClient({ events }: { events: CalEvent[] }) {
  const [view, setView] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  // Navigation
  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === "month") d.setMonth(d.getMonth() + dir)
    else if (view === "week") d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  // Parse event time to hour (for day/week grid)
  const parseHour = (time: string | null): number | null => {
    if (!time) return null
    const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i)
    if (!match) return null
    let h = parseInt(match[1])
    if (match[3]?.toLowerCase() === "pm" && h < 12) h += 12
    if (match[3]?.toLowerCase() === "am" && h === 12) h = 0
    return h
  }

  // Match events to a day of week (for recurring)
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const dayAbbrev = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  const eventsForDate = (date: Date): CalEvent[] => {
    const dayOfWeek = dayNames[date.getDay()]
    const abbrev = dayAbbrev[date.getDay()]
    return events.filter((e) => {
      if (e.recurrence) {
        const rec = e.recurrence.toLowerCase()
        return rec.includes(dayOfWeek) || rec.includes(abbrev) || rec === "daily" || rec === "weekdays" && date.getDay() >= 1 && date.getDay() <= 5
      }
      return false // non-recurring match by date would go here
    })
  }

  // MONTH VIEW
  const renderMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const totalDays = daysInMonth(year, month)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1 // Monday start

    const cells: { day: number | null; date: Date | null }[] = []
    for (let i = 0; i < startOffset; i++) cells.push({ day: null, date: null })
    for (let d = 1; d <= totalDays; d++) cells.push({ day: d, date: new Date(year, month, d) })
    while (cells.length % 7 !== 0) cells.push({ day: null, date: null })

    return (
      <div>
        <div className="grid grid-cols-7 gap-px mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs text-hud-muted py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {cells.map((cell, i) => {
            const dayEvents = cell.date ? eventsForDate(cell.date) : []
            const isToday = cell.date && `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}` === todayStr
            return (
              <div
                key={i}
                className={`min-h-[90px] p-1.5 rounded ${cell.day ? "bg-space-dark hover:bg-space-panel" : "bg-transparent"} ${isToday ? "ring-1 ring-hud-amber" : ""} cursor-pointer transition-colors`}
                onClick={() => {
                  if (cell.date) {
                    setCurrentDate(cell.date)
                    setView("day")
                  }
                }}
              >
                {cell.day && (
                  <>
                    <div className={`text-xs mb-1 ${isToday ? "text-blue-400 font-bold" : "text-hud-muted"}`}>{cell.day}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => {
                        const c = getColor(e.color)
                        return (
                          <div
                            key={e.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate ${c.bg} ${c.text}`}
                            onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e) }}
                          >
                            {e.time && <span className="opacity-70">{e.time.split(":").slice(0, 2).join(":")} </span>}
                            {e.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-hud-muted">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // WEEK VIEW
  const renderWeek = () => {
    const weekStart = startOfWeek(currentDate)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px min-w-[700px]">
          {/* Header */}
          <div className="p-2 text-xs text-hud-muted" />
          {days.map((d) => {
            const isToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === todayStr
            return (
              <div key={d.toISOString()} className={`p-2 text-center ${isToday ? "bg-blue-900/30 rounded" : ""}`}>
                <div className="text-xs text-hud-muted">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className={`text-sm font-bold ${isToday ? "text-blue-400" : "text-hud-text"}`}>{d.getDate()}</div>
              </div>
            )
          })}
          {/* Time rows */}
          {HOURS.map((hour) => (
            <>
              <div key={`h-${hour}`} className="p-1 text-[10px] text-hud-muted/70 text-right pr-2 border-t border-space-border">
                {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
              </div>
              {days.map((d) => {
                const dayEvts = eventsForDate(d).filter((e) => parseHour(e.time) === hour)
                return (
                  <div key={`${d.toISOString()}-${hour}`} className="border-t border-space-border min-h-[36px] p-0.5">
                    {dayEvts.map((e) => {
                      const c = getColor(e.color)
                      return (
                        <div
                          key={e.id}
                          className={`text-[10px] px-1.5 py-1 rounded cursor-pointer ${c.bg} ${c.text} hover:brightness-125`}
                          onClick={() => setSelectedEvent(e)}
                        >
                          {e.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    )
  }

  // DAY VIEW
  const renderDay = () => {
    const dayEvts = eventsForDate(currentDate)
    const isToday = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}` === todayStr

    return (
      <div>
        <div className={`text-center mb-4 ${isToday ? "text-blue-400" : "text-hud-text"}`}>
          <div className="text-2xl font-bold">{currentDate.getDate()}</div>
          <div className="text-sm text-hud-muted">{currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", year: "numeric" })}</div>
        </div>
        <div className="space-y-px">
          {HOURS.map((hour) => {
            const hourEvts = dayEvts.filter((e) => parseHour(e.time) === hour)
            return (
              <div key={hour} className="flex gap-2 min-h-[48px]">
                <div className="w-16 text-right text-xs text-hud-muted/70 pt-1 shrink-0">
                  {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                </div>
                <div className="flex-1 border-t border-space-border pt-1">
                  {hourEvts.map((e) => {
                    const c = getColor(e.color)
                    return (
                      <div
                        key={e.id}
                        className={`p-2 rounded cursor-pointer mb-1 ${c.bg} ${c.text} hover:brightness-125`}
                        onClick={() => setSelectedEvent(e)}
                      >
                        <div className="text-sm font-medium">{e.title}</div>
                        <div className="text-xs opacity-70">{e.time} · {e.source}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* All day events */}
        {dayEvts.filter((e) => !parseHour(e.time)).length > 0 && (
          <div className="mt-6 card">
            <h3 className="text-sm font-semibold text-hud-muted mb-2">All Day / Unscheduled</h3>
            <div className="space-y-2">
              {dayEvts.filter((e) => !parseHour(e.time)).map((e) => {
                const c = getColor(e.color)
                return (
                  <div key={e.id} className={`p-3 rounded cursor-pointer ${c.bg} ${c.text}`} onClick={() => setSelectedEvent(e)}>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs opacity-70">{e.recurrence} · {e.source}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-hud-muted text-sm mt-1">{events.length} events · {events.filter((e) => e.recurrence).length} recurring</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded text-xs bg-space-panel text-hud-muted hover:bg-space-panel">Today</button>
          <div className="flex gap-1">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded text-xs capitalize ${view === v ? "bg-hud-amber text-space-black" : "bg-space-panel text-hud-muted hover:bg-space-panel"}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-space-panel rounded hover:bg-space-panel text-hud-muted">←</button>
        <div className="text-lg font-semibold">
          {view === "month" && currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          {view === "week" && `${fmt(startOfWeek(currentDate))} – ${fmt((() => { const d = startOfWeek(currentDate); d.setDate(d.getDate() + 6); return d })())}`}
          {view === "day" && fmtDay(currentDate)}
        </div>
        <button onClick={() => navigate(1)} className="p-2 bg-space-panel rounded hover:bg-space-panel text-hud-muted">→</button>
      </div>

      {/* View */}
      <div className="card">
        {view === "month" && renderMonth()}
        {view === "week" && renderWeek()}
        {view === "day" && renderDay()}
      </div>

      {/* Color Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(categoryColors).map(([name, c]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <span className="text-xs text-hud-muted capitalize">{name}</span>
          </div>
        ))}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                <div className="text-sm text-hud-muted mt-1">{selectedEvent.time} · {selectedEvent.source}</div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-hud-muted hover:text-hud-amber text-xl">×</button>
            </div>
            {selectedEvent.recurrence && (
              <div className="text-sm text-hud-muted mb-2">🔄 {selectedEvent.recurrence}</div>
            )}
            {selectedEvent.description && (
              <div className="text-sm text-hud-text mb-4">{selectedEvent.description}</div>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getColor(selectedEvent.color).dot}`} />
              <span className="text-sm text-hud-muted capitalize">{selectedEvent.color || "gray"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
