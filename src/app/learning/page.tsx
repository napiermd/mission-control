import LearningClient from './LearningClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function fetchLearnings() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${baseUrl}/api/learnings?days=90`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (e) {
    console.error('Failed to fetch learnings:', e)
    return []
  }
}

export default async function LearningPage() {
  const learnings = await fetchLearnings()
  return <LearningClient learnings={learnings as any} />
}
