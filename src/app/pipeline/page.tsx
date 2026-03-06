import { createClient } from '@supabase/supabase-js'
import PipelineClient from './PipelineClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PipelinePage() {
  let content: any[] = []
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const { data } = await supabase.from('mc_content').select('*').order('created_at', { ascending: false })
    content = data || []
  }
  return <PipelineClient content={content} />
}
