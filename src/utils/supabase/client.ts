import { createBrowserClient } from '@supabase/ssr'
import { mockSupabase } from './mockClient'

export function createClient() {
  const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-supabase-project-id') || 
                 !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-supabase-project-id.supabase.co'

  if (isMock) {
    return mockSupabase as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
