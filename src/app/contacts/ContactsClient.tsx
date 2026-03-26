"use client"

import { useMemo, useState } from "react"

type Contact = {
  id: string
  name: string
  role: string | null
  category: string
  handle: string | null
  email: string | null
  timezone: string | null
  compensation: string | null
  notes: string | null
}

const categoryColors: Record<string, string> = {
  "Internal Team": "text-cyan-600 bg-cyan-50",
  "Content Team": "text-purple-600 bg-purple-50",
  "External": "text-green-600 bg-green-50",
  "Clients": "text-amber-600 bg-amber-50",
}

export default function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState("ALL")

  const categories = useMemo(() => Array.from(new Set(contacts.map((c) => c.category))).sort(), [contacts])

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (catFilter !== "ALL" && c.category !== catFilter) return false
      if (query) {
        const q = query.toLowerCase()
        return c.name.toLowerCase().includes(q) ||
          (c.role || "").toLowerCase().includes(q) ||
          (c.handle || "").toLowerCase().includes(q) ||
          (c.notes || "").toLowerCase().includes(q)
      }
      return true
    })
  }, [contacts, catFilter, query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contacts</h1>
        <p className="text-warm-muted text-sm mt-1">{contacts.length} contacts across {categories.length} categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" placeholder="Search contacts..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter("ALL")} className={`px-3 py-1.5 rounded text-xs ${catFilter === "ALL" ? "bg-blue-600 text-white" : "bg-cream-100 text-warm-muted hover:bg-cream-200"}`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded text-xs ${catFilter === cat ? (categoryColors[cat] || "bg-cream-200 text-warm-text") : "bg-cream-100 text-warm-muted hover:bg-cream-200"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card hover:border-cream-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-lg">{c.name}</div>
                {c.role && <div className="text-sm text-warm-muted">{c.role}</div>}
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryColors[c.category] || "text-warm-muted bg-cream-100"}`}>{c.category}</span>
            </div>
            <div className="space-y-1 text-sm">
              {c.handle && <div className="text-warm-text"><span className="text-warm-muted">Handle:</span> {c.handle}</div>}
              {c.email && <div className="text-warm-text"><span className="text-warm-muted">Email:</span> {c.email}</div>}
              {c.timezone && <div className="text-warm-text"><span className="text-warm-muted">TZ:</span> {c.timezone}</div>}
              {c.compensation && <div className="text-warm-text"><span className="text-warm-muted">Comp:</span> {c.compensation}</div>}
            </div>
            {c.notes && <div className="mt-3 pt-3 border-t border-cream-200 text-xs text-warm-muted">{c.notes}</div>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-warm-muted">{contacts.length === 0 ? "No contacts yet" : "No matching contacts"}</div>
          <div className="text-warm-muted text-sm mt-2">Add contacts via POST /api/contacts</div>
        </div>
      )}
    </div>
  )
}
