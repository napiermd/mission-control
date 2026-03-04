import { getLearnings } from '@/lib/queries'
import LearningClient from './LearningClient'

export const dynamic = 'force-dynamic'

export default async function LearningPage() {
  const learnings = await getLearnings(90)

  return <LearningClient learnings={learnings as any} />
}
