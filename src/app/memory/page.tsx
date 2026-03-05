import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function fetchMemories() {
  // Fetch via internal API to avoid any SSR caching issues
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${baseUrl}/api/memories`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map((m: any) => ({
      ...m,
      type: typeof m.type === 'string' ? m.type.toUpperCase() : m.type
    }))
  } catch (e) {
    console.error('Failed to fetch memories:', e)
    return []
  }
}

export default async function MemoryPage() {
  const memories = await fetchMemories()
  return <MemoryClient memories={memories} />
}
