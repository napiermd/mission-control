import { getMemories as fetchMemories } from '@/lib/queries'
import MemoryClient from './MemoryClient'

export const dynamic = 'force-dynamic'

export default async function MemoryPage() {
  const memories = await fetchMemories()
  return <MemoryClient memories={memories as any} />
}
