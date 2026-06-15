import { createBrowserClient } from '@supabase/ssr'
import { mockSupabase } from './mockClient'

export function createClient() {
  // Set to true to run in local mock database mode for presentations/demos.
  // Set to false when connecting to a real Supabase backend.
  const isMock = true

  if (isMock) {
    return mockSupabase as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
